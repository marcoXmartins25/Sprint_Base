jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));
jest.mock('../../src/emailService', () => ({
  sendInviteEmail: jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db');
const { authHeader } = require('../helpers/auth');

// verifyToken + attachCompany for team routes (team.js re-calls verifyToken + attachCompany internally)
const memberSession = (role = 'owner') =>
  pool.query.mockResolvedValueOnce({ rows: [{ company_id: 1, company_role: role }] });

const plan = (p = 'pro') =>
  pool.query.mockResolvedValueOnce({ rows: [{ plan: p, plan_expires_at: null }] });

const count = (n) =>
  pool.query.mockResolvedValueOnce({ rows: [{ count: String(n) }] });

const MEMBER = { id: 2, email: 'bob@acme.com', name: 'Bob', avatar_url: null, company_role: 'member', role: 'user', created_at: new Date().toISOString() };

describe('GET /api/team', () => {
  it('200 + team member list', async () => {
    // team.js calls verifyToken (no DB) + attachCompany (1 query)
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [MEMBER] });

    const res = await request(app)
      .get('/api/team')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body[0].email).toBe('bob@acme.com');
  });

  it('401 without token', async () => {
    const res = await request(app).get('/api/team');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/team/invite', () => {
  it('201 when owner invites new member', async () => {
    memberSession('owner');                              // attachCompany
    plan('pro');                                         // checkTeamMemberLimit plan
    count(2);                                            // member count
    pool.query.mockResolvedValueOnce({ rows: [] });      // existing user check
    pool.query.mockResolvedValueOnce({ rows: [] });      // existing invite check
    pool.query.mockResolvedValueOnce({ rows: [{ id: 10, email: 'new@acme.com', token: 'abc', role: 'member', expires_at: new Date() }] }); // INSERT invite
    pool.query.mockResolvedValueOnce({ rows: [{ name: 'Acme' }] }); // company name

    const res = await request(app)
      .post('/api/team/invite')
      .set(authHeader())
      .send({ email: 'new@acme.com', role: 'member' });

    expect(res.status).toBe(201);
    expect(res.body.invite.email).toBe('new@acme.com');
  });

  it('403 when member (not owner/admin) tries to invite', async () => {
    memberSession('member');

    const res = await request(app)
      .post('/api/team/invite')
      .set(authHeader())
      .send({ email: 'new@acme.com' });

    expect(res.status).toBe(403);
  });

  it('400 when email missing', async () => {
    memberSession('owner');

    const res = await request(app)
      .post('/api/team/invite')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
  });

  it('400 when invite already pending', async () => {
    memberSession('owner');
    plan('pro');
    count(1);
    pool.query.mockResolvedValueOnce({ rows: [] });       // existing user
    pool.query.mockResolvedValueOnce({ rows: [{ id: 5 }] }); // existing invite

    const res = await request(app)
      .post('/api/team/invite')
      .set(authHeader())
      .send({ email: 'pending@acme.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already sent/i);
  });

  it('400 when user already in company', async () => {
    memberSession('owner');
    plan('pro');
    count(1);
    pool.query.mockResolvedValueOnce({ rows: [{ id: 7 }] }); // existing user in company

    const res = await request(app)
      .post('/api/team/invite')
      .set(authHeader())
      .send({ email: 'existing@acme.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already in this company/i);
  });

  it('402 when free plan team limit reached', async () => {
    memberSession('owner');
    plan('free');
    count(3); // at free limit

    const res = await request(app)
      .post('/api/team/invite')
      .set(authHeader())
      .send({ email: 'new@acme.com' });

    expect(res.status).toBe(402);
  });
});

describe('DELETE /api/team/:userId', () => {
  it('200 when owner removes member', async () => {
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'bob@acme.com', company_role: 'member' }] }); // user check
    pool.query.mockResolvedValueOnce({ rows: [] }); // DELETE

    const res = await request(app)
      .delete('/api/team/2')
      .set(authHeader(1));

    expect(res.status).toBe(200);
  });

  it('400 when trying to remove owner', async () => {
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'owner2@acme.com', company_role: 'owner' }] });

    const res = await request(app)
      .delete('/api/team/2')
      .set(authHeader(1));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Cannot remove company owner/i);
  });

  it('400 when trying to remove yourself', async () => {
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'self@acme.com', company_role: 'admin' }] });

    const res = await request(app)
      .delete('/api/team/1') // same as token userId
      .set(authHeader(1));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Cannot remove yourself/i);
  });

  it('404 when user not in company', async () => {
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/team/99')
      .set(authHeader(1));

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/team/:userId/role', () => {
  it('200 when owner changes member role', async () => {
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, company_role: 'member' }] });
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, email: 'bob@acme.com', name: 'Bob', company_role: 'admin' }] });

    const res = await request(app)
      .put('/api/team/2/role')
      .set(authHeader(1))
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.user.company_role).toBe('admin');
  });

  it('400 on invalid role value', async () => {
    memberSession('owner');

    const res = await request(app)
      .put('/api/team/2/role')
      .set(authHeader(1))
      .send({ role: 'superadmin' });

    expect(res.status).toBe(400);
  });

  it('400 when trying to change owner role', async () => {
    memberSession('owner');
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, company_role: 'owner' }] });

    const res = await request(app)
      .put('/api/team/2/role')
      .set(authHeader(1))
      .send({ role: 'member' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Cannot change owner role/i);
  });

  it('403 when admin tries to change roles (owner only)', async () => {
    memberSession('admin');

    const res = await request(app)
      .put('/api/team/2/role')
      .set(authHeader(1))
      .send({ role: 'member' });

    expect(res.status).toBe(403);
  });
});
