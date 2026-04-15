import { FastifyInstance } from "fastify";
import { SettlementService } from "../services/settlement.js";
import { db } from "../db/index.js";
import { matches, marketHistory } from "../db/schema.js";
import { eq, asc, sql } from "drizzle-orm";

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
  fastify.get("/matches/active", async () => {
    const [activeMatch] = await db
      .select()
      .from(matches)
      .where(eq(matches.status, "in_play"))
      .limit(1);
    
    // If no active, get the next upcoming one
    if (!activeMatch) {
      const [upcomingMatch] = await db
        .select()
        .from(matches)
        .where(eq(matches.status, "scheduled"))
        .orderBy(asc(matches.startTime))
        .limit(1);
      
      return upcomingMatch || { error: "No matches found" };
    }

    return activeMatch;
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
