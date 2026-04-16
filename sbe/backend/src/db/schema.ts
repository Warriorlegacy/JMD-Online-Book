import { pgTable, uuid, text, timestamp, decimal, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

export const orderTypeEnum = pgEnum("order_type", ["back", "lay"]);
export const orderStatusEnum = pgEnum("order_status", ["open", "partially_filled", "filled", "cancelled"]);
export const matchStatusEnum = pgEnum("match_status", ["scheduled", "in_play", "completed", "cancelled"]);

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "approved", "rejected", "completed"]);

// 1. Scalable Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Multi-Currency Wallets (8-decimal precision for crypto/fractional scaling)
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR").notNull(),
  balance: decimal("balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
  lockedBalance: decimal("locked_balance", { precision: 20, scale: 8 }).default("0.00000000").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sportType: varchar("sport_type", { length: 50 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  tournamentId: uuid("tournament_id").references(() => tournaments.id).notNull(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  startTime: timestamp("start_time").notNull(),
  status: matchStatusEnum("status").default("scheduled").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
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

export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").references(() => wallets.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  type: text("type").notNull(),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
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
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  upiId: text("upi_id").notNull(),
  utrNumber: varchar("utr_number", { length: 50 }).notNull().unique(),
  status: transactionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Withdrawal Requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  upiId: text("upi_id").notNull(),
  status: transactionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Announcements
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message").notNull(),
  active: integer("active").default(1).notNull(), // 1 for active, 0 for inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

