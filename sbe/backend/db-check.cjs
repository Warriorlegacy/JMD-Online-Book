const fs = require('fs');
const { Client } = require('pg');

let dbUrl = process.env.DATABASE_URL;
try {
  const env = fs.readFileSync('.env', 'utf-8');
  env.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val[0] && key.trim() === 'DATABASE_URL') {
      dbUrl = val.join('=').replace(/^["']|["']$/g, '').trim();
    }
  });
} catch {}

if (!dbUrl) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: dbUrl && !dbUrl.includes('localhost') ? { rejectUnauthorized: false } : undefined
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected\n');

    // Tables
    const tables = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log(`Tables (${tables.rowCount}):`);
    tables.rows.forEach(t => console.log('  -', t.tablename));

    // Indexes
    const indexes = await client.query(
      "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname"
    );
    console.log(`\nIndexes (${indexes.rowCount}):`);
    indexes.rows.forEach(i => {
      console.log(`  [${i.tablename}] ${i.indexname}`);
      // Show definition preview
      const def = i.indexdef.replace(/\n/g, ' ').substring(0, 100);
      console.log(`    ${def}...`);
    });

    // Foreign keys
    const fks = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `);
    console.log(`\nForeign Keys (${fks.rowCount}):`);
    fks.rows.forEach(fk => {
      console.log(`  [${fk.table_name}] ${fk.constraint_name}`);
      console.log(`    ${fk.column_name} -> ${fk.foreign_table}.${fk.foreign_column}`);
    });

    // Enums (use pg_type + pg_namespace)
    const enums = await client.query(`
      SELECT t.typname AS enum_name
      FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE t.typtype = 'e' AND n.nspname = 'public'
      ORDER BY enum_name
    `);
    console.log(`\nEnums (${enums.rowCount}):`);
    enums.rows.forEach(e => console.log('  -', e.enum_name));

    await client.end();
    console.log('\n✅ Done\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (client) await client.end();
    process.exit(1);
  }
})();
