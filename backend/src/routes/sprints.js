const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { checkSprintLimit } = require('../planLimits');
const { attachCompany } = require('../companyMiddleware');

// Apply company middleware to all routes
router.use(attachCompany);

router.get('/', async (req, res) => {
  try {
    const showArchived = req.query.archived === 'true';
    const query = showArchived 
      ? 'SELECT * FROM sprints WHERE company_id = $1 ORDER BY start_date DESC'
      : 'SELECT * FROM sprints WHERE company_id = $1 AND archived_at IS NULL ORDER BY start_date DESC';
    
    const result = await pool.query(query, [req.companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM sprints WHERE id = $1 AND company_id = $2', [id, req.companyId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date, and end_date are required' });
    }
    
    const limitCheck = await checkSprintLimit(req.companyId);
    if (!limitCheck.allowed) {
      return res.status(402).json({ 
        error: limitCheck.message,
        limit: limitCheck.limit,
        current: limitCheck.current,
        upgrade: true
      });
    }
    
    const result = await pool.query(
      'INSERT INTO sprints (title, start_date, end_date, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, start_date, end_date, req.companyId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_date, end_date } = req.body;
    const result = await pool.query(
      'UPDATE sprints SET title = COALESCE($1, title), start_date = COALESCE($2, start_date), end_date = COALESCE($3, end_date), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND company_id = $5 RETURNING *',
      [title, start_date, end_date, id, req.companyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM sprints WHERE id = $1 AND company_id = $2 RETURNING *', [id, req.companyId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    res.json({ message: 'Sprint deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const sprint = await pool.query('SELECT id FROM sprints WHERE id = $1 AND company_id = $2', [id, req.companyId]);
    if (sprint.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    const result = await pool.query(
      'SELECT * FROM tasks WHERE sprint_id = $1 AND company_id = $2 ORDER BY created_at DESC',
      [id, req.companyId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
