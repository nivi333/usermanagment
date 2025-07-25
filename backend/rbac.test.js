require('dotenv').config();
const request = require('supertest');
const app = require('./index');

let adminToken;

beforeAll(async () => {
  // Register and login as admin
  await request(app).post('/register').send({ email: 'admin2@example.com', password: 'AdminPass1' });
  let login = await request(app).post('/login').send({ email: 'admin2@example.com', password: 'AdminPass1' });
  adminToken = login.body.token;
  await request(app)
    .post('/assign-role')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ userId: 2, role: 'admin' });
  // Login again to get admin token with updated role
  login = await request(app).post('/login').send({ email: 'admin2@example.com', password: 'AdminPass1' });
  adminToken = login.body.token;
  });

  it('logs audit entries for role and permission changes', async () => {
    // Get audit logs as admin
    const res = await request(app)
      .get('/audit-log')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Check for at least one role and one permission action
    const hasRoleLog = res.body.some(log => log.action && log.action.startsWith('role_'));
    const hasPermLog = res.body.some(log => log.action && log.action.startsWith('permission_'));
    expect(hasRoleLog).toBe(true);
    expect(hasPermLog).toBe(true);
  });

  it('prevents update/delete on audit_logs table (immutability)', async () => {
    const knex = require('knex')(require('./knexfile').development);
    // Try to update
    let error = null;
    try {
      await knex('audit_logs').update({ action: 'tampered' }).whereRaw('1=1');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    // Try to delete
    error = null;
    try {
      await knex('audit_logs').del().whereRaw('1=1');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    await knex.destroy();
  });
});

describe('RBAC Role & Permission Endpoints', () => {
  let roleId, permId;
  it('creates a new role', async () => {
    const res = await request(app)
      .post('/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'testrole', description: 'desc' });
    expect(res.statusCode).toBe(201);
    roleId = res.body.id;
  });
  it('lists roles', async () => {
    const res = await request(app)
      .get('/roles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('updates a role', async () => {
    const res = await request(app)
      .put(`/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'updated' });
    expect(res.statusCode).toBe(200);
  });
  it('deletes a role', async () => {
    const res = await request(app)
      .delete(`/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
  it('creates a new permission', async () => {
    const res = await request(app)
      .post('/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'testperm', description: 'desc' });
    expect(res.statusCode).toBe(201);
    permId = res.body.id;
  });
  it('lists permissions', async () => {
    const res = await request(app)
      .get('/permissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('updates a permission', async () => {
    const res = await request(app)
      .put(`/permissions/${permId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'updated' });
    expect(res.statusCode).toBe(200);
  });
  it('deletes a permission', async () => {
    const res = await request(app)
      .delete(`/permissions/${permId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});
