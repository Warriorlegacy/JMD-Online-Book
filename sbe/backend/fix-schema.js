import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ 
    connectionString: "postgres://postgres:GJH31Qc0uvlzbdpD@db.zkvrlwqcfeecsecrzlnu.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("Connecting to DB...");
        
        // 1. Create MISSING ENUMS
        await pool.query(`
            DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
            DO $$ BEGIN CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
            DO $$ BEGIN CREATE TYPE order_type AS ENUM ('back', 'lay'); EXCEPTION WHEN duplicate_object THEN null; END $$;
            DO $$ BEGIN CREATE TYPE order_status AS ENUM ('open', 'partially_filled', 'filled', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
            DO $$ BEGIN CREATE TYPE match_status AS ENUM ('scheduled', 'in_play', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
        `);
        console.log("Enums created or already exist.");

        // 2. Fix users table
        await pool.query(`
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" text;
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" user_role DEFAULT 'user' NOT NULL;
        `);
        // If there are existing users without a username, set a UUID-based username temporarily to avoid unique constraint violations
        await pool.query(`
            UPDATE "users" SET "username" = 'usr_' || substring(id::text from 1 for 8) WHERE "username" IS NULL;
        `);
        // Now enforce NOT NULL and UNIQUE on username
        await pool.query(`
            ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
                    ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
                END IF;
            END $$;
        `);
        console.log("Users table updated.");

        // 3. Create missing tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "deposit_requests" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "user_id" uuid NOT NULL REFERENCES "public"."users"("id"),
                "amount" numeric(20, 8) NOT NULL,
                "upi_id" text NOT NULL,
                "utr_number" varchar(50) NOT NULL UNIQUE,
                "status" "transaction_status" DEFAULT 'pending' NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "withdrawal_requests" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "user_id" uuid NOT NULL REFERENCES "public"."users"("id"),
                "amount" numeric(20, 8) NOT NULL,
                "upi_id" text NOT NULL,
                "status" "transaction_status" DEFAULT 'pending' NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "announcements" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "message" text NOT NULL,
                "active" integer DEFAULT 1 NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log("Missing tables created.");

        // 4. Update the schema references if orders or trades miss selectionId
        await pool.query(`
            ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "selection_id" text;
            ALTER TABLE "trades" ADD COLUMN IF NOT EXISTS "selection_id" text;
            ALTER TABLE "market_history" ADD COLUMN IF NOT EXISTS "selection_id" text;
        `);
        console.log("Added selection_id to relevant tables.");

        console.log("Schema update complete!");
    } catch (err) {
        console.error("Error updating schema:", err);
    } finally {
        await pool.end();
    }
}

main();
