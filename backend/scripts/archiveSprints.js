require('dotenv').config();
const { pool } = require('../src/db');

async function archiveOldSprints() {
  try {
    console.log('Starting sprint archival process...');
    
    // Get all users with their plans
    const usersResult = await pool.query('SELECT id, email, plan FROM users');
    const users = usersResult.rows;
    
    for (const user of users) {
      // Skip team plan users (unlimited history)
      if (user.plan === 'team') {
        console.log(`Skipping user ${user.email} (Team plan - unlimited history)`);
        continue;
      }
      
      // For free and pro: archive sprints older than 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const result = await pool.query(
        `UPDATE sprints 
         SET archived_at = CURRENT_TIMESTAMP 
         WHERE end_date < $1 
           AND archived_at IS NULL
         RETURNING id, title, end_date`,
        [sixMonthsAgo]
      );
      
      if (result.rows.length > 0) {
        console.log(`Archived ${result.rows.length} sprints for user ${user.email} (${user.plan} plan):`);
        result.rows.forEach(sprint => {
          console.log(`  - ${sprint.title} (ended ${sprint.end_date})`);
        });
      } else {
        console.log(`No sprints to archive for user ${user.email}`);
      }
    }
    
    console.log('Sprint archival process completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error archiving sprints:', err);
    process.exit(1);
  }
}

archiveOldSprints();
