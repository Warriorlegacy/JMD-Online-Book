-- =====================================================
-- SBE Complete Database Setup - Supabase
-- =====================================================
-- This file contains both migration AND seed data
-- Safe to run multiple times - uses IF NOT EXISTS
-- =====================================================

-- =====================================================
-- PART 1: DATABASE MIGRATION
-- =====================================================

-- Step 1: Create ENUM types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'in_play', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."order_status" AS ENUM('open', 'partially_filled', 'filled', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."order_type" AS ENUM('back', 'lay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create tables (only if they don't exist)

CREATE TABLE IF NOT EXISTS "tournaments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "sport_type" varchar(50) NOT NULL,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL,
    "password_hash" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "wallets" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
    "locked_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
    "currency" varchar(3) DEFAULT 'INR' NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "matches" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tournament_id" uuid NOT NULL,
    "team_a" text NOT NULL,
    "team_b" text NOT NULL,
    "start_time" timestamp NOT NULL,
    "status" "match_status" DEFAULT 'scheduled' NOT NULL,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "match_id" uuid NOT NULL,
    "type" "order_type" NOT NULL,
    "price" numeric(10, 4) NOT NULL,
    "stake" numeric(20, 8) NOT NULL,
    "filled_stake" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
    "status" "order_status" DEFAULT 'open' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trades" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "match_id" uuid NOT NULL,
    "backer_id" uuid NOT NULL,
    "layer_id" uuid NOT NULL,
    "price" numeric(10, 4) NOT NULL,
    "stake" numeric(20, 8) NOT NULL,
    "settled" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ledger_entries" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "wallet_id" uuid NOT NULL,
    "amount" numeric(20, 8) NOT NULL,
    "currency" varchar(3) NOT NULL,
    "type" text NOT NULL,
    "reference_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "market_history" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "match_id" uuid NOT NULL,
    "interval" varchar(10) NOT NULL,
    "open" numeric(10, 4) NOT NULL,
    "high" numeric(10, 4) NOT NULL,
    "low" numeric(10, 4) NOT NULL,
    "close" numeric(10, 4) NOT NULL,
    "volume" numeric(20, 8) NOT NULL,
    "timestamp" timestamp NOT NULL
);

-- Step 3: Add foreign key constraints (only if they don't exist)

DO $$ BEGIN
    ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" 
        FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_match_id_matches_id_fk" 
        FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "trades" ADD CONSTRAINT "trades_match_id_matches_id_fk" 
        FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "trades" ADD CONSTRAINT "trades_backer_id_users_id_fk" 
        FOREIGN KEY ("backer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "trades" ADD CONSTRAINT "trades_layer_id_users_id_fk" 
        FOREIGN KEY ("layer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_wallet_id_wallets_id_fk" 
        FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "market_history" ADD CONSTRAINT "market_history_match_id_matches_id_fk" 
        FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PART 2: SEED DATA (Sample Data for Testing)
-- =====================================================

-- Step 1: Create a tournament (only if it doesn't exist)
INSERT INTO "tournaments" ("name", "sport_type", "metadata")
VALUES (
    'Premier League 2026',
    'football',
    '{"country": "England", "season": "2025-26"}'::text
)
ON CONFLICT DO NOTHING;

-- Step 2: Create matches (only if table is empty)
DO $$
DECLARE
    tournament_id_val uuid;
    match_count integer;
BEGIN
    -- Get the tournament ID
    SELECT id INTO tournament_id_val FROM "tournaments" WHERE name = 'Premier League 2026' LIMIT 1;
    
    -- Check if matches table has any data
    SELECT COUNT(*) INTO match_count FROM "matches";
    
    -- Only insert if table is empty
    IF match_count = 0 THEN
        -- Create an IN_PLAY match (Manchester City v Arsenal)
        INSERT INTO "matches" ("tournament_id", "team_a", "team_b", "start_time", "status", "metadata")
        VALUES (
            tournament_id_val,
            'Manchester City',
            'Arsenal',
            NOW() + INTERVAL '1 hour',
            'in_play',
            '{"venue": "Etihad Stadium", "round": "Matchday 30"}'::text
        );

        -- Create a SCHEDULED match (Liverpool v Chelsea)
        INSERT INTO "matches" ("tournament_id", "team_a", "team_b", "start_time", "status", "metadata")
        VALUES (
            tournament_id_val,
            'Liverpool',
            'Chelsea',
            NOW() + INTERVAL '1 day',
            'scheduled',
            '{"venue": "Anfield", "round": "Matchday 30"}'::text
        );

        -- Create another SCHEDULED match (Manchester United v Tottenham)
        INSERT INTO "matches" ("tournament_id", "team_a", "team_b", "start_time", "status", "metadata")
        VALUES (
            tournament_id_val,
            'Manchester United',
            'Tottenham',
            NOW() + INTERVAL '2 days',
            'scheduled',
            '{"venue": "Old Trafford", "round": "Matchday 31"}'::text
        );
    END IF;
END $$;

-- =====================================================
-- PART 3: VERIFICATION
-- =====================================================

-- Show all tournaments
SELECT 'Tournaments:' AS info;
SELECT id, name, sport_type FROM "tournaments";

-- Show all matches
SELECT 'Matches:' AS info;
SELECT id, team_a, team_b, status, start_time FROM "matches";

-- =====================================================
-- ✅ COMPLETE SETUP SUCCESSFUL!
-- =====================================================
-- Your database now has:
-- ✓ All 8 tables created
-- ✓ ENUM types configured
-- ✓ Foreign key constraints added
-- ✓ Sample tournament data
-- ✓ 3 matches (1 in_play, 2 scheduled)
-- =====================================================
-- Next: Restart your Render service and test the API
-- =====================================================
