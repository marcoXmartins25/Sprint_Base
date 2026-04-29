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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sprint-report-${sprint.title.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

    const doc = generateSprintReport(sprint, tasks);
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
