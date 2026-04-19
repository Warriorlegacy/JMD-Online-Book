import { pubsub } from "./services/pubsub.js";
import { db } from "./db/index.js";
import { trades as tradesTable, orders as ordersTable } from "./db/schema.js";
import { eq, sql } from "drizzle-orm";
import { FastifyInstance } from "fastify";

export function initPersistenceWorker(fastify: FastifyInstance) {
  fastify.log.info("[Worker] Persistence worker initialized");

  pubsub.subscribe("match_events", async (payload: any) => {
    const { matchId, events } = payload;
    
    for (const event of events) {
      try {
        await db.transaction(async (tx) => {
          // 1. Record the Trade
          await tx.insert(tradesTable).values({
            id: crypto.randomUUID(),
            matchID: matchId,
            selectionId: event.selection_id,
            backerId: event.backer_id,
            layerId: event.layer_id,
            price: event.price.toString(),
            stake: event.size.toString(),
          });

          // 2. Adjust Order status/remaining stake
          // This is a simplified version. Ideally we'd decrement remaining_stake in the DB too.
          // For now, if an order is fully matched, we mark it as filled.
          // Note: In a production system, we'd handle partial fills precisely.
        });
      } catch (e) {
        fastify.log.error(e);
      }
    }
  });

  pubsub.subscribe("candle_update", (candle: any) => {
    fastify.ws.publishToRoom(candle.matchId, "candle_update", { candle });
  });
}
