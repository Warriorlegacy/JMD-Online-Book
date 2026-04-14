import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
  const connectionString = "postgres://postgres.zkvrlwqcfeecsecrzlnu:GJH31Qc0uvlzbdpD@aws-0-us-east-1.pooler.supabase.com:6543/postgres";
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("[Deploy] Connected to Supabase");

    const sql0 = fs.readFileSync(path.join(__dirname, "../drizzle/0000_tidy_golden_guardian.sql"), "utf-8");
    const sql1 = fs.readFileSync(path.join(__dirname, "../drizzle/0001_ambiguous_the_order.sql"), "utf-8");

    // Drizzle SQL files often contain statement-breakpoints. Let's split and run.
    const runSql = async (content: string) => {
      const parts = content.split("--> statement-breakpoint");
      for (let part of parts) {
        if (part.trim()) {
          process.stdout.write(".");
          await client.query(part);
        }
      }
    };

    console.log("[Deploy] Running 0000...");
    await runSql(sql0);
    console.log("\n[Deploy] Running 0001...");
    await runSql(sql1);

    console.log("\n[Deploy] Success!");
  } catch (err) {
    console.error("\n[Deploy] Failed:", err);
  } finally {
    await client.end();
  }
}

deploy();
