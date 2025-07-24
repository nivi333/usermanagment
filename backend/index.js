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

const app = express();

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
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:80'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

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
app.post('/request-password-reset', async (req, res) => {
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
app.post('/reset-password', async (req, res) => {
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
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!validatePassword(password)) {
    console.error(`[REGISTER] Validation failed for email: ${email} - Password does not meet policy.`);
    return res.status(400).json({ error: 'Password must be at least 8 characters, include upper, lower, and digit.' });
  }
  try {
    const existing = await knex('users').where({ email }).first();
    if (existing) {
      console.error(`[REGISTER] Duplicate email attempted: ${email}`);
      return res.status(400).json({ error: 'Registration failed.' });
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
app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await knex('users').where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ token });
  } catch (err) {
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
app.post('/assign-role', authenticateJWT, requireRole(['admin']), async (req, res) => {
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
app.post('/users', authenticateJWT, requireRole(['admin']), async (req, res) => {
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
    const existing = await knex('users').where({ email }).first();
    if (existing) {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [userId] = await knex('users').insert({ email, password: hashed, role }).returning('id');
    await knex('audit_logs').insert({
      user_id: userId || null,
      action: 'user_create',
      old_role: null,
      new_role: role,
      changed_by: req.user.email,
      timestamp: new Date().toISOString()
    });
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(500).json({ error: 'User creation failed.' });
  }
});

// Protected example endpoint
app.get('/protected', authenticateJWT, requireRole(['admin', 'manager', 'user']), (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

// View audit log (admin only)
app.get('/audit-log', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const logs = await knex('audit_logs').select('*').orderBy('timestamp', 'desc').limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve audit logs.' });
  }
});

// Token refresh endpoint (optional, for demo)
app.post('/refresh', authenticateJWT, (req, res) => {
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

if (require.main === module) {
  if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
    const cert = fs.readFileSync(CERT_PATH);
    const key = fs.readFileSync(KEY_PATH);
    https.createServer({ key, cert }, app).listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running with HTTPS on port ${PORT}`);
    });
  } else {
    app.listen(PORT, '0.0.0.0', () => console.log(`Backend running with HTTP (dev only) on port ${PORT}`));
    console.warn('Warning: HTTPS certs not found, running HTTP. For production, provide valid certs.');
  }
}

module.exports = app;
