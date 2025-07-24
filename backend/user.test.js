const request = require('supertest');
const express = require('express');
let app;

beforeAll(() => {
  jest.resetModules();
  app = require('./index');
});

describe('Admin User Creation', () => {
  let adminToken;
  beforeAll(async () => {
    // Register and login as admin
    await request(app)
      .post('/register')
      .send({ email: 'admin@example.com', password: 'AdminPass1' });
    // Promote to admin
    let login = await request(app)
      .post('/login')
      .send({ email: 'admin@example.com', password: 'AdminPass1' });
    adminToken = login.body.token;
    await request(app)
      .post('/assign-role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: 1, role: 'admin' });
    // Login again to get admin token with updated role
    login = await request(app)
      .post('/login')
      .send({ email: 'admin@example.com', password: 'AdminPass1' });
    adminToken = login.body.token;
  });

  it('creates a new user with valid input', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'newuser@example.com', password: 'Password1', role: 'user' });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User created successfully.');
  });

  it('rejects duplicate email', async () => {
    // Try to create the same user again
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'newuser@example.com', password: 'Password1', role: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Email already exists/);
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'weakpass@example.com', password: 'weak', role: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Password must be at least 8 characters/);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'not-an-email', password: 'Password1', role: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/must be a valid email/);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: '', password: '', role: '' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects non-admin access', async () => {
    // Register and login as normal user
    await request(app)
      .post('/register')
      .send({ email: 'normal@example.com', password: 'Password1' });
    const login = await request(app)
      .post('/login')
      .send({ email: 'normal@example.com', password: 'Password1' });
    const userToken = login.body.token;
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'failuser@example.com', password: 'Password1', role: 'user' });
    expect(res.statusCode).toBe(403);
  });
});
