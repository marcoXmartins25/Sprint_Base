const { pool } = require('./db');

const PLAN_LIMITS = {
  free: {
    maxActiveSprints: 2,
    maxTasksPerSprint: 20,
    maxTeamMembers: 3,
    allowExtraFields: false,
    pdfWatermark: true,
    historyMonths: 6,
    customBranding: false,
  },
  pro: {
    maxActiveSprints: Infinity,
    maxTasksPerSprint: Infinity,
    maxTeamMembers: 10,
    allowExtraFields: true,
    pdfWatermark: false,
    historyMonths: 6,
    customBranding: false,
  },
  team: {
    maxActiveSprints: Infinity,
    maxTasksPerSprint: Infinity,
    maxTeamMembers: Infinity,
    allowExtraFields: true,
    pdfWatermark: false,
    historyMonths: Infinity,
    customBranding: true,
  },
};

async function getCompanyPlan(companyId) {
  const result = await pool.query('SELECT plan, plan_expires_at FROM companies WHERE id = $1', [companyId]);
  if (result.rows.length === 0) return null;
  
  const company = result.rows[0];
  
  // Check if plan expired
  if (company.plan_expires_at && new Date(company.plan_expires_at) < new Date()) {
    await pool.query('UPDATE companies SET plan = $1, plan_expires_at = NULL WHERE id = $2', ['free', companyId]);
    return 'free';
  }
  
  return company.plan || 'free';
}

async function checkSprintLimit(companyId) {
  const plan = await getCompanyPlan(companyId);
  const limits = PLAN_LIMITS[plan];
  
  if (limits.maxActiveSprints === Infinity) return { allowed: true };
  
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM sprints WHERE company_id = $1 AND archived_at IS NULL',
    [companyId]
  );
  const currentCount = parseInt(result.rows[0].count);
  
  if (currentCount >= limits.maxActiveSprints) {
    return {
      allowed: false,
      message: `Your ${plan} plan allows only ${limits.maxActiveSprints} active sprints. Upgrade to Pro for unlimited sprints.`,
      limit: limits.maxActiveSprints,
      current: currentCount,
    };
  }
  
  return { allowed: true };
}

async function checkTaskLimit(companyId, sprintId) {
  const plan = await getCompanyPlan(companyId);
  const limits = PLAN_LIMITS[plan];
  
  if (limits.maxTasksPerSprint === Infinity) return { allowed: true };
  
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM tasks WHERE sprint_id = $1 AND company_id = $2',
    [sprintId, companyId]
  );
  const currentCount = parseInt(result.rows[0].count);
  
  if (currentCount >= limits.maxTasksPerSprint) {
    return {
      allowed: false,
      message: `Your ${plan} plan allows only ${limits.maxTasksPerSprint} tasks per sprint. Upgrade to Pro for unlimited tasks.`,
      limit: limits.maxTasksPerSprint,
      current: currentCount,
    };
  }
  
  return { allowed: true };
}

async function checkTeamMemberLimit(companyId) {
  const plan = await getCompanyPlan(companyId);
  const limits = PLAN_LIMITS[plan];
  
  if (limits.maxTeamMembers === Infinity) return { allowed: true };
  
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE company_id = $1',
    [companyId]
  );
  const currentCount = parseInt(result.rows[0].count);
  
  if (currentCount >= limits.maxTeamMembers) {
    return {
      allowed: false,
      message: `Your ${plan} plan allows only ${limits.maxTeamMembers} team members. Upgrade to add more members.`,
      limit: limits.maxTeamMembers,
      current: currentCount,
    };
  }
  
  return { allowed: true };
}

async function checkExtraFields(companyId, taskData) {
  const plan = await getCompanyPlan(companyId);
  const limits = PLAN_LIMITS[plan];
  
  if (limits.allowExtraFields) return { allowed: true };
  
  const extraFields = ['deliverable', 'definition_of_done', 'dependencies', 'risk'];
  const usedExtraFields = extraFields.filter(field => taskData[field] && taskData[field].trim() !== '');
  
  if (usedExtraFields.length > 0) {
    return {
      allowed: false,
      message: `Extra fields (deliverable, definition of done, dependencies, risk) are only available in Pro and Team plans. Upgrade to unlock these features.`,
      fields: usedExtraFields,
    };
  }
  
  return { allowed: true };
}

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

module.exports = {
  getCompanyPlan,
  checkSprintLimit,
  checkTaskLimit,
  checkTeamMemberLimit,
  checkExtraFields,
  getPlanLimits,
  PLAN_LIMITS,
};
