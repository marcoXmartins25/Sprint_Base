jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));

const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db');
const { authHeader } = require('../helpers/auth');

const company = () =>
  pool.query.mockResolvedValueOnce({ rows: [{ company_id: 1, company_role: 'owner' }] });

const plan = (p = 'pro') =>
  pool.query.mockResolvedValueOnce({ rows: [{ plan: p, plan_expires_at: null }] });

const count = (n) =>
  pool.query.mockResolvedValueOnce({ rows: [{ count: String(n) }] });

const SPRINT_ROW = { rows: [{ id: 1 }] };
const TASK = { id: 1, title: 'Task A', sprint_id: 1, company_id: 1, status: 'to-do', priority: 'medium' };

describe('POST /api/tasks', () => {
  it('201 on valid task creation (pro plan)', async () => {
    company();
    pool.query.mockResolvedValueOnce(SPRINT_ROW); // sprint check
    plan('pro');                                   // getCompanyPlan for task limit
    plan('pro');                                   // getCompanyPlan for extra fields
    pool.query.mockResolvedValueOnce({ rows: [TASK] }); // INSERT

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader())
      .send({ sprint_id: 1, title: 'Task A' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Task A');
  });

  it('400 when sprint_id or title missing', async () => {
    company();

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader())
      .send({ title: 'No sprint' });

    expect(res.status).toBe(400);
  });

  it('404 when sprint not in company', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] }); // sprint not found

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader())
      .send({ sprint_id: 99, title: 'Task' });

    expect(res.status).toBe(404);
  });

  it('402 when free task limit reached', async () => {
    company();
    pool.query.mockResolvedValueOnce(SPRINT_ROW);
    plan('free');
    count(20); // at limit

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader())
      .send({ sprint_id: 1, title: 'Task 21' });

    expect(res.status).toBe(402);
    expect(res.body.upgrade).toBe(true);
  });

  it('402 when free plan tries to use extra fields', async () => {
    company();
    pool.query.mockResolvedValueOnce(SPRINT_ROW);
    plan('free');
    count(0); // below task limit
    plan('free'); // extra fields check

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader())
      .send({ sprint_id: 1, title: 'Task', deliverable: 'A deliverable' });

    expect(res.status).toBe(402);
    expect(res.body.fields).toContain('deliverable');
  });

  it('401 without token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ sprint_id: 1, title: 'Task' });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('200 + updated task', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [{ ...TASK, status: 'done' }] });

    const res = await request(app)
      .put('/api/tasks/1')
      .set(authHeader())
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('404 when task not found', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put('/api/tasks/99')
      .set(authHeader())
      .send({ status: 'done' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('200 on successful delete', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [TASK] });

    const res = await request(app)
      .delete('/api/tasks/1')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });

  it('404 when task not found', async () => {
    company();
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/tasks/99')
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});
