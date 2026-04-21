import { FastifyInstance } from "fastify";
import { z } from "zod";
import { AccumulatorService, AccumulatorSelection } from "../services/accumulator.js";
import { CashOutService } from "../services/cashout.js";
import { db } from "../db/index.js";
import { bets, betSelections } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const placeAccumulatorSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  stake: z.number().positive(),
  selections: z.array(z.object({
    matchId: z.string().uuid(),
    marketId: z.string().uuid(),
    selectionId: z.string(),
    odds: z.number().positive(),
  })),
});

export default async function betRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", async (request, reply) => {
    await fastify.authenticate(request, reply);
  });

  fastify.post("/bets/accumulator", async (request, reply) => {
    try {
      const data = placeAccumulatorSchema.parse(request.body);
      const bet = await AccumulatorService.placeAccumulatorBet(
        data.userId,
        data.tenantId,
        data.stake,
        data.selections
      );
      return reply.code(201).send(bet);
    } catch (error: any) {
      return reply.code(400).send({ error: "Accumulator Placement Failed", message: error.message });
    }
  });

  fastify.get("/bets/active/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const activeBets = await db.select().from(bets).where(and(eq(bets.userId, userId), eq(bets.status, "open")));
      
      const betsWithSelections = await Promise.all(activeBets.map(async (bet) => {
        const selections = await db.select().from(betSelections).where(eq(betSelections.betId, bet.id));
        return { ...bet, selections };
      }));

      return betsWithSelections;
    } catch (error: any) {
      return reply.code(500).send({ error: "Failed to fetch active bets", message: error.message });
    }
  });

  fastify.get("/bets/cashout-value/:betId", async (request, reply) => {
    try {
      const { betId } = request.params as { betId: string };
      const value = await CashOutService.calculateCashOutValue(betId);
      return { cashOutValue: value.toFixed(2) };
    } catch (error: any) {
      return reply.code(400).send({ error: "Failed to calculate cash out value", message: error.message });
    }
  });

  fastify.post("/bets/cashout/:betId", async (request, reply) => {
    try {
      const { betId } = request.params as { betId: string };
      const { userId } = request.body as { userId: string };
      
      if (!userId) return reply.code(400).send({ error: "userId is required" });

      const result = await CashOutService.executeCashOut(betId, userId);
      return reply.send(result);
    } catch (error: any) {
      return reply.code(400).send({ error: "Cash out failed", message: error.message });
    }
  });
}
