async function seed(client) {
  const bcrypt = require('bcryptjs');
  const email = 'admin@admin.com';
  const password = 'Senha123!';
  const passwordHash = await bcrypt.hash(password, 10);

  await client.query(`
    INSERT INTO users (email, password_hash) VALUES ($1, $2)
    ON CONFLICT (email) DO NOTHING;
  `, [email, passwordHash]);
}

async function rollback(client) {
  await client.query("DELETE FROM users WHERE email = 'admin@admin.com'");
}

module.exports = { seed, rollback };
