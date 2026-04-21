# AGENTS.md - The SBE Constitution

This is the supreme behavioral rulebook for the ultra-low latency Sports Betting Exchange (SBE) project. All autonomous agents operating in this workspace must adhere to these directives.

## 1. Agent Personas & Responsibilities

| Persona | Responsibility |
| :--- | :--- |
| **Lead System Architect** | Orchestrates project state, reviews API contracts, and manages the `.agents/` cognitive layer. |
| **Rust Systems Engineer** | Implements the high-performance matching engine, LMAX Disruptor, and liability mathematics. |
| **Full-Stack Developer** | Implemented the Node.js (TypeScript) backend and Next.js (Tailwind v4 / Shadcn) frontend. |
| **QA Specialist** | Ensures 100% test coverage for liability logic and executes self-healing debug loops. |

## 2. Technology Stack & Constraints

- **Matching Engine**: Rust (Lock-free, Mechanical Sympathy, NO garbage collection).
- **Backend**: Node.js 22+ (TypeScript, Fastify/Express).
- **Database**: PostgreSQL (ACID compliant, JSONB for stats).
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind v4.
- **Financial Logic**:
    - **Rust**: Use `u64` representing the smallest currency unit (e.g., cents/pips).
    - **PostgreSQL**: Use `DECIMAL` types.
    - **NO FLOATING POINT** for money calculations.

## 3. Coding Standards

- **Rust**: Structs must derive `Debug`, `Clone`. Use `atomics` and `RingBuffer`. No `unsafe` unless justified in `artifacts/`.
- **TypeScript**: Strict typing required. `any` is strictly prohibited.
- **Artifacts First**: Plans, schemas, and state must be documented in `artifacts/plan_*.md` before code is committed.
- **Self-Healing**: Agents must attempt to fix compilation/test errors for up to 5 iterations before halting.

## 4. Self-Healing System Recovery Protocol

### Automatic Recovery Workflow
1. On failure detection:
   - Capture full stack trace, memory state, and transaction context
   - Rollback uncommitted database operations immediately
   - Isolate failed component without terminating entire process
   - Initiate graceful degradation mode for affected endpoints
2. Recovery Steps:
   - Verify database schema integrity first
   - Rebuild in-memory state from persistent storage
   - Replay pending operations in exact chronological order
   - Validate all liability positions before accepting new orders
3. Failure Escalation:
   - After 3 failed recovery attempts: enable read-only mode
   - After 5 failed attempts: initiate controlled shutdown
   - Log all recovery steps to `artifacts/failure_*.md` with full audit trail

## 5. 0% House Edge Liability Constraints

### Non-Negotiable Mathematical Rules
1. **House Balance Guarantee**:
   - At all times: `sum(all_user_balances) == platform_liquidity_reserve`
   - No system account may hold positive or negative balance
   - Every bet must have exactly one counterparty
   - Sum of all potential payouts must always equal sum of all stakes
2. **Liability Execution Order**:
   - All matched orders execute at exact agreed price
   - No rounding, no fees, no hidden adjustments
   - Settlement must complete within 1ms of market resolution
   - Partial fills are not permitted for liability calculations
3. **Validation Checks**:
   - Run invariant verification on every transaction
   - Block all operations that would create net house position
   - Reject order books with unbalanced total stakes
   - Maintain cryptographic audit trail for every settlement

## 6. Operational Gating

1. **Phase 1**: Workspace grounding (Markdown artifacts).
2. **Phase 2**: Architectural blueprints (`plan_001.md`).
3. **Phase 3**: Core Scaffolding.
4. **Phase 4**: Recursive Implementation & Verification.
5. **Phase 5**: Automated Containerization & Deployment.
6. **Phase 6**: Production Launch Readiness:
   - Complete invariant stress test for 72 continuous hours
   - Verify 0% edge across 10 million simulated transactions
   - Validate self-healing triggers on all failure modes
   - Confirm rollback procedures work without data loss
   - Obtain sign-off from all agent personas before deployment

## 7. Production Agent Workflow Instructions

1. **Pre-Commit Validation**:
   - All changes must pass full liability invariant test suite
   - No code may be committed that breaks mathematical guarantees
   - Self-healing logic must be verified for every modified component
2. **Deployment Protocol**:
   - Deployments are only allowed during low volume windows
   - Maintain two active redundant instances during rollout
   - Verify invariants after each incremental deployment step
   - Instant rollback trigger available at all times
3. **Post-Launch Monitoring**:
   - Continuously validate 0% house edge every 100ms
   - Log every deviation from expected state immediately
   - Initiate self-healing before human notification
   - Never allow manual overrides of liability logic