import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SettlementService } from "../services/settlement.js";
import { db } from "../db/index.js";
import { matches, marketHistory, tournaments, depositRequests, withdrawalRequests, wallets, ledgerEntries, users, kycReviews, orders } from "../db/schema.js";
import { eq, asc, sql, desc, and } from "drizzle-orm";
import { supabase } from "../services/supabase.js";

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
      if (process.env.NODE_ENV !== 'production') console.log("✅ Demo data seeded");
    } catch (e: any) {
      // Tables may not exist yet — run raw SQL to create them
      if (process.env.NODE_ENV !== 'production') console.warn("[Seed] Attempting raw SQL table creation:", e.message);
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
       if (process.env.NODE_ENV !== 'production') console.log("✅ Demo data seeded via raw SQL");
     } catch (e2: any) {
       if (process.env.NODE_ENV !== 'production') console.error("[Seed] Raw SQL seed also failed:", e2.message);
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
   fastify.get("/db-test", { preHandler: adminOnly }, async () => {
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

        if (!wallet || parseFloat(wallet.lockedBalance) < parseFloat(withdrawal.amount)) {
          throw new Error("Insufficient locked balance during approval");
        }

        const newLockedBalance = (parseFloat(wallet.lockedBalance) - parseFloat(withdrawal.amount)).toFixed(8);

        await tx
          .update(wallets)
          .set({ lockedBalance: newLockedBalance, updatedAt: new Date() })
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

      return { message: "Withdrawal approved and funds released from lock" };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: e.message || "Failed to approve withdrawal" });
    }
  });

  // Reject withdrawal
  fastify.post("/admin/withdrawals/:id/reject", { preHandler: adminOnly }, async (request, reply) => {
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

        if (!wallet) throw new Error("Wallet not found");

        // Release locked funds back to balance
        const newBalance = (parseFloat(wallet.balance) + parseFloat(withdrawal.amount)).toFixed(8);
        const newLockedBalance = (parseFloat(wallet.lockedBalance) - parseFloat(withdrawal.amount)).toFixed(8);

        await tx
          .update(wallets)
          .set({ 
            balance: newBalance, 
            lockedBalance: newLockedBalance, 
            updatedAt: new Date() 
          })
          .where(eq(wallets.id, wallet.id));

        await tx
          .update(withdrawalRequests)
          .set({ status: "rejected" })
          .where(eq(withdrawalRequests.id, id));

        await tx.insert(ledgerEntries).values({
          walletId: wallet.id,
          amount: withdrawal.amount,
          currency: "INR",
          type: "withdrawal_rejected_release",
          referenceId: withdrawal.id
        });
      });

      return { message: "Withdrawal rejected and funds released" };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: e.message || "Failed to reject withdrawal" });
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

  // --- KYC ADMIN ROUTES ---

  // GET /admin/kyc/queue
  fastify.get("/admin/kyc/queue", { preHandler: adminOnly }, async () => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        status: users.kycStatus,
        documents: users.kycDocuments,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.kycStatus, "pending"))
      .orderBy(asc(users.createdAt));
  });

  // POST /admin/kyc/review
  fastify.post("/admin/kyc/review", { preHandler: adminOnly }, async (request, reply) => {
    const { userId, decision, notes } = request.body as { userId: string, decision: "verified" | "rejected", notes: string };
    const admin = request.user as any;

    if (!["verified", "rejected"].includes(decision)) {
      return reply.code(400).send({ error: "Invalid decision" });
    }

    try {
      await db.transaction(async (tx) => {
        // Update user status
        await tx
          .update(users)
          .set({ kycStatus: decision })
          .where(eq(users.id, userId));

        // Create review record
        await tx.insert(kycReviews).values({
          userId,
          reviewerId: admin.id,
          decision,
          notes,
        });
      });

      return { message: `KYC request for user ${userId} has been ${decision}` };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: "Failed to review KYC request" });
    }
  });

  // GET /admin/kyc/document/:path
  fastify.get("/admin/kyc/document/:path*", { preHandler: adminOnly }, async (request, reply) => {
    try {
      const { path } = request.params as any;
      const fullPath = path.join("/");
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(fullPath, 3600); // 1 hour

      if (error) throw error;
      
      return { url: data.signedUrl };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: "Failed to generate signed URL" });
    }
  });

  // --- GLOBAL LIABILITY VIEW ---
  fastify.get("/admin/liability", { preHandler: adminOnly }, async (request, reply) => {
    try {
      // Total global exposure
      const totalExposureResult = await db.execute(sql`
        SELECT 
          COALESCE(SUM(CAST(stake AS NUMERIC) * (CAST(price AS NUMERIC) - 1)), 0) as total_exposure,
          COUNT(DISTINCT "user_id") as active_users,
          COUNT(*) as open_orders
        FROM orders 
        WHERE status IN ('open', 'partially_filled')
      `);

      // Liability by sport
      const bySportResult = await db.execute(sql`
        SELECT 
          t.sport_type,
          COALESCE(SUM(CAST(o.stake AS NUMERIC) * (CAST(o.price AS NUMERIC) - 1)), 0) as exposure,
          COUNT(o.id) as order_count
        FROM orders o
        JOIN matches m ON o.match_id = m.id
        JOIN tournaments t ON m.tournament_id = t.id
        WHERE o.status IN ('open', 'partially_filled')
        GROUP BY t.sport_type
        ORDER BY exposure DESC
      `);

      // Liability by user (top 20)
      const byUserResult = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          COALESCE(SUM(CAST(o.stake AS NUMERIC) * (CAST(o.price AS NUMERIC) - 1)), 0) as user_exposure,
          COUNT(o.id) as user_orders
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status IN ('open', 'partially_filled')
        GROUP BY u.id, u.username
        ORDER BY user_exposure DESC
        LIMIT 20
      `);

      return {
        total: {
          exposure: parseFloat(totalExposureResult.rows[0].total_exposure as string),
          activeUsers: parseInt(totalExposureResult.rows[0].active_users as string),
          openOrders: parseInt(totalExposureResult.rows[0].open_orders as string)
        },
        bySport: bySportResult.rows.map((row: any) => ({
          sportType: row.sport_type,
          exposure: parseFloat(row.exposure as string),
          orderCount: parseInt(row.order_count as string)
        })),
        byUser: byUserResult.rows.map((row: any) => ({
          id: row.id,
          username: row.username,
          exposure: parseFloat(row.user_exposure as string),
          orderCount: parseInt(row.user_orders as string)
        }))
      };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: "Failed to calculate liability view" });
    }
  });

  // --- MARKET LIQUIDITY INJECTION ---
  fastify.post("/admin/market/inject", { preHandler: adminOnly }, async (request, reply) => {
    const { 
      matchId, 
      selectionId, 
      type, 
      price, 
      stake 
    } = request.body as { 
      matchId: string, 
      selectionId: string, 
      type: "back" | "lay", 
      price: number, 
      stake: number 
    };

    // Validation
    if (!matchId || !selectionId || !type || !price || !stake) {
      return reply.code(400).send({ error: "All fields are required" });
    }

    if (!["back", "lay"].includes(type)) {
      return reply.code(400).send({ error: "Type must be either 'back' or 'lay'" });
    }

    if (price <= 1 || price > 1000) {
      return reply.code(400).send({ error: "Price must be between 1.01 and 1000" });
    }

    if (stake <= 0 || stake > 1000000) {
      return reply.code(400).send({ error: "Stake must be positive and less than 1,000,000" });
    }

    try {
      // Verify match exists and is active
      const matchResult = await db.execute(sql`
        SELECT id, status FROM matches WHERE id = ${matchId} AND status IN ('scheduled', 'in_play') LIMIT 1
      `);

      if (matchResult.rows.length === 0) {
        return reply.code(404).send({ error: "Active match not found" });
      }

      const order = await db.transaction(async (tx) => {
        // Create injected order with null user_id (system liquidity)
        const [injectedOrder] = await tx.insert(orders).values({
          matchID: matchId,
          selectionId,
          type,
          price: price.toFixed(4),
          stake: stake.toFixed(8),
          filledStake: "0",
          status: "open",
          userId: (request.user as any).id // Admin user executing injection
        }).returning();

        await tx.insert(marketHistory).values({
          matchId: matchId,
          selectionId,
          interval: "1m",
          open: price.toString(),
          high: price.toString(),
          low: price.toString(),
          close: price.toString(),
          volume: stake.toString(),
          timestamp: new Date()
        });

        return injectedOrder;
      });

      return {
        success: true,
        message: `Successfully injected ${stake} liquidity at price ${price}`,
        orderId: order.id
      };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: "Failed to inject market liquidity" });
    }
  });

  // --- KYC FINALIZATION ENDPOINTS ---
  
  // GET KYC history for user
  fastify.get("/admin/kyc/history/:userId", { preHandler: adminOnly }, async (request, reply) => {
    const { userId } = request.params as { userId: string };

    try {
      const reviews = await db
        .select({
          id: kycReviews.id,
          reviewerId: kycReviews.reviewerId,
          reviewerName: users.username,
          decision: kycReviews.decision,
          notes: kycReviews.notes,
          createdAt: kycReviews.createdAt
        })
        .from(kycReviews)
        .leftJoin(users, eq(users.id, kycReviews.reviewerId))
        .where(eq(kycReviews.userId, userId))
        .orderBy(desc(kycReviews.createdAt));

      return reviews;
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(500).send({ error: "Failed to fetch KYC history" });
    }
  });

  // Bulk KYC queue stats
  fastify.get("/admin/kyc/stats", { preHandler: adminOnly }, async () => {
    const statsResult = await db.execute(sql`
      SELECT 
        kyc_status,
        COUNT(*) as count
      FROM users
      GROUP BY kyc_status
    `);

    return statsResult.rows.reduce((acc: any, row: any) => {
      acc[row.kyc_status] = parseInt(row.count);
      return acc;
    }, {});
  });

  // --- ADMIN REFERRAL ROUTES ---
  fastify.get("/admin/referrals", { preHandler: adminOnly }, async () => {
    try {
      const topReferrers = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          u.referral_code,
          COUNT(r.id) as referred_count,
          COALESCE(SUM(CAST(re.amount AS NUMERIC)), 0) as total_earned
        FROM users u
        LEFT JOIN users r ON u.referral_code = r.referred_by_code
        LEFT JOIN referrals ref ON u.id = ref.referrer_id
        LEFT JOIN referral_earnings re ON ref.id = re.referral_id
        GROUP BY u.id, u.username, u.referral_code
        HAVING COUNT(r.id) > 0
        ORDER BY referred_count DESC
        LIMIT 50
      `);

      const globalStats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_referrals,
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_commissions
        FROM referral_earnings
      `);

      return {
        referrers: topReferrers.rows,
        stats: globalStats.rows[0]
      };
    } catch (e: any) {
      fastify.log.error(e);
      throw new Error("Failed to fetch referral data");
    }
  });
}
