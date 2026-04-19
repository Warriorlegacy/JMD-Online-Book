import pg from "pg";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    if (process.env.NODE_ENV !== 'production') console.log("[Seed] Populating initial markets...");

    // 1. Insert Tournament
    const tournamentId = "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2";
    await client.query(`
      INSERT INTO tournaments (id, name, sport_type) 
      VALUES ('${tournamentId}', 'Premier League', 'Soccer')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Insert Demo Match
    const matchId = "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1";
    await client.query(`
      INSERT INTO matches (id, tournament_id, team_a, team_b, start_time, status)
      VALUES (
        '${matchId}', 
        '${tournamentId}', 
        'Manchester City', 
        'Arsenal', 
        NOW(), 
        'in_play'
      )
       ON CONFLICT (id) DO NOTHING;
     `);

    if (process.env.NODE_ENV !== 'production') console.log("[Seed] Cloud market data populated successfully!");
  } catch (err) {
    console.error("[Seed] Failed:", err.message);
  } finally {
    await client.end();
  }
}

seed();
