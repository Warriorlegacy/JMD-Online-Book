import { Pool } from "pg";

// Trim env var to guard against trailing newlines from CI/CD env injection
const connectionString = (process.env.DATABASE_URL ?? "").trim();

// Append SSL mode if not already present (required for Supabase)
const DATABASE_URL = connectionString.includes("sslmode=")
  ? connectionString
  : `${connectionString}?sslmode=require`;

// Singleton pool — reused across Next.js serverless hot reloads
const globalForDb = globalThis as unknown as { _pgPool?: Pool };

export const pool: Pool =
  globalForDb._pgPool ??
  new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

// Cache in dev to survive HMR; in prod each function instance is fresh
if (process.env.NODE_ENV !== "production") {
  globalForDb._pgPool = pool;
}
