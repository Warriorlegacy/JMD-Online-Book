CREATE TYPE "public"."bet_status" AS ENUM('open', 'won', 'lost', 'cashed_out', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('pending', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "bet_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bet_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"market_id" uuid NOT NULL,
	"selection_id" text NOT NULL,
	"odds" numeric(10, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"total_odds" numeric(10, 4) NOT NULL,
	"stake" numeric(20, 8) NOT NULL,
	"potential_payout" numeric(20, 8) NOT NULL,
	"status" "bet_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"decision" "kyc_status" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odds_markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"match_id" uuid NOT NULL,
	"market_name" text NOT NULL,
	"selection" text NOT NULL,
	"odds" numeric(10, 4) NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"referral_id" uuid NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"commission_percentage" numeric(5, 2) NOT NULL,
	"trade_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"referrer_id" uuid NOT NULL,
	"referee_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"status" "referral_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referee_id_unique" UNIQUE("referee_id"),
	CONSTRAINT "referrals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "deposit_requests" ALTER COLUMN "upi_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deposit_requests" ALTER COLUMN "utr_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deposit_requests" ADD COLUMN "payment_gateway" varchar(50);--> statement-breakpoint
ALTER TABLE "deposit_requests" ADD COLUMN "payment_reference" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kyc_status" "kyc_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kyc_documents" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_code" varchar(8);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_by_code" varchar(8);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_status" "referral_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "bet_selections" ADD CONSTRAINT "bet_selections_bet_id_bets_id_fk" FOREIGN KEY ("bet_id") REFERENCES "public"."bets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet_selections" ADD CONSTRAINT "bet_selections_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet_selections" ADD CONSTRAINT "bet_selections_market_id_odds_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."odds_markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bets" ADD CONSTRAINT "bets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_reviews" ADD CONSTRAINT "kyc_reviews_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_reviews" ADD CONSTRAINT "kyc_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_reviews" ADD CONSTRAINT "kyc_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odds_markets" ADD CONSTRAINT "odds_markets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odds_markets" ADD CONSTRAINT "odds_markets_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_earnings" ADD CONSTRAINT "referral_earnings_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_external_id_unique" UNIQUE("external_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code");