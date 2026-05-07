const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

/**
 * GET /api/invites/:token
 * Get invite details by token (public)
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT i.id, i.email, i.role, i.expires_at, c.name as company_name, c.logo_url
       FROM invites i
       JOIN companies c ON i.company_id = c.id
       WHERE i.token = $1 AND i.accepted_at IS NULL AND i.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found or expired' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get invite error:', error);
    res.status(500).json({ error: 'Failed to get invite' });
  }
});

/**
 * POST /api/invites/:token/accept
 * Accept invite and create user account (public)
 */
router.post('/:token/accept', async (req, res) => {
  const client = await pool.connect();
  try {
    const { token } = req.params;
    const { name, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    await client.query('BEGIN');

    // Get invite
    const inviteResult = await client.query(
      `SELECT i.id, i.company_id, i.email, i.role
       FROM invites i
       WHERE i.token = $1 AND i.accepted_at IS NULL AND i.expires_at > NOW()`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invite not found or expired' });
    }

    const invite = inviteResult.rows[0];

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [invite.email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, name, company_id, company_role, role, created_at) 
       VALUES ($1, $2, $3, $4, $5, 'user', NOW()) 
       RETURNING id, email, name, company_id, company_role, role`,
      [invite.email, passwordHash, name || '', invite.company_id, invite.role]
    );

    const user = userResult.rows[0];

    // Mark invite as accepted
    await client.query(
      'UPDATE invites SET accepted_at = NOW() WHERE id = $1',
      [invite.id]
    );

    await client.query('COMMIT');

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Invite accepted successfully',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyRole: user.company_role,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  } finally {
    client.release();
  }
});

module.exports = router;
