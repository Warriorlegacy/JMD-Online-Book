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
    const result = await db.execute(
      sql`SELECT id, tournament_id, team_a, team_b, start_time, status, metadata, created_at 
          FROM matches ORDER BY start_time ASC LIMIT 50`
    );
    return result.rows;
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
