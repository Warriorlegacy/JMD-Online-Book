const fs = require('fs');
const { Client } = require('pg');

// Load .env from sbe/backend
let dbUrl = process.env.DATABASE_URL;
try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valParts] = line.split('=');
    if (key && valParts[0] && key.trim() === 'DATABASE_URL') {
      dbUrl = valParts.join('=').replace(/^["']|["']$/g, '').trim();
    }
  });
} catch (e) {
  console.log('No .env file - using env var');
}

async function main() {
  console.log('\n=== SBE BACKEND DATABASE CHECK ===\n');

  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : undefined
  });

  try {
    await client.connect();
    console.log('✅ Connected to SBE database');

    const { rowCount: tableCount } = await client.query(
      "SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
    );
    console.log('Total tables:', tableCount);

    const tables = await client.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log('\nPublic tables:');
    tables.rows.forEach(t => console.log('  -', t.tablename));

    const required = [
      'users', 'wallets', 'tournaments', 'matches', 'orders',
      'trades', 'ledger_entries', 'market_history',
      'deposit_requests', 'withdrawal_requests', 'announcements'
    ];

    const existing = tables.rows.map(t => t.tablename);
    console.log('\nRequired tables check:');
    required.forEach(t => {
      const ok = existing.includes(t);
      console.log(`  ${ok ? '✅' : '❌'} ${t}`);
    });

    const expectedEnums = ['match_status', 'order_status', 'order_type', 'user_role', 'transaction_status'];
    const actualEnums = await client.query(
      "SELECT typname FROM pg_type WHERE typtype = 'e' AND schemaname = 'public' ORDER BY typname"
    );
    const enumNames = actualEnums.rows.map(e => e.typname);
    console.log('\nEnums:');
    actualEnums.rows.forEach(e => console.log('  -', e.typname));
    expectedEnums.forEach(e => {
      const ok = enumNames.includes(e);
      console.log(`  ${ok ? '✅' : '❌'} ${e} (expected)`);
    });

    const fks = await client.query(`
      SELECT tc.constraint_name, tc.table_name, kcu.column_name,
             ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `);
    console.log('\nForeign keys (' + fks.rowCount + '):');
    fks.rows.forEach(fk => {
      console.log(`  [${fk.table_name}] ${fk.constraint_name}`);
      console.log(`    ${fk.column_name} -> ${fk.foreign_table}.${fk.foreign_column}`);
    });

    console.log('\n--- Schema.ts vs DB ---');
    const schemaPath = './src/db/schema.ts';
    try {
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      const tableMatches = schemaContent.match(/export const \w+ = pgTable/g) || [];
      console.log('Tables in schema.ts:');
      tableMatches.forEach(m => {
        const tableName = m.replace('export const ', '').replace(' = pgTable', '');
        const exists = existing.includes(tableName);
        console.log(`  ${exists ? '✅' : '❌ MISSING'} ${tableName}`);
      });
    } catch (e) {
      console.log('Could not read schema.ts');
    }

    await client.end();
    console.log('\n✅ SBE DB check complete\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

main();
