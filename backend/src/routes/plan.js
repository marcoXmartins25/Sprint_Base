const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { getUserPlan, getPlanLimits } = require('../planLimits');
const { checkAdmin } = require('../adminMiddleware');

// Get user plan
router.get('/:id/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, name, plan, plan_expires_at, plan_updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const limits = getPlanLimits(user.plan);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        plan_expires_at: user.plan_expires_at,
        plan_updated_at: user.plan_updated_at,
      },
      limits,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user plan (admin only)
router.put('/:id/plan', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, plan_expires_at } = req.body;
    
    if (!plan || !['free', 'pro', 'team'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan. Must be free, pro, or team' });
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET plan = $1, 
           plan_expires_at = $2, 
           plan_updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, email, name, plan, plan_expires_at, plan_updated_at`,
      [plan, plan_expires_at || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    const limits = getPlanLimits(user.plan);
    
    res.json({
      message: 'Plan updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        plan_expires_at: user.plan_expires_at,
        plan_updated_at: user.plan_updated_at,
      },
      limits,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
