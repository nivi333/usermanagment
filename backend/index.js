const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const winston = require('winston');
require('dotenv').config();
const promClient = require('prom-client');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV || 'development']);

// Swagger UI setup
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');

const app = express();

// Serve Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Versioned API router
const apiV1 = express.Router();

// Winston logger (console only for now)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost', 'http://localhost:80'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Mount versioned API at /api/v1
app.use('/api/v1', apiV1);

// --- GET /users endpoint for admin user listing ---
apiV1.get('/users', authenticateJWT, requireRole(['admin']), async (req, res) => {

// --- PUT /users/:id endpoint for admin user update ---
apiV1.put('/users/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email(),
    role: Joi.string().valid(...ROLES)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { email, role } = value;
  try {
    const user = await knex('users').where({ id: req.params.id }).first();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const updates = {};
    if (email && email !== user.email) updates.email = email;
    if (role && role !== user.role) updates.role = role;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No changes provided.' });
    await knex('users').where({ id: req.params.id }).update(updates);
    // Audit log
    await knex('audit_logs').insert({
      user_id: req.params.id,
      action: 'user_update',
      old_role: user.role,
      new_role: role || user.role,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    const updated = await knex('users').where({ id: req.params.id }).first();
    res.json({ message: 'User updated.', user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (err) {
    logger.error('User update error:', err);
    res.status(500).json({ error: 'User update failed.' });
  }
});
  try {
    const users = await knex('users').select('id', 'email', 'role', 'created_at', 'updated_at').orderBy('id');
    res.json(users);
  } catch (err) {
    logger.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Could not fetch users.' });
  }
});

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' }
});

// Password policy (min 8 chars, 1 upper, 1 lower, 1 digit)
function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

// --- Password Reset Endpoints ---
const crypto = require('crypto');

// Request password reset
apiV1.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const user = await knex('users').where({ email }).first();
    if (!user) {
      // Respond with success to avoid user enumeration
      return res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
    }
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await knex('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });
    // In production, send email. For now, log the link:
    console.log(`[DEV] Password reset link: http://localhost:3000/reset-password?token=${token}`);
    res.status(200).json({ message: 'If the email exists, a reset link will be sent.' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ error: 'Could not process request.' });
  }
});

// Reset password
apiV1.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required.' });
  if (!validatePassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters, include upper, lower, and digit.' });
  }
  try {
    const reset = await knex('password_reset_tokens')
      .where({ token, used: false })
      .andWhere('expires_at', '>', new Date())
      .first();
    if (!reset) return res.status(400).json({ error: 'Invalid or expired token.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await knex('users').where({ id: reset.user_id }).update({ password: hashed });
    await knex('password_reset_tokens').where({ id: reset.id }).update({ used: true });
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Could not reset password.' });
  }
});

const ROLES = ['admin', 'manager', 'user'];


