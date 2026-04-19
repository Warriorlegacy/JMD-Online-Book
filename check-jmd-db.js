const fs = require('fs');
const { Client } = require('pg');

// Load .env.local from jmd-online-book
const envPath = '.env.local';
let dbUrl;
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valParts] = line.split('=');
    if (key && valParts[0]) {
      const value = valParts.join('=').replace(/^["']|["']$/g, '').trim();
      env[key.trim()] = value;
      if (key.trim() === 'DATABASE_URL') dbUrl = value;
    }
  });
} catch (e) {
  console.error('Error reading .env.local:', e.message);
  process.exit(1);
}

async function main() {
  console.log('\n=== JMD-ONLINE-BOOK DATABASE CHECK ===\n');

  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');

    // Table count
    const { rowCount: tableCount } = await client.query(
      "SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
    );
    console.log('Total tables:', tableCount);

    // List tables
    const tables = await client.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log('\nPublic tables:');
    tables.rows.forEach(t => console.log('  -', t.tablename));

    // Check required tables
    const required = [
      'profiles', 'transactions', 'bets', 'games', 'commissions',
      'notifications', 'tenants', 'platform_revenue',
      'sport_events', 'odds_markets', 'casino_rounds', 'settlement_log',
      'odds_api_cache',
      'user_streaks', 'daily_rewards', 'streak_tiers', 'loss_recovery',
      'near_win_events', 'user_friends', 'otp_tokens', 'payment_methods',
      'site_settings'
    ];

    const existing = tables.rows.map(t => t.tablename);
    console.log('\nRequired tables check:');
    required.forEach(t => {
      const ok = existing.includes(t);
      console.log(`  ${ok ? '✅' : '❌'} ${t}`);
    });

    // Check enums
    const enums = await client.query(
      "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname"
    );
    console.log('\nEnums:');
    enums.rows.forEach(e => console.log('  -', e.typname));

    // Check RLS
    const rls = await client.query(`
      SELECT tablename FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' AND rowsecurity = true
      ORDER BY tablename
    `);
    console.log('\nRLS enabled (' + rls.rowCount + '):');
    rls.rows.forEach(r => console.log('  -', r.tablename));

    // Check indexes
    const idx = await client.query(
      "SELECT COUNT(*) FROM pg_catalog.pg_indexes WHERE schemaname = 'public'"
    );
    console.log('\nTotal indexes:', idx.rows[0].count);

    await client.end();
    console.log('\n✅ JMD DB check complete\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (client) await client.end();
    process.exit(1);
  }
}

main();
