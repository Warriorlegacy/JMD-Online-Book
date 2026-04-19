const { Pool } = require('pg');
require('dotenv').config();

async function run() {
  console.log('Checking database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT to_regclass(\'public.tenants\');');
    console.log('Tenants table status:', res.rows[0]);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await pool.end();
  }
}
run();
