const { Client } = require('pg');

async function checkLiveMatches() {
    try {
        const res = await fetch('http://127.0.0.1:3210/api/matches/active');
        if (!res.ok) {
            console.error(`Endpoint failed with status ${res.status}`);
            return false;
        }
        const data = await res.json();
        console.log(`Endpoint returned ${data.length} matches.`);
        return data.length > 0;
    } catch (e) {
        console.error('Failed to fetch from endpoint:', e.message);
        return false;
    }
}

async function investigateDB() {
    console.log('Investigating DB Connectivity...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log('✅ Connected to Supabase');
        const res = await client.query("SELECT COUNT(*) FROM sport_events WHERE status = 'in_play'");
        console.log(`DB Count of active matches: ${res.rows[0].count}`);
        await client.end();
    } catch (err) {
        console.error('❌ DB Error:', err.message);
    }
}

async function main() {
    const hasMatches = await checkLiveMatches();
    if (!hasMatches) {
        console.log('0 matches returned or health check failed. Investigating DB...');
        await investigateDB();
    } else {
        console.log('Health check passed. Live matches found.');
    }
}
main();
