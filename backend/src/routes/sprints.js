const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sprints ORDER BY start_date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM sprints WHERE id = $1', [id]);
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
    const result = await pool.query(
      'INSERT INTO sprints (title, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
      [title, start_date, end_date]
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
      'UPDATE sprints SET title = COALESCE($1, title), start_date = COALESCE($2, start_date), end_date = COALESCE($3, end_date), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, start_date, end_date, id]
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
    const result = await pool.query('DELETE FROM sprints WHERE id = $1 RETURNING *', [id]);
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
    const sprint = await pool.query('SELECT id FROM sprints WHERE id = $1', [id]);
    if (sprint.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    const result = await pool.query(
      'SELECT * FROM tasks WHERE sprint_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
