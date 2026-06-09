jest.mock('../../src/db', () => ({ pool: { query: jest.fn() } }));

const { pool } = require('../../src/db');
const {
  getCompanyPlan,
  checkSprintLimit,
  checkTaskLimit,
  checkTeamMemberLimit,
  checkExtraFields,
  getPlanLimits,
  PLAN_LIMITS,
} = require('../../src/planLimits');

const planRow = (plan, expires = null) => ({
  rows: [{ plan, plan_expires_at: expires }],
});

const countRow = (n) => ({ rows: [{ count: String(n) }] });

describe('getPlanLimits', () => {
  it('returns correct limits for each tier', () => {
    expect(getPlanLimits('free').maxActiveSprints).toBe(2);
    expect(getPlanLimits('pro').maxActiveSprints).toBe(Infinity);
    expect(getPlanLimits('team').maxTeamMembers).toBe(Infinity);
  });

  it('falls back to free for unknown plan', () => {
    expect(getPlanLimits('unknown')).toEqual(PLAN_LIMITS.free);
  });
});

describe('getCompanyPlan', () => {
  it('returns active plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('pro'));
    expect(await getCompanyPlan(1)).toBe('pro');
  });

  it('returns null for unknown company', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    expect(await getCompanyPlan(999)).toBeNull();
  });

  it('downgrades expired plan to free and updates DB', async () => {
    const pastDate = new Date(Date.now() - 1000);
    pool.query
      .mockResolvedValueOnce(planRow('pro', pastDate))
      .mockResolvedValueOnce({ rows: [] }); // UPDATE
    expect(await getCompanyPlan(1)).toBe('free');
    expect(pool.query).toHaveBeenCalledTimes(2);
  });
});

describe('checkSprintLimit', () => {
  it('allows when below free limit', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('free'))
      .mockResolvedValueOnce(countRow(1));
    const result = await checkSprintLimit(1);
    expect(result.allowed).toBe(true);
  });

  it('blocks when free limit reached', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('free'))
      .mockResolvedValueOnce(countRow(2));
    const result = await checkSprintLimit(1);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(2);
    expect(result.current).toBe(2);
  });

  it('always allows for pro plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('pro'));
    const result = await checkSprintLimit(1);
    expect(result.allowed).toBe(true);
    expect(pool.query).toHaveBeenCalledTimes(1); // no count query needed
  });

  it('always allows for team plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('team'));
    const result = await checkSprintLimit(1);
    expect(result.allowed).toBe(true);
  });
});

describe('checkTaskLimit', () => {
  it('allows when below free limit', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('free'))
      .mockResolvedValueOnce(countRow(5));
    const result = await checkTaskLimit(1, 10);
    expect(result.allowed).toBe(true);
  });

  it('blocks at free limit of 20 tasks', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('free'))
      .mockResolvedValueOnce(countRow(20));
    const result = await checkTaskLimit(1, 10);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(20);
  });

  it('always allows for pro plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('pro'));
    const result = await checkTaskLimit(1, 10);
    expect(result.allowed).toBe(true);
  });
});

describe('checkTeamMemberLimit', () => {
  it('blocks free plan at 3 members', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('free'))
      .mockResolvedValueOnce(countRow(3));
    const result = await checkTeamMemberLimit(1);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(3);
  });

  it('allows pro plan up to 10', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('pro'))
      .mockResolvedValueOnce(countRow(9));
    const result = await checkTeamMemberLimit(1);
    expect(result.allowed).toBe(true);
  });

  it('blocks pro at 10 members', async () => {
    pool.query
      .mockResolvedValueOnce(planRow('pro'))
      .mockResolvedValueOnce(countRow(10));
    const result = await checkTeamMemberLimit(1);
    expect(result.allowed).toBe(false);
  });

  it('always allows for team plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('team'));
    const result = await checkTeamMemberLimit(1);
    expect(result.allowed).toBe(true);
  });
});

describe('checkExtraFields', () => {
  it('blocks extra fields on free plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('free'));
    const result = await checkExtraFields(1, { deliverable: 'some value' });
    expect(result.allowed).toBe(false);
    expect(result.fields).toContain('deliverable');
  });

  it('allows empty extra fields on free plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('free'));
    const result = await checkExtraFields(1, { deliverable: '', definition_of_done: '' });
    expect(result.allowed).toBe(true);
  });

  it('allows extra fields on pro plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('pro'));
    const result = await checkExtraFields(1, { deliverable: 'some value', risk: 'medium' });
    expect(result.allowed).toBe(true);
  });

  it('allows extra fields on team plan', async () => {
    pool.query.mockResolvedValueOnce(planRow('team'));
    const result = await checkExtraFields(1, { dependencies: 'task-1', definition_of_done: 'done when shipped' });
    expect(result.allowed).toBe(true);
  });
});
