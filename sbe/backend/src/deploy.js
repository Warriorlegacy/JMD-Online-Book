import pg from "pg";
import fs from "fs";
import path from "path";

async function deploy() {
  // Using Direct Connection (5432) instead of Pooler (6543)
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    if (process.env.NODE_ENV !== 'production') console.log("[Deploy] Connected to Supabase (Direct)");

    const rootPath = process.cwd();
    const sql0 = fs.readFileSync(path.join(rootPath, "drizzle/0000_tidy_golden_guardian.sql"), "utf-8");
    const sql1 = fs.readFileSync(path.join(rootPath, "drizzle/0001_ambiguous_the_order.sql"), "utf-8");

    const runSql = async (content) => {
      const parts = content.split("--> statement-breakpoint");
      for (let part of parts) {
        if (part.trim()) {
          process.stdout.write(".");
          await client.query(part);
        }
      }
    };

    if (process.env.NODE_ENV !== 'production') console.log("[Deploy] Running 0000...");
    await runSql(sql0);
    if (process.env.NODE_ENV !== 'production') console.log("\n[Deploy] Running 0001...");
    await runSql(sql1);

    if (process.env.NODE_ENV !== 'production') console.log("\n[Deploy] Success!");
  } catch (err) {
    console.error("\n[Deploy] Failed:", err.message);
  } finally {
    await client.end();
  }
}

deploy();
