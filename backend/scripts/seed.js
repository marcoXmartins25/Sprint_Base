require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sprint_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runSeeders() {
  const client = await pool.connect();
  try {
    const seedersDir = path.join(__dirname, '..', 'seeders');
    const seederFiles = fs.readdirSync(seedersDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    for (const file of seederFiles) {
      console.log(`Running seeder: ${file}`);
      const seeder = require(path.join(seedersDir, file));
      await seeder.seed(client);
      console.log(`  ✓ ${file} applied`);
    }

    console.log('All seeders applied');
  } catch (err) {
    console.error('Seeder failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function rollbackSeeders() {
  const client = await pool.connect();
  try {
    const seedersDir = path.join(__dirname, '..', 'seeders');
    const seederFiles = fs.readdirSync(seedersDir)
      .filter(f => f.endsWith('.js'))
      .sort()
      .reverse();

    for (const file of seederFiles) {
      console.log(`Rolling back seeder: ${file}`);
      const seeder = require(path.join(seedersDir, file));
      if (seeder.rollback) {
        await seeder.rollback(client);
        console.log(`  ✓ ${file} rolled back`);
      }
    }

    console.log('All seeders rolled back');
  } catch (err) {
    console.error('Rollback failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

const action = process.argv[2] || 'seed';
if (action === 'rollback') {
  rollbackSeeders().then(() => { console.log('Done'); pool.end(); }).catch((err) => { console.error(err); pool.end(); process.exit(1); });
} else {
  runSeeders().then(() => { console.log('Done'); pool.end(); }).catch((err) => { console.error(err); pool.end(); process.exit(1); });
}
