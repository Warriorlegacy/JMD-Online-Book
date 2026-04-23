import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 'postgresql://postgres.zkvrlwqcfeecsecrzlnu:GJH31Qc0uvlzbdpD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
    .then(res => {
        console.log('✅ Connected via Pooler:', res.rows[0]);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
    })
    .finally(() => {
        pool.end();
    });
