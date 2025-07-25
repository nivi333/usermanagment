import * as request from 'supertest';
const app = require('../../index');
const { getTestToken } = require('../utils/auth-helpers');

describe('RBAC API Access Control', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Use helper to get JWTs for admin and user (implement getTestToken)
    adminToken = await getTestToken('admin');
    userToken = await getTestToken('user');
  });

  it('should allow admin to access /users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should deny non-admin access to /users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should deny unauthenticated access to /users', async () => {
    const res = await request(app)
      .get('/users');
    expect(res.status).toBe(401);
  });

  // Add more endpoint tests as needed
});
