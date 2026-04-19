-- Performance indexes for foreign keys and commonly queried columns
-- Note: IF NOT EXISTS guards ensure idempotency

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS idx_orders_match_id ON "orders"("match_id");
CREATE INDEX IF NOT EXISTS idx_orders_status ON "orders"("status");

-- trades
CREATE INDEX IF NOT EXISTS idx_trades_match_id ON "trades"("match_id");
CREATE INDEX IF NOT EXISTS idx_trades_backer_id ON "trades"("backer_id");
CREATE INDEX IF NOT EXISTS idx_trades_layer_id ON "trades"("layer_id");

-- wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON "wallets"("user_id");

-- ledger_entries
CREATE INDEX IF NOT EXISTS idx_ledger_entries_wallet_id ON "ledger_entries"("wallet_id");

-- deposit_requests
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON "deposit_requests"("user_id");

-- withdrawal_requests
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON "withdrawal_requests"("user_id");

-- announcements
CREATE INDEX IF NOT EXISTS idx_announcements_active ON "announcements"("active");
