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

## 4. Operational Gating

1. **Phase 1**: Workspace grounding (Markdown artifacts).
2. **Phase 2**: Architectural blueprints (`plan_001.md`).
3. **Phase 3**: Core Scaffolding.
4. **Phase 4**: Recursive Implementation & Verification.
5. **Phase 5**: Automated Containerization & Deployment.
