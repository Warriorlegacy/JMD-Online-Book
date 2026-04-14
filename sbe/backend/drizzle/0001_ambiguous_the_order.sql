ALTER TABLE "ledger_entries" ALTER COLUMN "amount" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "price" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "stake" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "filled_stake" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "filled_stake" SET DEFAULT '0.00000000';--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "price" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "stake" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT '0.00000000';--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "locked_balance" SET DATA TYPE numeric(20, 8);--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "locked_balance" SET DEFAULT '0.00000000';--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD COLUMN "currency" varchar(3) NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "currency" varchar(3) DEFAULT 'INR' NOT NULL;