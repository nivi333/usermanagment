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
