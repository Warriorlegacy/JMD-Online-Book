import { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { matches } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.get("/ai/insights/:matchId", async (request, reply) => {
    const { matchId } = request.params as { matchId: string };

    try {
      const matchRecord = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
      
      if (matchRecord.length === 0) {
        return reply.code(404).send({ error: "Match not found" });
      }
      
      const m = matchRecord[0];
      const isLive = m.status === "in_play";

      // Simulated Advanced AI Betting Insights based on match state
      const insights = {
        matchId: m.id,
        confidenceScore: 84,
        predictions: [
          {
            market: "Match Winner",
            recommendation: m.teamA,
            probability: "62%",
            rationale: `Historical data indicates ${m.teamA} performs exceptionally well in ${m.sportType} home conditions, with a 78% win rate in their last 15 similar fixtures.`
          },
          {
            market: "Total Goals/Points",
            recommendation: "Over Average",
            probability: "55%",
            rationale: "Both teams have shown high-scoring tendencies recently, suggesting an open, attacking game structure."
          }
        ],
        liveAnalysis: isLive ? 
          `Current momentum strongly favors ${m.teamA}. Statistical models suggest a high probability of a score change in the next 10 minutes based on possession and territory metrics.` : 
          `Pre-match models are stable. No late injury news detected. Value is currently observed in backing ${m.teamB} with a handicap.`
      };

      return insights;
    } catch (err: any) {
      fastify.log.error("AI Insight generation error:", err);
      return reply.code(500).send({ error: "Failed to generate AI insights" });
    }
  });
}
