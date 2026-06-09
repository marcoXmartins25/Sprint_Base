jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../../src/db');
const { attachCompany, requireOwnerOrAdmin, requireOwner } = require('../../src/companyMiddleware');

const mockReq = (overrides = {}) => ({ userId: 1, ...overrides });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

beforeEach(() => next.mockClear());

describe('attachCompany', () => {
  it('returns 401 when req.userId missing', async () => {
    const req = mockReq({ userId: undefined });
    const res = mockRes();
    await attachCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when user not found in DB', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = mockReq();
    const res = mockRes();
    await attachCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when user has no company', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ company_id: null, company_role: 'owner' }] });
    const req = mockReq();
    const res = mockRes();
    await attachCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches companyId and companyRole, calls next', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ company_id: 42, company_role: 'admin' }] });
    const req = mockReq();
    const res = mockRes();
    await attachCompany(req, res, next);
    expect(req.companyId).toBe(42);
    expect(req.companyRole).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('returns 500 on DB error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB down'));
    const req = mockReq();
    const res = mockRes();
    await attachCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('requireOwnerOrAdmin', () => {
  it('allows owner', () => {
    const req = mockReq({ companyRole: 'owner' });
    requireOwnerOrAdmin(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('allows admin', () => {
    const req = mockReq({ companyRole: 'admin' });
    requireOwnerOrAdmin(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks member with 403', () => {
    const req = mockReq({ companyRole: 'member' });
    const res = mockRes();
    requireOwnerOrAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks when companyRole missing', () => {
    const req = mockReq({ companyRole: undefined });
    const res = mockRes();
    requireOwnerOrAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requireOwner', () => {
  it('allows owner', () => {
    const req = mockReq({ companyRole: 'owner' });
    requireOwner(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks admin with 403', () => {
    const req = mockReq({ companyRole: 'admin' });
    const res = mockRes();
    requireOwner(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks member with 403', () => {
    const req = mockReq({ companyRole: 'member' });
    const res = mockRes();
    requireOwner(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
