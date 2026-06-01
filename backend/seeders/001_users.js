async function seed(client) {
  const bcrypt = require('bcryptjs');
  const email = 'admin@admin.com';
  const password = 'Senha123!';
  const passwordHash = await bcrypt.hash(password, 10);

  // Create company first
  const companyRes = await client.query(`
    INSERT INTO companies (name, email, plan)
    VALUES ('Admin Company', 'company@admin.com', 'free')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `);
  const companyId = companyRes.rows[0].id;

  await client.query(`
    INSERT INTO users (email, password_hash, company_id, company_role)
    VALUES ($1, $2, $3, 'owner')
    ON CONFLICT (email) DO NOTHING;
  `, [email, passwordHash, companyId]);
}



async function rollback(client) {
  await client.query("DELETE FROM users WHERE email = 'admin@admin.com'");
}

module.exports = { seed, rollback };
