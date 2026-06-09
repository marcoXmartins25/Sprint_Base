jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const { pool } = require('../../src/db');
const { makeToken } = require('../helpers/auth');

const PASSWORD = 'password123';
const HASH = bcrypt.hashSync(PASSWORD, 1); // low rounds for test speed

const USER_ROW = {
  id: 1,
  email: 'owner@acme.com',
  name: 'Alice',
  role: 'user',
  company_role: 'owner',
  company_id: 1,
  password_hash: HASH,
  avatar_url: null,
  company_name: 'Acme',
  company_plan: 'free',
};

describe('POST /api/auth/login', () => {
  it('200 + token on valid credentials', async () => {
    pool.query.mockResolvedValueOnce({ rows: [USER_ROW] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@acme.com', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('owner@acme.com');
    expect(res.body.user.companyRole).toBe('owner');
  });

  it('401 on wrong password', async () => {
    pool.query.mockResolvedValueOnce({ rows: [USER_ROW] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@acme.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid credentials/i);
  });

  it('401 on unknown email', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@acme.com', password: PASSWORD });

    expect(res.status).toBe(401);
  });

  it('400 when email missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: PASSWORD });

    expect(res.status).toBe(400);
  });

  it('400 when password missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@acme.com' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/verify', () => {
  const VERIFY_ROW = {
    id: 1,
    email: 'owner@acme.com',
    name: 'Alice',
    role: 'user',
    company_role: 'owner',
    company_id: 1,
    avatar_url: null,
    company_name: 'Acme',
    company_plan: 'free',
  };

  it('200 + user on valid token', async () => {
    pool.query.mockResolvedValueOnce({ rows: [VERIFY_ROW] });

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${makeToken(1)}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(1);
  });

  it('401 with no token', async () => {
    const res = await request(app).get('/api/auth/verify');
    expect(res.status).toBe(401);
  });

  it('401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });

  it('401 when user deleted after token issued', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${makeToken(999)}`);

    expect(res.status).toBe(401);
  });

  it('accepts token via query param', async () => {
    pool.query.mockResolvedValueOnce({ rows: [VERIFY_ROW] });

    const res = await request(app)
      .get(`/api/auth/verify?token=${makeToken(1)}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/health', () => {
  it('returns ok without auth', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
