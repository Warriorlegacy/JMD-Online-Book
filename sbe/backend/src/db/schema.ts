import { pgTable, uuid, text, timestamp, decimal, varchar, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const orderTypeEnum = pgEnum("order_type", ["back", "lay"]);
export const orderStatusEnum = pgEnum("order_status", ["open", "partially_filled", "filled", "cancelled"]);
export const betStatusEnum = pgEnum("bet_status", ["open", "won", "lost", "cashed_out", "cancelled"]);
export const matchStatusEnum = pgEnum("match_status", ["scheduled", "in_play", "completed", "cancelled"]);
export const kycStatusEnum = pgEnum("kyc_status", ["pending", "verified", "rejected"]);

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "approved", "rejected", "completed"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "active", "completed", "cancelled"]);

// 0. Tenants (Multi-tenancy root)
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // For subdomain/url routing
  plan: varchar("plan", { length: 20 }).default("free").notNull(),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 1. Scalable Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user").notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: integer("two_factor_enabled").default(0).notNull(),
  kycStatus: kycStatusEnum("kyc_status").default("pending").notNull(),
  kycDocuments: jsonb("kyc_documents"),
  referralCode: varchar("referral_code", { length: 8 }).unique(),
  referredByCode: varchar("referred_by_code", { length: 8 }),
  referralStatus: referralStatusEnum("referral_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  referrerId: uuid("referrer_id").references(() => users.id).notNull(),
  refereeId: uuid("referee_id").references(() => users.id).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  status: referralStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const referralEarnings = pgTable("referral_earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  referralId: uuid("referral_id").references(() => referrals.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).notNull(),
  tradeId: uuid("trade_id").references(() => trades.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Multi-Currency Wallets (8-decimal precision for crypto/fractional scaling)
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR").notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
  lockedBalance: decimal("locked_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  name: text("name").notNull(),
  sportType: varchar("sport_type", { length: 50 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  tournamentId: uuid("tournament_id").references(() => tournaments.id).notNull(),
  externalId: text("external_id").unique(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  startTime: timestamp("start_time").notNull(),
  status: matchStatusEnum("status").default("scheduled").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oddsMarkets = pgTable("odds_markets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  marketName: text("market_name").notNull(),
  selection: text("selection").notNull(),
  odds: decimal("odds", { precision: 10, scale: 4 }).notNull(),
  status: text("status").default("active").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  matchID: uuid("match_id").references(() => matches.id).notNull(),
  selectionId: text("selection_id"), // e.g. "team_a", "team_b", "draw"
  type: orderTypeEnum("type").notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  stake: decimal("stake", { precision: 20, scale: 8 }).notNull(),
  filledStake: decimal("filled_stake", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
  status: orderStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bets = pgTable("bets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  totalOdds: decimal("total_odds", { precision: 10, scale: 4 }).notNull(),
  stake: decimal("stake", { precision: 20, scale: 8 }).notNull(),
  potentialPayout: decimal("potential_payout", { precision: 20, scale: 8 }).notNull(),
  status: betStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const betSelections = pgTable("bet_selections", {
  id: uuid("id").primaryKey().defaultRandom(),
  betId: uuid("bet_id").references(() => bets.id).notNull(),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  marketId: uuid("market_id").references(() => oddsMarkets.id).notNull(),
  selectionId: text("selection_id").notNull(),
  odds: decimal("odds", { precision: 10, scale: 4 }).notNull(),
});

export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  walletId: uuid("wallet_id").references(() => wallets.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  type: text("type").notNull(),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  matchID: uuid("match_id").references(() => matches.id).notNull(),
  selectionId: text("selection_id"), // e.g. "team_a", "team_b", "draw"
  backerId: uuid("backer_id").references(() => users.id).notNull(),
  layerId: uuid("layer_id").references(() => users.id).notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  stake: decimal("stake", { precision: 20, scale: 8 }).notNull(),
  settled: integer("settled").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketHistory = pgTable("market_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  selectionId: text("selection_id"), // e.g. "team_a", "team_b", "draw"
  interval: varchar("interval", { length: 10 }).notNull(),
  open: decimal("open", { precision: 10, scale: 4 }).notNull(),
  high: decimal("high", { precision: 10, scale: 4 }).notNull(),
  low: decimal("low", { precision: 10, scale: 4 }).notNull(),
  close: decimal("close", { precision: 10, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// 9. Deposit Requests
export const depositRequests = pgTable("deposit_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  upiId: text("upi_id"),
  utrNumber: varchar("utr_number", { length: 50 }).unique(),
  paymentGateway: varchar("payment_gateway", { length: 50 }),
  paymentReference: text("payment_reference"),
  status: transactionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Withdrawal Requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  upiId: text("upi_id").notNull(),
  status: transactionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Announcements
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  message: text("message").notNull(),
  active: integer("active").default(1).notNull(), // 1 for active, 0 for inactive
   createdAt: timestamp("created_at").defaultNow().notNull(),
   updatedAt: timestamp("updated_at").defaultNow().notNull(),
 });

export const kycReviews = pgTable("kyc_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id).notNull(),
  decision: kycStatusEnum("decision").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


