const { Client } = require('pg');
const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:GJH31Qc0uvlzbdpD@db.zkvrlwqcfeecsecrzlnu.supabase.co:5432/postgres';

(async () => {
  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl && !dbUrl.includes('localhost') ? { rejectUnauthorized: false } : undefined
  });
  await client.connect();

  // Query enum values
  const res = await client.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t 
    JOIN pg_namespace n ON t.typnamespace = n.oid
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typtype = 'e' AND n.nspname = 'public'
    ORDER BY t.typname, e.enumlabel
  `);
  console.log('Enum definitions:');
  const current = {};
  res.rows.forEach(r => {
    if (!current[r.typname]) current[r.typname] = [];
    current[r.typname].push(r.enumlabel);
  });
  Object.entries(current).forEach(([k, v]) => {
    console.log(`\n  ${k}: [${v.join(', ')}]`);
  });

  await client.end();
})();
