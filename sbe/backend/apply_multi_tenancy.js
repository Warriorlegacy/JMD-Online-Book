import { Pool } from 'pg';
import 'dotenv/config';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Applying multi-tenancy schema changes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "tenants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "slug" varchar(50) NOT NULL UNIQUE,
        "plan" varchar(20) DEFAULT 'free' NOT NULL,
        "is_active" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    const tables = [
      'announcements', 'deposit_requests', 'ledger_entries', 'matches', 
      'orders', 'tournaments', 'trades', 'users', 'wallets', 'withdrawal_requests'
    ];
    for (const table of tables) {
      await pool.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "tenant_id" uuid REFERENCES "tenants"("id");`);
    }
    console.log('✅ Multi-tenancy schema applied successfully!');
  } catch (e) {
    console.error('❌ Error applying schema:', e);
  } finally {
    await pool.end();
  }
}
run();
