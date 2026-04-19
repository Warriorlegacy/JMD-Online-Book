import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./src/db/schema.js";

async function runMigrations() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool, { schema });

    console.log("Running database migrations...");
    
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    if (process.env.NODE_ENV !== 'production') console.log("✅ Migrations completed successfully!");
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
