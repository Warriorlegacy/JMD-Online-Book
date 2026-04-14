import pg from "pg";

async function seed() {
  const connectionString = "postgres://postgres:GJH31Qc0uvlzbdpD@db.zkvrlwqcfeecsecrzlnu.supabase.co:5432/postgres";
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("[Seed] Populating initial markets...");

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

    console.log("[Seed] Cloud market data populated successfully!");
  } catch (err) {
    console.error("[Seed] Failed:", err.message);
  } finally {
    await client.end();
  }
}

seed();
