import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    if (process.env.NODE_ENV !== 'production') console.log("[Deploy] Connected to Supabase");

    const sql0 = fs.readFileSync(path.join(__dirname, "../drizzle/0000_tidy_golden_guardian.sql"), "utf-8");
    const sql1 = fs.readFileSync(path.join(__dirname, "../drizzle/0001_ambiguous_the_order.sql"), "utf-8");

    // Drizzle SQL files often contain statement-breakpoints.
    // We execute the entire file in one go to reduce network round-trips.
    const runSql = async (content: string) => {
      const sql = content.replace(/--> statement-breakpoint/g, "");
      if (sql.trim()) {
        process.stdout.write(".");
        await client.query(sql);
      }
    };

    if (process.env.NODE_ENV !== 'production') console.log("[Deploy] Running 0000...");
    await runSql(sql0);
    if (process.env.NODE_ENV !== 'production') console.log("\n[Deploy] Running 0001...");
    await runSql(sql1);

    if (process.env.NODE_ENV !== 'production') console.log("\n[Deploy] Success!");
  } catch (err) {
    console.error("\n[Deploy] Failed:", err);
  } finally {
    await client.end();
  }
}

deploy();
