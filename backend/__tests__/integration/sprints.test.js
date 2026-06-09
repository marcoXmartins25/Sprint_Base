jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));

const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db');
const { authHeader } = require('../helpers/auth');

// attachCompany always resolves to company 1, owner
const company = () =>
  pool.query.mockResolvedValueOnce({ rows: [{ company_id: 1, company_role: 'owner' }] });

// plan check helpers
const plan = (p = 'pro') =>
  pool.query.mockResolvedValueOnce({ rows: [{ plan: p, plan_expires_at: null }] });

const count = (n) =>
  pool.query.mockResolvedValueOnce({ rows: [{ count: String(n) }] });

const SPRINT = { id: 1, title: 'Sprint 1', start_date: '2026-06-01', end_date: '2026-06-14', company_id: 1, archived_at: null };

describe('GET /api/sprints', () => {
  it('200 + sprint list', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [SPRINT] });

    const res = await request(app)
      .get('/api/sprints')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Sprint 1');
  });

  it('401 without token', async () => {
    const res = await request(app).get('/api/sprints');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/sprints/:id', () => {
  it('200 + sprint', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [SPRINT] });

    const res = await request(app)
      .get('/api/sprints/1')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('404 for sprint belonging to another company', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/sprints/99')
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});

describe('POST /api/sprints', () => {
  it('201 + created sprint on pro plan', async () => {
    company();
    plan('pro');
    pool.query.mockResolvedValueOnce({ rows: [SPRINT] });

    const res = await request(app)
      .post('/api/sprints')
      .set(authHeader())
      .send({ title: 'Sprint 1', start_date: '2026-06-01', end_date: '2026-06-14' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Sprint 1');
  });

  it('402 when free plan sprint limit reached', async () => {
    company();
    plan('free');
    count(2); // at limit

    const res = await request(app)
      .post('/api/sprints')
      .set(authHeader())
      .send({ title: 'Sprint 3', start_date: '2026-06-01', end_date: '2026-06-14' });

    expect(res.status).toBe(402);
    expect(res.body.upgrade).toBe(true);
  });

  it('400 when required fields missing', async () => {
    company();

    const res = await request(app)
      .post('/api/sprints')
      .set(authHeader())
      .send({ title: 'Sprint 1' }); // no dates

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/sprints/:id', () => {
  it('200 + updated sprint', async () => {
    company();
    const updated = { ...SPRINT, title: 'Sprint Updated' };
    pool.query.mockResolvedValueOnce({ rows: [updated] });

    const res = await request(app)
      .put('/api/sprints/1')
      .set(authHeader())
      .send({ title: 'Sprint Updated' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Sprint Updated');
  });

  it('404 when sprint not found', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/sprints/99')
      .set(authHeader())
      .send({ title: 'x' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sprints/:id', () => {
  it('200 on successful delete', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [SPRINT] });

    const res = await request(app)
      .delete('/api/sprints/1')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sprint deleted');
  });

  it('404 when sprint not found', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/sprints/99')
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});

describe('GET /api/sprints/:id/tasks', () => {
  it('200 + task list', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [SPRINT] }); // sprint check
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Task A', sprint_id: 1 }] });

    const res = await request(app)
      .get('/api/sprints/1/tasks')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('Task A');
  });

  it('404 when sprint not found', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] }); // sprint check fails

    const res = await request(app)
      .get('/api/sprints/99/tasks')
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});
