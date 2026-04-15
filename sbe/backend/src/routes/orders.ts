import { FastifyInstance } from "fastify";
import { OrderOrchestrator } from "../services/orchestrator.js";
import { db } from "../db/index.js";
import { orders } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

const placeOrderSchema = z.object({
  userId: z.string().uuid(),
  matchId: z.string().uuid(),
  type: z.enum(["back", "lay"]),
  price: z.number().positive(), // odds (e.g. 2.50)
  stake: z.number().positive(), // in currency (e.g. 10.00)
});

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.post("/orders", async (request, reply) => {
    try {
      const data = placeOrderSchema.parse(request.body);

      // Convert to "cents" as required by the Orchestrator and logic
      const priceCents = Math.round(data.price * 100);
      const stakeCents = Math.round(data.stake * 100);

      const result = await OrderOrchestrator.placeOrder(
        data.userId,
        data.matchId,
        data.type,
        priceCents,
        stakeCents,
        fastify.ws
      );

      return reply.code(201).send(result);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(400).send({
        error: "Order Placement Failed",
        message: error.message,
      });
    }
  });

  fastify.get("/orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return reply.code(404).send({ error: "Order not found" });
    return order;
  });
}
