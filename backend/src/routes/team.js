const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');
const { attachCompany, requireOwnerOrAdmin, requireOwner } = require('../companyMiddleware');
const { verifyToken } = require('./auth');
const { sendInviteEmail } = require('../emailService');

const router = express.Router();

/**
 * GET /api/team
 * Get all team members of the company
 */
router.get('/', verifyToken, attachCompany, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, avatar_url, company_role, role, created_at 
       FROM users 
       WHERE company_id = $1 
       ORDER BY 
         CASE company_role 
           WHEN 'owner' THEN 1 
           WHEN 'admin' THEN 2 
           ELSE 3 
         END, 
         name, email`,
      [req.companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to get team members' });
  }
});

/**
 * POST /api/team/invite
 * Invite a new team member (owner/admin only)
 */
router.post('/invite', verifyToken, attachCompany, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (role && !['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or member' });
    }

    // Check if user already exists in this company
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND company_id = $2',
      [email, req.companyId]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already in this company' });
    }

    // Check if there's a pending invite
    const existingInvite = await pool.query(
      'SELECT id FROM invites WHERE email = $1 AND company_id = $2 AND accepted_at IS NULL AND expires_at > NOW()',
      [email, req.companyId]
    );
    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ error: 'Invite already sent to this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite
    const result = await pool.query(
      `INSERT INTO invites (company_id, email, token, role, invited_by, expires_at, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, email, token, role, expires_at`,
      [req.companyId, email, token, role || 'member', req.userId, expiresAt]
    );

    const invite = result.rows[0];

    // Get company info for email
    const companyResult = await pool.query(
      'SELECT name FROM companies WHERE id = $1',
      [req.companyId]
    );
    const companyName = companyResult.rows[0]?.name || 'Company';

    // Send invite email
    sendInviteEmail(email, companyName, token).catch(err => {
      console.error('Failed to send invite email:', err);
    });

    res.status(201).json({
      message: 'Invite sent successfully',
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expires_at,
      },
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

/**
 * GET /api/team/invites
 * Get pending invites (owner/admin only)
 */
router.get('/invites', verifyToken, attachCompany, requireOwnerOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.email, i.role, i.expires_at, i.created_at, u.name as invited_by_name
       FROM invites i
       LEFT JOIN users u ON i.invited_by = u.id
       WHERE i.company_id = $1 AND i.accepted_at IS NULL AND i.expires_at > NOW()
       ORDER BY i.created_at DESC`,
      [req.companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ error: 'Failed to get invites' });
  }
});

/**
 * DELETE /api/team/invites/:id
 * Cancel an invite (owner/admin only)
 */
router.delete('/invites/:id', verifyToken, attachCompany, requireOwnerOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM invites WHERE id = $1 AND company_id = $2 RETURNING id, email',
      [req.params.id, req.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    res.json({ message: 'Invite cancelled', invite: result.rows[0] });
  } catch (error) {
    console.error('Cancel invite error:', error);
    res.status(500).json({ error: 'Failed to cancel invite' });
  }
});

/**
 * DELETE /api/team/:userId
 * Remove team member (owner/admin only)
 */
router.delete('/:userId', verifyToken, attachCompany, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and belongs to company
    const userCheck = await pool.query(
      'SELECT id, email, company_role FROM users WHERE id = $1 AND company_id = $2',
      [userId, req.companyId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in this company' });
    }

    const targetUser = userCheck.rows[0];

    // Cannot remove owner
    if (targetUser.company_role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove company owner' });
    }

    // Cannot remove yourself
    if (parseInt(userId) === req.userId) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

/**
 * PUT /api/team/:userId/role
 * Change team member role (owner only)
 */
router.put('/:userId/role', verifyToken, attachCompany, requireOwner, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or member' });
    }

    // Check if user exists and belongs to company
    const userCheck = await pool.query(
      'SELECT id, company_role FROM users WHERE id = $1 AND company_id = $2',
      [userId, req.companyId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in this company' });
    }

    // Cannot change owner role
    if (userCheck.rows[0].company_role === 'owner') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    // Update role
    const result = await pool.query(
      'UPDATE users SET company_role = $1 WHERE id = $2 RETURNING id, email, name, company_role',
      [role, userId]
    );

    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

module.exports = router;
