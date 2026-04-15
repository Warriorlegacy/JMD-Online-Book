import { FastifyInstance } from "fastify";
import { SettlementService } from "../services/settlement.js";
import { db } from "../db/index.js";
import { matches, marketHistory, tournaments } from "../db/schema.js";
import { eq, asc, sql } from "drizzle-orm";

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
  } catch (e) {
    console.error("[Seed] Failed:", e);
  }
}

export default async function adminRoutes(fastify: FastifyInstance) {
  // Database connection test
  fastify.get("/db-test", async () => {
    try {
      const result = await db.execute(sql`SELECT NOW() as time`);
      return { 
        status: "connected", 
        database: "ok",
        timestamp: (result.rows?.[0] as any)?.time || "unknown"
      };
    } catch (error: any) {
      return { 
        status: "error", 
        message: error.message,
        code: error.code,
        hint: "Check DATABASE_URL in Render environment variables"
      };
    }
  });

  // Get current active match
  fastify.get("/matches/active", async (request, reply) => {
    try {
      const [activeMatch] = await db
        .select()
        .from(matches)
        .where(eq(matches.status, "in_play"))
        .limit(1);
      
      if (!activeMatch) {
        const [upcomingMatch] = await db
          .select()
          .from(matches)
          .where(eq(matches.status, "scheduled"))
          .orderBy(asc(matches.startTime))
          .limit(1);
        
        if (!upcomingMatch) {
          return reply.code(404).send({ error: "No matches found" });
        }
        return upcomingMatch;
      }

      return activeMatch;
    } catch (e: any) {
      fastify.log.error(e);
      return reply.code(503).send({ error: "Database unavailable", message: e.message });
    }
  });

  // Create a match
  fastify.post("/admin/matches", async (request, reply) => {
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
    return db.select().from(matches).orderBy(asc(matches.startTime)).limit(50);
  });

  // Get match history (candlestick data)
  fastify.get("/matches/:id/history", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const history = await db
        .select()
        .from(marketHistory)
        .where(eq(marketHistory.matchId, id))
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
  fastify.post("/admin/matches/:id/settle", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { result } = request.body as { result: "team_a" | "team_b" | "draw" };

    try {
      const status = await SettlementService.settleMatch(id, result);
      return status;
    } catch (e: any) {
      reply.status(500).send({ error: e.message });
    }
  });
}
