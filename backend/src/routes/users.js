const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { checkAdmin } = require('../adminMiddleware');
const { sendWelcomeEmail } = require('../emailService');

// Create user (admin only)
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, plan) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role, plan, created_at`,
      [email, password_hash, name || '', role || 'user', 'free']
    );
    
    // Send welcome email (don't wait for it)
    sendWelcomeEmail(email, name, password).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
    
    res.status(201).json({
      message: 'User created successfully. Welcome email sent.',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    const adminId = req.user?.id || 1;
    if (parseInt(id) === adminId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be user or admin' });
    }
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
      [role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Role updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
