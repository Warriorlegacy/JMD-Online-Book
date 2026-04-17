import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const migrations = [
  "001_jmd_online_book.sql",
  "002_multi_tenant.sql",
  "003_performance_indexes.sql",
  "004_gamification_system.sql",
];

async function runMigrations() {
  console.log("Starting database migrations...");

  for (const migration of migrations) {
    console.log(`Running migration: ${migration}`);

    try {
      const sql = readFileSync(join(process.cwd(), "supabase", "migrations", migration), "utf8");

      // Split the SQL into individual statements and execute them
      const statements = sql
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc("exec_sql", { sql: statement });
            if (error) {
              console.error(`Error in statement: ${statement.substring(0, 100)}...`);
              console.error(error);
              // Continue with other statements
            }
          } catch (err) {
            console.error(`Failed to execute statement: ${statement.substring(0, 100)}...`);
            console.error(err);
            // Continue with other statements
          }
        }
      }

      console.log(`Migration ${migration} completed`);
    } catch (error) {
      console.error(`Failed to run migration ${migration}:`, error);
      // Continue with next migration
    }
  }

  console.log("All migrations completed");
}

runMigrations().catch(console.error);