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
--> statement-breakpoint
ALTER TABLE "market_history" ADD CONSTRAINT "market_history_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;