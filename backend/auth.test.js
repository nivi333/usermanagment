require('dotenv').config();
const request = require('supertest');
const express = require('express');
let app;

beforeAll(() => {
  jest.resetModules();
  app = require('./index');
});

describe('Authentication & Authorization', () => {
  let token;
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(201);
  });

  it('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/register')
      .send({ email: 'weak@example.com', password: 'weak' });
    expect(res.statusCode).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'Password1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'WrongPass1' });
    expect(res.statusCode).toBe(401);
  });

  it('blocks access to protected endpoint without token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  it('allows access to protected endpoint with token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('refreshes token', async () => {
    const res = await request(app)
      .post('/refresh')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rate-limits excessive login attempts', async () => {
    for (let i = 0; i < 11; i++) {
      await request(app).post('/login').send({ email: 'test@example.com', password: 'WrongPass1' });
    }
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'WrongPass1' });
    expect(res.statusCode).toBe(429);
  });
});
