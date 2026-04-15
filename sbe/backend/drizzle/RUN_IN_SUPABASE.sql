-- =====================================================
-- SBE Database Migration - Complete SQL for Supabase
-- =====================================================
-- Run this in Supabase SQL Editor to create all tables

-- Step 1: Create ENUM types
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'in_play', 'completed', 'cancelled');
CREATE TYPE "public"."order_status" AS ENUM('open', 'partially_filled', 'filled', 'cancelled');
CREATE TYPE "public"."order_type" AS ENUM('back', 'lay');

-- Step 2: Create tables
CREATE TABLE "tournaments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "sport_type" varchar(50) NOT NULL,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL,
    "password_hash" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "wallets" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
    "locked_balance" numeric(20, 8) DEFAULT '0.00000000' NOT NULL,
    "currency" varchar(3) DEFAULT 'INR' NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "matches" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tournament_id" uuid NOT NULL,
    "team_a" text NOT NULL,
    "team_b" text NOT NULL,
    "start_time" timestamp NOT NULL,
    "status" "match_status" DEFAULT 'scheduled' NOT NULL,
    "metadata" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "orders" (
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

CREATE TABLE "trades" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "match_id" uuid NOT NULL,
    "backer_id" uuid NOT NULL,
    "layer_id" uuid NOT NULL,
    "price" numeric(10, 4) NOT NULL,
    "stake" numeric(20, 8) NOT NULL,
    "settled" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "ledger_entries" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "wallet_id" uuid NOT NULL,
    "amount" numeric(20, 8) NOT NULL,
    "currency" varchar(3) NOT NULL,
    "type" text NOT NULL,
    "reference_id" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "market_history" (
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

-- Step 3: Add foreign key constraints
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" 
    FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "orders" ADD CONSTRAINT "orders_match_id_matches_id_fk" 
    FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "trades" ADD CONSTRAINT "trades_match_id_matches_id_fk" 
    FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "trades" ADD CONSTRAINT "trades_backer_id_users_id_fk" 
    FOREIGN KEY ("backer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "trades" ADD CONSTRAINT "trades_layer_id_users_id_fk" 
    FOREIGN KEY ("layer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_wallet_id_wallets_id_fk" 
    FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "market_history" ADD CONSTRAINT "market_history_match_id_matches_id_fk" 
    FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next: Run the seed script or add data manually
-- =====================================================
