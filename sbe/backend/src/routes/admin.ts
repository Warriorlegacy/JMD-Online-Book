import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SettlementService } from "../services/settlement.js";
import { db } from "../db/index.js";
import { matches, marketHistory, tournaments, depositRequests, withdrawalRequests, wallets, ledgerEntries, users } from "../db/schema.js";
import { eq, asc, sql, desc, and } from "drizzle-orm";

export async function seedDemoData() {
  try {
    // Check if any matches exist
    const [existing] = await db.select().from(matches).limit(1);
    if (existing) return; // already seeded

    // Create tournament
    const [tournament] = await db.insert(tournaments).values({
      name: "Premier League 2026",
      sportType: "football",
      metadata: JSON.stringify({ country: "England", season: "2025-26" }),
    }).returning();

    // Create an in_play match
    await db.insert(matches).values({
      tournamentId: tournament.id,
      teamA: "Manchester City",
      teamB: "Arsenal",
      startTime: new Date(),
      status: "in_play",
      metadata: JSON.stringify({ venue: "Etihad Stadium", round: "Matchday 30" }),
    });

    console.log("✅ Demo data seeded");
  } catch (e: any) {
    // Tables may not exist yet — run raw SQL to create them
    console.warn("[Seed] Attempting raw SQL table creation:", e.message);
    try {
      await db.execute(sql`
        DO $$ BEGIN
          CREATE TYPE IF NOT EXISTS match_status AS ENUM('scheduled', 'in_play', 'completed', 'cancelled');
        EXCEPTION WHEN duplicate_object THEN null; END $$;
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS tournaments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          sport_type varchar(50) NOT NULL,
          metadata text,
          created_at timestamp DEFAULT now() NOT NULL
        );
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS matches (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tournament_id uuid NOT NULL REFERENCES tournaments(id),
          team_a text NOT NULL,
          team_b text NOT NULL,
          start_time timestamp NOT NULL,
          status match_status DEFAULT 'scheduled' NOT NULL,
          metadata text,
          created_at timestamp DEFAULT now() NOT NULL
        );
      `);
      // Retry seed
      const [t] = await db.insert(tournaments).values({
        name: "Premier League 2026",
        sportType: "football",
        metadata: JSON.stringify({ country: "England", season: "2025-26" }),
      }).returning();
      await db.insert(matches).values({
        tournamentId: t.id,
        teamA: "Manchester City",
        teamB: "Arsenal",
        startTime: new Date(),
        status: "in_play",
        metadata: JSON.stringify({ venue: "Etihad Stadium" }),
      });
      console.log("✅ Demo data seeded via raw SQL");
    } catch (e2: any) {
      console.error("[Seed] Raw SQL seed also failed:", e2.message);
    }
  }
}

