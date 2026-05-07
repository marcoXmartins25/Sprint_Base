const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { generateSprintReport } = require('../pdf');
const { getCompanyPlan } = require('../planLimits');
const { attachCompany } = require('../companyMiddleware');

// Apply company middleware to all routes
router.use(attachCompany);

router.get('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify sprint belongs to company
    const sprintResult = await pool.query('SELECT * FROM sprints WHERE id = $1 AND company_id = $2', [id, req.companyId]);
    if (sprintResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    const sprint = sprintResult.rows[0];

    const tasksResult = await pool.query(
      'SELECT * FROM tasks WHERE sprint_id = $1 AND company_id = $2 ORDER BY priority DESC, created_at ASC',
      [id, req.companyId]
    );
    const tasks = tasksResult.rows;

    const teamResult = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email, u.avatar_url
       FROM users u
       INNER JOIN tasks t ON LOWER(t.assigned_to) = LOWER(u.email)
       WHERE t.sprint_id = $1 AND t.company_id = $2 AND t.assigned_to != '' AND u.company_id = $2`,
      [id, req.companyId]
    );
    const team = teamResult.rows;
    
    // Get company plan
    const companyPlan = await getCompanyPlan(req.companyId);
    
    // Get branding if Team plan
    let branding = null;
    if (companyPlan === 'team') {
      const brandingResult = await pool.query(
        'SELECT name as company_name, logo_url, primary_color FROM companies WHERE id = $1',
        [req.companyId]
      );
      if (brandingResult.rows.length > 0) {
        branding = brandingResult.rows[0];
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sprint-report-${sprint.title.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

    const doc = generateSprintReport(sprint, tasks, team, companyPlan, branding);
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