const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Registration endpoint
apiV1.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!validatePassword(password)) {
    console.error(`[REGISTER] Validation failed for email: ${email} - Password does not meet policy.`);
    return res.status(400).json({ error: 'Password must be at least 8 characters, include upper, lower, and digit.' });
  }
  try {
    const existing = await knex('users').where({ email }).first();
    if (existing) {
      console.error(`[REGISTER] Duplicate email attempted: ${email}`);
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await knex('users').insert({ email, password: hashed, role: 'user' });
    console.log(`[REGISTER] User created: ${email}`);
    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    console.error(`[REGISTER] Registration error for email ${email}:`, err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login endpoint with rate limiting
apiV1.post('/login', loginLimiter, async (req, res) => {
  console.log('[LOGIN ATTEMPT]', req.body);
  const { email, password } = req.body;
  try {
    const user = await knex('users').where({ email }).first();
    console.log('[LOGIN DEBUG] User found:', user);
    if (!user) {
      console.log('[LOGIN DEBUG] No user found for email:', email);
      // Audit log: failed login
      await knex('audit_logs').insert({
        user_id: null,
        action: 'login_failed',
        old_role: null,
        new_role: null,
        changed_by: email,
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({
          email,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || null
        })
      });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN DEBUG] Password match:', passwordMatch);
    if (!passwordMatch) {
      console.log('[LOGIN DEBUG] Password did not match for email:', email);
      // Audit log: failed login (wrong password)
      await knex('audit_logs').insert({
        user_id: user.id,
        action: 'login_failed',
        old_role: user.role,
        new_role: user.role,
        changed_by: email,
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({
          email,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || null
        })
      });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { id: user.id, sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    // Audit log: successful login
    await knex('audit_logs').insert({
      user_id: user.id,
      action: 'login_success',
      old_role: user.role,
      new_role: user.role,
      changed_by: email,
      timestamp: new Date().toISOString(),
      metadata: JSON.stringify({
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null
      })
    });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Middleware to protect endpoints
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// RBAC middleware
function requireRole(requiredRoles) {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// Admin-only: assign/modify user role
apiV1.post('/assign-role', authenticateJWT, requireRole(['admin']), async (req, res) => {

// --- RBAC Role CRUD Endpoints ---
// Create Role
apiV1.post('/roles', authenticateJWT, requireRole(['admin']), async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(32).required(),
    description: Joi.string().allow('').max(255)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const [roleId] = await knex('roles').insert({ name: value.name, description: value.description }).returning('id');
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'role_create',
      old_role: null,
      new_role: value.name,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.status(201).json({ id: roleId, ...value });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Role name must be unique.' });
    res.status(500).json({ error: 'Role creation failed.' });
  }
});

// List Roles
apiV1.get('/roles', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const roles = await knex('roles').select('*').orderBy('id');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve roles.' });
  }
});

// Update Role
apiV1.put('/roles/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(32),
    description: Joi.string().allow('').max(255)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const oldRole = await knex('roles').where({ id: req.params.id }).first();
    if (!oldRole) return res.status(404).json({ error: 'Role not found.' });
    await knex('roles').where({ id: req.params.id }).update(value);
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'role_update',
      old_role: oldRole.name,
      new_role: value.name || oldRole.name,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.json({ message: 'Role updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Role update failed.' });
  }
});

// Delete Role
apiV1.delete('/roles/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {

// --- RBAC Permission CRUD Endpoints ---
// Create Permission
apiV1.post('/permissions', authenticateJWT, requireRole(['admin']), async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(32).required(),
    description: Joi.string().allow('').max(255)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const [permissionId] = await knex('permissions').insert({ name: value.name, description: value.description }).returning('id');
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'permission_create',
      old_role: null,
      new_role: value.name,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.status(201).json({ id: permissionId, ...value });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Permission name must be unique.' });
    res.status(500).json({ error: 'Permission creation failed.' });
  }
});

// List Permissions
apiV1.get('/permissions', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const permissions = await knex('permissions').select('*').orderBy('id');
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve permissions.' });
  }
});

// Update Permission
apiV1.put('/permissions/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(32),
    description: Joi.string().allow('').max(255)
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const oldPermission = await knex('permissions').where({ id: req.params.id }).first();
    if (!oldPermission) return res.status(404).json({ error: 'Permission not found.' });
    await knex('permissions').where({ id: req.params.id }).update(value);
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'permission_update',
      old_role: oldPermission.name,
      new_role: value.name || oldPermission.name,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.json({ message: 'Permission updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Permission update failed.' });
  }
});

