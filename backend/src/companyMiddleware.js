const { pool } = require('./db');

/**
 * Middleware to attach company information to request
 * Requires verifyToken to be called first
 */
async function attachCompany(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(
      'SELECT company_id, company_role FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { company_id, company_role } = result.rows[0];

    if (!company_id) {
      return res.status(400).json({ error: 'User not associated with any company' });
    }

    req.companyId = company_id;
    req.companyRole = company_role;
    next();
  } catch (error) {
    console.error('Company middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to check if user is owner or admin
 */
function requireOwnerOrAdmin(req, res, next) {
  if (!req.companyRole || !['owner', 'admin'].includes(req.companyRole)) {
    return res.status(403).json({ error: 'Owner or admin role required' });
  }
  next();
}

/**
 * Middleware to check if user is owner
 */
function requireOwner(req, res, next) {
  if (req.companyRole !== 'owner') {
    return res.status(403).json({ error: 'Owner role required' });
  }
  next();
}

module.exports = {
  attachCompany,
  requireOwnerOrAdmin,
  requireOwner,
};
