jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../../src/db');
const { checkAdmin } = require('../../src/adminMiddleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const next = jest.fn();

beforeEach(() => next.mockClear());

describe('checkAdmin', () => {
  it('calls next for admin user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ role: 'admin' }] });
    const req = { userId: 1 };
    await checkAdmin(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(
      'SELECT role FROM users WHERE id = $1',
      [1]
    );
  });

  it('returns 403 for non-admin user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ role: 'user' }] });
    const req = { userId: 2 };
    const res = mockRes();
    await checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 when user not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = { userId: 999 };
    const res = mockRes();
    await checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('uses req.userId (not req.user.id)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ role: 'admin' }] });
    // req.user is undefined — fix ensures no crash
    const req = { userId: 5, user: undefined };
    const res = mockRes();
    await checkAdmin(req, res, next);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [5]);
    expect(next).toHaveBeenCalled();
  });
});
