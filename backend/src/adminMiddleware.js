const { pool } = require('./db');

async function checkAdmin(req, res, next) {
  try {
    // Get user from token (req.user.id set by verifyToken middleware)
    const userId = req.user?.id || 1; // fallback to 1 for testing
    
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        requiredRole: 'admin',
        yourRole: user.role
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { checkAdmin };
