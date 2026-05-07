const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { attachCompany, requireOwnerOrAdmin } = require('../companyMiddleware');
const { verifyToken } = require('./auth');

const router = express.Router();

// Setup multer for logo upload
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

/**
 * POST /api/companies/register
 * Public endpoint - Register new company with owner
 */
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { companyName, companyEmail, ownerName, ownerEmail, password } = req.body;

    if (!companyName || !companyEmail || !ownerEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await client.query('BEGIN');

    // Check if company email exists
    const existingCompany = await client.query(
      'SELECT id FROM companies WHERE email = $1',
      [companyEmail]
    );
    if (existingCompany.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Company email already registered' });
    }

    // Check if owner email exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [ownerEmail]
    );
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User email already registered' });
    }

    // Create company
    const companyResult = await client.query(
      `INSERT INTO companies (name, email, plan, created_at) 
       VALUES ($1, $2, 'free', NOW()) 
       RETURNING id, name, email, plan, created_at`,
      [companyName, companyEmail]
    );
    const company = companyResult.rows[0];

    // Create owner user
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, name, company_id, company_role, role, created_at) 
       VALUES ($1, $2, $3, $4, 'owner', 'user', NOW()) 
       RETURNING id, email, name, company_id, company_role, role`,
      [ownerEmail, passwordHash, ownerName || '', company.id]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Company registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyRole: user.company_role,
      },
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        plan: company.plan,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Company registration error:', error);
    res.status(500).json({ error: 'Failed to register company' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/companies/me
 * Get current user's company info
 */
router.get('/me', verifyToken, attachCompany, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, logo_url, primary_color, plan, plan_expires_at, created_at FROM companies WHERE id = $1',
      [req.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to get company info' });
  }
});

/**
 * PUT /api/companies/me
 * Update company info (owner/admin only)
 */
router.put('/me', verifyToken, attachCompany, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { name, email, primaryColor } = req.body;

    // Check if email is taken by another company
    if (email) {
      const existing = await pool.query(
        'SELECT id FROM companies WHERE email = $1 AND id != $2',
        [email, req.companyId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const result = await pool.query(
      `UPDATE companies 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           primary_color = COALESCE($3, primary_color)
       WHERE id = $4 
       RETURNING id, name, email, logo_url, primary_color, plan, plan_expires_at`,
      [name, email, primaryColor, req.companyId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

/**
 * POST /api/companies/logo
 * Upload company logo (owner/admin only)
 */
router.post('/logo', verifyToken, attachCompany, requireOwnerOrAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE companies SET logo_url = $1 WHERE id = $2 RETURNING id, name, logo_url',
      [logoUrl, req.companyId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

module.exports = router;
