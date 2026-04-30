const { createRequire } = require("node:module");
const path = require("node:path");

const repoRoot = __dirname;
const webRoot = path.join(repoRoot, "sbe", "web");
const webRequire = createRequire(path.join(webRoot, "package.json"));

async function main() {
  const { Pool } = webRequire("pg");

  if (!process.env.DATABASE_URL) {
     console.error("DATABASE_URL is not set.");
     process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
     console.log("Connecting to Database...");
     const res = await pool.query("SELECT count(*) FROM matches WHERE status='in_play'");
     console.log(`Active matches count in DB: ${res.rows[0].count}`);
     const res2 = await pool.query(`
        SELECT id, team_a as "teamA", team_b as "teamB", start_time as "startTime", status
        FROM matches
        WHERE status='in_play' OR status='scheduled'
        LIMIT 5
     `);
     console.log("Sample active matches:", JSON.stringify(res2.rows, null, 2));

     const matchIds = res2.rows.map(row => row.id);
     if (matchIds.length > 0) {
       const res3 = await pool.query(`
           SELECT event_id as "matchId", market_name as "marketName", outcome as selection, COALESCE(override_back_odds, back_odds, lay_odds) as odds
           FROM public.odds_markets
           WHERE event_id = ANY($1::uuid[])
             AND COALESCE(is_active, true) = true
       `, [matchIds]);
       console.log("Associated odds markets:", JSON.stringify(res3.rows, null, 2));
     }

  } catch (error) {
     console.error("Database connection or query failed:", error);
  } finally {
     await pool.end();
  }
}

main();
