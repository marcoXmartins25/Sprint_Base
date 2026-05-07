const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { getUserPlan } = require('../planLimits');

const uploadsDir = path.join(__dirname, '../../../uploads/logos');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `logo_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PNG, JPG, JPEG, and SVG files are allowed'));
  }
});

// Get branding
router.get('/:id/branding', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, company_name, logo_url, primary_color, plan FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    if (user.plan !== 'team') {
      return res.status(403).json({ 
        error: 'Custom branding is only available for Team plan users',
        upgrade: true 
      });
    }
    
    res.json({
      company_name: user.company_name,
      logo_url: user.logo_url,
      primary_color: user.primary_color,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update branding
router.put('/:id/branding', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, primary_color } = req.body;
    
    // Check if user has Team plan
    const plan = await getUserPlan(id);
    if (plan !== 'team') {
      return res.status(403).json({ 
        error: 'Custom branding is only available for Team plan users',
        upgrade: true 
      });
    }
    
    // Validate hex color
    if (primary_color && !/^#[0-9A-Fa-f]{6}$/.test(primary_color)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex format like #6366f1' });
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET company_name = COALESCE($1, company_name), 
           primary_color = COALESCE($2, primary_color)
       WHERE id = $3 
       RETURNING id, company_name, logo_url, primary_color`,
      [company_name, primary_color, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Branding updated successfully',
      branding: {
        company_name: result.rows[0].company_name,
        logo_url: result.rows[0].logo_url,
        primary_color: result.rows[0].primary_color,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload logo
router.post('/:id/branding/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has Team plan
    const plan = await getUserPlan(id);
    if (plan !== 'team') {
      // Delete uploaded file
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ 
        error: 'Custom branding is only available for Team plan users',
        upgrade: true 
      });
    }
    
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE users SET logo_url = $1 WHERE id = $2 RETURNING id, company_name, logo_url, primary_color',
      [logoUrl, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Logo uploaded successfully',
      branding: {
        company_name: result.rows[0].company_name,
        logo_url: result.rows[0].logo_url,
        primary_color: result.rows[0].primary_color,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
