import pg from "pg";

async function deployMarketHistory() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    if (process.env.NODE_ENV !== 'production') console.log("[Deploy] Creating market_history table...");

    const sql = `
      CREATE TABLE IF NOT EXISTS market_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        match_id uuid NOT NULL,
        interval varchar(10) NOT NULL,
        open numeric(10, 4) NOT NULL,
        high numeric(10, 4) NOT NULL,
        low numeric(10, 4) NOT NULL,
        close numeric(10, 4) NOT NULL,
        volume numeric(20, 8) NOT NULL,
        timestamp timestamp NOT NULL,
        CONSTRAINT market_history_match_id_matches_id_fk FOREIGN KEY (match_id) REFERENCES matches(id)
      );
    `;

    await client.query(sql);
    if (process.env.NODE_ENV !== 'production') console.log("[Deploy] Table created successfully!");
  } catch (err) {
    console.error("[Deploy] Failed:", err.message);
  } finally {
    await client.end();
  }
}

deployMarketHistory();