// Delete Permission
apiV1.delete('/permissions/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const oldPermission = await knex('permissions').where({ id: req.params.id }).first();
    if (!oldPermission) return res.status(404).json({ error: 'Permission not found.' });
    await knex('permissions').where({ id: req.params.id }).del();
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'permission_delete',
      old_role: oldPermission.name,
      new_role: null,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.json({ message: 'Permission deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Permission deletion failed.' });
  }
});

  try {
    const oldRole = await knex('roles').where({ id: req.params.id }).first();
    if (!oldRole) return res.status(404).json({ error: 'Role not found.' });
    await knex('roles').where({ id: req.params.id }).del();
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'role_delete',
      old_role: oldRole.name,
      new_role: null,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.json({ message: 'Role deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Role deletion failed.' });
  }
});

  const { userId, role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
  try {
    const user = await knex('users').where({ id: userId }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const oldRole = user.role;
    await knex('users').where({ id: userId }).update({ role });
    await knex('audit_logs').insert({
      user_id: userId,
      action: 'role_change',
      old_role: oldRole,
      new_role: role,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.json({ message: `Role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ error: 'Role update failed.' });
  }
});

// Admin-only: create new user
apiV1.post('/users', authenticateJWT, requireRole(['admin']), async (req, res) => {
  console.log('DEBUG: POST /users called', req.body);
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).required().messages({
      'string.pattern.base': 'Password must be at least 8 characters, include upper, lower, and digit.'
    }),
    role: Joi.string().valid(...ROLES).required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const { email, password, role } = value;
  try {
    await knex.transaction(async trx => {
      const existing = await trx('users').where({ email }).first();
      if (existing) {
        throw { status: 400, message: 'Email already exists.' };
      }
      const hashed = await bcrypt.hash(password, 10);
      const [userRow] = await trx('users').insert({ email, password: hashed, role }).returning('id');
      const userId = typeof userRow === 'object' && userRow !== null ? userRow.id : userRow;
      await trx('audit_logs').insert({
        user_id: userId || null,
        action: 'user_create',
        old_role: null,
        new_role: role,
        changed_by: req.user.email,
        timestamp: new Date().toISOString()
      });
    });
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    if (err && err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    console.error('User creation error:', err);
    res.status(500).json({ error: 'User creation failed.' });
  }
});

// Protected example endpoint
apiV1.get('/protected', authenticateJWT, requireRole(['admin', 'manager', 'user']), (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

// View audit log (admin only, with filtering, pagination, export, and access logging)
const { Parser: Json2csvParser } = require('json2csv');
apiV1.get('/audit-log', authenticateJWT, requireRole(['admin']), async (req, res) => {
  const { action, user, from, to, page = 1, pageSize = 50, exportFormat } = req.query;
  let query = knex('audit_logs').select('*');
  if (action) query = query.where('action', action);
  if (user) query = query.where('changed_by', user);
  if (from) query = query.where('timestamp', '>=', from);
  if (to) query = query.where('timestamp', '<=', to);
  const pageNum = Math.max(Number(page), 1);
  const size = Math.max(Number(pageSize), 1);
  const offset = (pageNum - 1) * size;

  // Count total for pagination
  const totalQuery = query.clone().clearSelect().count('* as total');
  let total = 0;
  try {
    const totalResult = await totalQuery;
    total = totalResult[0] ? Number(totalResult[0].total) : 0;
  } catch (err) {
    total = 0;
  }

  // Get paginated logs
  let logs = [];
  try {
    logs = await query.orderBy('timestamp', 'desc').limit(size).offset(offset);
  } catch (err) {
    return res.status(500).json({ error: 'Could not retrieve audit logs.' });
  }

  // Log this access event
  try {
    await knex('audit_logs').insert({
      user_id: req.user.sub,
      action: 'audit_log_access',
      old_role: req.user.role,
      new_role: req.user.role,
      changed_by: req.user.email,
      timestamp: new Date().toISOString(),
      metadata: JSON.stringify({
        filters: { action, user, from, to },
        exportFormat: exportFormat || 'json',
        page: pageNum,
        pageSize: size,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null
      })
    });
  } catch (err) {
    // Don't block response if audit log insert fails
  }

  // Export support
  if (exportFormat === 'csv') {
    try {
      const parser = new Json2csvParser();
      const csv = parser.parse(logs);
      res.header('Content-Type', 'text/csv');
      res.attachment('audit_logs.csv');
      return res.send(csv);
    } catch (err) {
      return res.status(500).json({ error: 'Could not export audit logs as CSV.' });
    }
  } else if (exportFormat === 'json') {
    res.header('Content-Type', 'application/json');
    res.attachment('audit_logs.json');
    return res.send(JSON.stringify(logs, null, 2));
  }

  // Default: paginated JSON
  res.json({
    data: logs,
    pagination: {
      page: pageNum,
      pageSize: size,
      total
    }
  });
});

// Token refresh endpoint (optional, for demo)
apiV1.post('/refresh', authenticateJWT, (req, res) => {
  const user = req.user;
  const newToken = jwt.sign(
    { sub: user.sub, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  res.json({ token: newToken });
});

const PORT = process.env.PORT || 3000;
const CERT_PATH = process.env.CERT_PATH || './certs/cert.pem';
const KEY_PATH = process.env.KEY_PATH || './certs/key.pem';

// --- Startup check: Ensure at least one admin exists ---
module.exports = app;

(async () => {
  try {
    const adminCount = await knex('users').where({ role: 'admin' }).count('id as count');
    if (!adminCount[0] || Number(adminCount[0].count) === 0) {
      logger.warn('No admin users found in the database! Please create an admin user immediately.');
    } else {
      logger.info(`Admin users found: ${adminCount[0].count}`);
    }
  } catch (err) {
    logger.error('Error running admin user startup check:', err);
  }
})();

if (require.main === module) {
  if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
    const cert = fs.readFileSync(CERT_PATH);
    const key = fs.readFileSync(KEY_PATH);
    https.createServer({ key, cert }, app).listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running with HTTPS on port ${PORT}`);
    });
  } else {
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Backend running with HTTP (dev only) on port ${PORT}`);
    });
    console.warn('Warning: HTTPS certs not found, running HTTP. For production, provide valid certs.');
  }
}

module.exports = app;