export default async function adminRoutes(fastify: FastifyInstance) {
  // Admin only check
  const adminOnly = async (request: FastifyRequest, reply: FastifyReply) => {
    await (fastify as any).authenticate(request, reply);
    if ((request.user as any).role !== "admin") {
      return reply.code(403).send({ error: "Admin access required" });
    }
  };

  // Database connection test
  fastify.get("/db-test", async () => {
    try {
      const result = await db.execute(sql`SELECT NOW() as time`);
      return { 
        status: "connected", 
        database: "ok",
        timestamp: (result.rows?.[0] as any)?.time || "unknown",
        dbUrlPreview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 15)}...` : "missing"
      };
    } catch (error: any) {
      return { 
        status: "error", 
        message: error.message,
        code: error.code,
        stack: error.stack,
        hint: "Check DATABASE_URL in Render environment variables"
      };
    }
  });

  // Get current active match
  fastify.get("/matches/active", async (request, reply) => {
    try {
      // Use raw SQL to avoid Drizzle enum casting issues
      const result = await db.execute(
        sql`SELECT id, tournament_id, team_a, team_b, start_time, status, metadata, created_at 
            FROM matches 
            WHERE status = 'in_play'::match_status 
            LIMIT 1`
      );
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Fall back to next scheduled match
      const upcoming = await db.execute(
        sql`SELECT id, tournament_id, team_a, team_b, start_time, status, metadata, created_at 
            FROM matches 
            WHERE status = 'scheduled'::match_status 
            ORDER BY start_time ASC 
            LIMIT 1`
      );

      if (upcoming.rows.length === 0) {
        return reply.code(404).send({ error: "No matches found" });
      }
      return upcoming.rows[0];
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(503).send({ error: "Database unavailable", message: e.message });
    }
  });

  // Create a match
  fastify.post("/admin/matches", { preHandler: adminOnly }, async (request, reply) => {
    const { teamA, teamB, tournamentId, startTime } = request.body as any;
    const [match] = await db.insert(matches).values({ 
      teamA,
      teamB,
      tournamentId,
      startTime: new Date(startTime),
      status: 'scheduled'
    }).returning();
    return match;
  });

  // List all matches
  fastify.get("/matches", async () => {
    const result = await db.execute(
      sql`SELECT id, tournament_id, team_a, team_b, start_time, status, metadata, created_at 
          FROM matches ORDER BY start_time ASC LIMIT 50`
    );
    return result.rows;
  });

  // Get single match by ID (public)
  fastify.get("/matches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await db.execute(
        sql`SELECT m.id, m.tournament_id, t.name as tournament_name, m.team_a, m.team_b, m.start_time, m.status, m.metadata, m.created_at 
            FROM matches m
            LEFT JOIN tournaments t ON m.tournament_id = t.id
            WHERE m.id = ${id}`
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: "Match not found" });
      }
      return result.rows[0];
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: e.message });
    }
  });

  // Get match history (candlestick data)
  fastify.get("/matches/:id/history", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { selectionId } = request.query as { selectionId?: string };
    
    try {
      const history = await db
        .select()
        .from(marketHistory)
        .where(
          and(
            eq(marketHistory.matchId, id),
            eq(marketHistory.selectionId, selectionId || "team_a")
          )
        )
        .orderBy(asc(marketHistory.timestamp))
        .limit(500);
      return history.map(h => ({
        time: new Date(h.timestamp).getTime(),
        open: parseFloat(h.open),
        high: parseFloat(h.high),
        low: parseFloat(h.low),
        close: parseFloat(h.close),
        volume: parseFloat(h.volume),
      }));
    } catch (e: any) {
      return reply.code(500).send({ error: e.message });
    }
  });

  // Settle a match
  fastify.post("/admin/matches/:id/settle", { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { result } = request.body as { result: "team_a" | "team_b" | "draw" };

    try {
      const status = await SettlementService.settleMatch(id, result);
      return status;
    } catch (e: any) {
      reply.status(500).send({ error: e.message });
    }
  });

  // Update match status (admin)
  fastify.patch("/admin/matches/:id", { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: "scheduled" | "in_play" | "completed" | "cancelled" };
    if (!["scheduled", "in_play", "completed", "cancelled"].includes(status)) {
      return reply.code(400).send({ error: "Invalid status" });
    }
    await db.update(matches).set({ status }).where(eq(matches.id, id));
    return { success: true };
  });

  // --- NEW ADMIN WALLET ROUTES ---

  // List pending deposits
  fastify.get("/admin/deposits", { preHandler: adminOnly }, async () => {
    return await db
      .select({
        id: depositRequests.id,
        userId: depositRequests.userId,
        username: users.username,
        amount: depositRequests.amount,
        upiId: depositRequests.upiId,
        utrNumber: depositRequests.utrNumber,
        status: depositRequests.status,
        createdAt: depositRequests.createdAt,
      })
      .from(depositRequests)
      .leftJoin(users, eq(users.id, depositRequests.userId))
      .where(eq(depositRequests.status, "pending"))
      .orderBy(desc(depositRequests.createdAt));
  });

  // Approve deposit
  fastify.post("/admin/deposits/:id/approve", { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const [deposit] = await db
        .select()
        .from(depositRequests)
        .where(eq(depositRequests.id, id))
        .limit(1);

      if (!deposit || deposit.status !== "pending") {
        return reply.code(400).send({ error: "Invalid deposit request" });
      }

      await db.transaction(async (tx) => {
        // Update deposit status
        await tx
          .update(depositRequests)
          .set({ status: "approved" })
          .where(eq(depositRequests.id, id));

        // Get or create wallet
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.userId, deposit.userId))
          .limit(1);

        const newBalance = (parseFloat(wallet?.balance || "0") + parseFloat(deposit.amount)).toFixed(8);

        if (!wallet) {
          await tx.insert(wallets).values({
            userId: deposit.userId,
            balance: newBalance,
            currency: "INR"
          });
        } else {
          await tx
            .update(wallets)
            .set({ balance: newBalance, updatedAt: new Date() })
            .where(eq(wallets.id, wallet.id));
        }

        // Ledger entry
        const targetWallet = wallet || (await tx.select().from(wallets).where(eq(wallets.userId, deposit.userId)).limit(1))[0];
        await tx.insert(ledgerEntries).values({
          walletId: targetWallet.id,
          amount: deposit.amount,
          currency: "INR",
          type: "deposit",
          referenceId: deposit.id
        });
      });

      return { message: "Deposit approved and wallet credited" };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: "Failed to approve deposit" });
    }
  });

  // Reject deposit
  fastify.post("/admin/deposits/:id/reject", { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await db
      .update(depositRequests)
      .set({ status: "rejected" })
      .where(eq(depositRequests.id, id));
    return { message: "Deposit rejected" };
  });

  // List pending withdrawals
  fastify.get("/admin/withdrawals", { preHandler: adminOnly }, async () => {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.status, "pending"))
      .orderBy(desc(withdrawalRequests.createdAt));
  });

  // Approve withdrawal
  fastify.post("/admin/withdrawals/:id/approve", { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const [withdrawal] = await db
        .select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.id, id))
        .limit(1);

      if (!withdrawal || withdrawal.status !== "pending") {
        return reply.code(400).send({ error: "Invalid withdrawal request" });
      }

      await db.transaction(async (tx) => {
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.userId, withdrawal.userId))
          .limit(1);

        if (!wallet || parseFloat(wallet.balance) < parseFloat(withdrawal.amount)) {
          throw new Error("Insufficient balance during approval");
        }

        const newBalance = (parseFloat(wallet.balance) - parseFloat(withdrawal.amount)).toFixed(8);

        await tx
          .update(wallets)
          .set({ balance: newBalance, updatedAt: new Date() })
          .where(eq(wallets.id, wallet.id));

        await tx
          .update(withdrawalRequests)
          .set({ status: "completed" })
          .where(eq(withdrawalRequests.id, id));

        await tx.insert(ledgerEntries).values({
          walletId: wallet.id,
          amount: (-parseFloat(withdrawal.amount)).toString(),
          currency: "INR",
          type: "withdrawal",
          referenceId: withdrawal.id
        });
      });

      return { message: "Withdrawal approved and completed" };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: e.message || "Failed to approve withdrawal" });
    }
  });

  // List all tournaments (admin)
  fastify.get("/admin/tournaments", { preHandler: adminOnly }, async () => {
    return await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
  });

  // List all users (admin)
  fastify.get("/admin/users", { preHandler: adminOnly }, async () => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        balance: wallets.balance,
      })
      .from(users)
      .leftJoin(wallets, eq(users.id, wallets.userId))
      .orderBy(desc(users.createdAt));
  });
}
