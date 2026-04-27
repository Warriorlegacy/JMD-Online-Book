import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function runDebug() {
  console.log('🚀 Starting Autonomous Debug for Kinetic Ledger...');
  const results = {
    env: false,
    db: false,
    schema: false,
    api: false,
    cleanup: false
  };

  // 1. Environment Check
  console.log('\n--- Part 1: Environment Variables ---');
  const requiredEnv = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CRON_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  let envOk = true;
  for (const env of requiredEnv) {
    const val = process.env[env];
    if (val) {
      process.env[env] = val.replace(/\r/g, '').trim();
      console.log(`✅ ${env} is set`);
    } else {
      console.warn(`❌ ${env} is MISSING`);
      envOk = false;
    }
  }
  results.env = envOk;

  // 2. Database Connectivity
  console.log('\n--- Part 2: Database Connectivity ---');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Cannot test DB: DATABASE_URL is missing');
  } else {
    console.log(`Checking connection string: ${connectionString.substring(0, 20)}... (Length: ${connectionString.length})`);
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool.connect();
      console.log('✅ Successfully connected to PostgreSQL');
      client.release();
      results.db = true;

      // 3. Schema Integrity
      console.log('\n--- Part 3: Schema Integrity ---');
      const tables = ['users', 'wallets', 'matches', 'odds_markets', 'withdrawal_requests', 'deposit_requests'];
      let schemaOk = true;
      for (const table of tables) {
        try {
          await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
          console.log(`✅ Table "${table}" exists`);
        } catch {
          console.warn(`❌ Table "${table}" is MISSING`);
          schemaOk = false;
        }
      }
      results.schema = schemaOk;
    } catch (err) {
      console.error('❌ DB Test Failed:', err.message);
    } finally {
      await pool.end();
    }
  }

  // 4. API Endpoint Discovery
  console.log('\n--- Part 4: API Endpoint Audit ---');
  const apiBase = path.join(process.cwd(), 'src/app/api/admin');
  if (fs.existsSync(apiBase)) {
    const endpoints = fs.readdirSync(apiBase, { recursive: true })
      .filter(f => f.endsWith('route.ts'));
    console.log(`✅ Found ${endpoints.length} native admin endpoints`);
    endpoints.forEach(e => console.log(`   - ${e}`));
    results.api = true;
  } else {
    console.error('❌ Admin API directory missing');
  }

  // 5. Legacy Cleanup Check
  console.log('\n--- Part 5: Legacy Backend Cleanup ---');
  const backendPath = path.join(process.cwd(), '../backend');
  if (!fs.existsSync(backendPath)) {
    console.log('✅ Legacy backend directory removed');
    results.cleanup = true;
  } else {
    console.warn('⚠️ Legacy backend directory still exists');
  }

  console.log('\n--- Final Results ---');
  console.table(results);

  const success = Object.values(results).every(v => v === true);
  if (success) {
    console.log('\n🎉 ALL CHECKS PASSED. SYSTEM IS PRODUCTION READY.');
    process.exit(0);
  } else {
    console.log('\n⚠️ SOME CHECKS FAILED. PLEASE REVIEW THE LOGS.');
    process.exit(1);
  }
}

runDebug();
