const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sprint-tracker-secret-key-2026';

function generateToken(userId) {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const tokenParam = req.query.token;

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (tokenParam) {
    token = tokenParam;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      `SELECT u.*, c.name as company_name, c.plan as company_plan 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       WHERE u.email = $1`,
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyRole: user.company_role,
        companyId: user.company_id,
        companyName: user.company_name,
        companyPlan: user.company_plan,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.company_role, u.company_id, u.avatar_url,
              c.name as company_name, c.plan as company_plan
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyRole: user.company_role,
        companyId: user.company_id,
        companyName: user.company_name,
        companyPlan: user.company_plan,
        avatarUrl: user.avatar_url,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, verifyToken };
