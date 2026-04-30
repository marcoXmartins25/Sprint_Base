const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { generateSprintReport } = require('../pdf');

router.get('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const sprintResult = await pool.query('SELECT * FROM sprints WHERE id = $1', [id]);
    if (sprintResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    const sprint = sprintResult.rows[0];

    const tasksResult = await pool.query(
      'SELECT * FROM tasks WHERE sprint_id = $1 ORDER BY priority DESC, created_at ASC',
      [id]
    );
    const tasks = tasksResult.rows;

    const teamResult = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email, u.avatar_url
       FROM users u
       INNER JOIN tasks t ON LOWER(t.assigned_to) = LOWER(u.email)
       WHERE t.sprint_id = $1 AND t.assigned_to != ''`,
      [id]
    );
    const team = teamResult.rows;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sprint-report-${sprint.title.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

    const doc = generateSprintReport(sprint, tasks, team);
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
