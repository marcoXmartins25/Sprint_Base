const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.post('/', async (req, res) => {
  try {
    const { sprint_id, title, description, status, priority, due_start, due_end, assigned_to, hours, week, deliverable, definition_of_done, dependencies, risk } = req.body;
    if (!sprint_id || !title) {
      return res.status(400).json({ error: 'sprint_id and title are required' });
    }
    const sprint = await pool.query('SELECT id FROM sprints WHERE id = $1', [sprint_id]);
    if (sprint.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    const result = await pool.query(
      `INSERT INTO tasks (sprint_id, title, description, status, priority, due_start, due_end, assigned_to, hours, week, deliverable, definition_of_done, dependencies, risk)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [sprint_id, title, description || '', status || 'to-do', priority || 'medium',
       due_start || null, due_end || null, assigned_to || '', hours || 0,
       week || '', deliverable || '', definition_of_done || '', dependencies || '', risk || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_start, due_end, assigned_to, hours, week, deliverable, definition_of_done, dependencies, risk } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_start = COALESCE($5, due_start),
        due_end = COALESCE($6, due_end),
        assigned_to = COALESCE($7, assigned_to),
        hours = COALESCE($8, hours),
        week = COALESCE($9, week),
        deliverable = COALESCE($10, deliverable),
        definition_of_done = COALESCE($11, definition_of_done),
        dependencies = COALESCE($12, dependencies),
        risk = COALESCE($13, risk),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 RETURNING *`,
      [title, description, status, priority, due_start ?? null, due_end ?? null, assigned_to, hours ?? null,
       week, deliverable, definition_of_done, dependencies, risk, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
