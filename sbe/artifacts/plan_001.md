# plan_001.md - SBE Blueprint & Execution Plan

This is the authoritative plan for the Sports Betting Exchange (SBE). 

## 1. Database Schema (PostgreSQL)

### Core Tables
- **`users`**: ID, Email, PasswordHash, CreatedAt.
- **`wallets`**: UserID, Balance (Decimal), LockedBalance (Liability coverage).
- **`tournaments`**: ID, Name, SportType, Metadata (JSONB).
- **`matches`**: ID, TournamentID, TeamA, TeamB, StartTime, Status (Scheduled/Live/Ended).
- **`orders`**: ID, UserID, MatchID, Type (Back/Lay), Price (Odds), Stake, Status (Open/PartiallyFilled/Filled/Cancelled).
- **`ledger`**: ID, WalletID, Amount, Type (Credit/Debit/Escrow), ReferenceID (Order/Match).

## 2. Order Matching Engine (Rust)

- **Structure**:
    - `RingBuffer`: To hold incoming orders from the Disruptor.
    - `PriceLevel`: A lock-free structure (likely BTreeMap or optimized Vec) for specific price points.
    - `MatchingLogic`: Price-Time priority matching.
- **FFI Boundary**:
    - The Rust engine will expose a C-compatible API or communicate via Redis/IPC for rapid event ingestion from Node.js.

## 3. Node.js Backend (TypeScript / Fastify)

- **Express/Fastify**: To handle HTTP requests (Auth, Wallet, Market discovery).
- **WebSocket Gateway**: For push updates to the UI.
- **Risk Manager**: Middleware to check wallet liability *before* forwarding orders to the Rust engine.

## 4. Frontend (Next.js 15)

- **Real-time Orderbook**: Visual depth charts showing liquidity at various prices.
- **Odds Grid**: Standard sports betting interface with "Back" (Blue) and "Lay" (Pink) columns.
- **Account Dashboard**: Historical trades, current liabilities, and balance management.

## 5. Execution Steps

### Phase 1: PostgreSQL & Shared Libraries
- Implement the core schema using Drizzle.
- Define shared types for events.

### Phase 2: Rust Engine Core
- Implement the `Order` struct and basic `OrderBook` logic.
- Integrate the Disruptor pattern.

### Phase 3: real-time Pipeline
- Connect Rust matches to Redis Pub/Sub.
- Node.js consumers forwarding to WebSockets.

### Phase 4: UI/UX
- Build the matching interface and landing page.

## 6. Verification
- **Unit Tests**: Rust liability checks, Node.js risk checks.
- **Integration Tests**: Full flow from UI order to matched trade.
