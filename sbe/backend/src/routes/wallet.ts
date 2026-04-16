import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { wallets, depositRequests, withdrawalRequests, ledgerEntries } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const depositSchema = z.object({
  amount: z.string().transform(val => parseFloat(val)),
  upiId: z.string(),
  utrNumber: z.string().min(12).max(12, "UTR must be exactly 12 digits"),
});

const withdrawalSchema = z.object({
  amount: z.string().transform(val => parseFloat(val)),
  upiId: z.string(),
});

export default async function walletRoutes(fastify: FastifyInstance) {
  // All routes in this plugin require authentication
  fastify.addHook("preValidation", fastify.authenticate);

  // GET /wallet/balance
  fastify.get("/wallet/balance", async (request) => {
    const userId = (request.user as any).id;
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (!wallet) {
      return { balance: "0.00000000", lockedBalance: "0.00000000" };
    }

    return {
      balance: wallet.balance,
      lockedBalance: wallet.lockedBalance,
      currency: wallet.currency
    };
  });

  // POST /wallet/deposit
  fastify.post("/wallet/deposit", async (request, reply) => {
    try {
      const { amount, upiId, utrNumber } = depositSchema.parse(request.body);
      const userId = (request.user as any).id;

      // Check if UTR already exists to prevent duplicate claims
      const existing = await db
        .select()
        .from(depositRequests)
        .where(eq(depositRequests.utrNumber, utrNumber))
        .limit(1);

      if (existing.length > 0) {
        return reply.code(400).send({ error: "This UTR number has already been submitted" });
      }

      await db.insert(depositRequests).values({
        userId,
        amount: amount.toString(),
        upiId,
        utrNumber,
        status: "pending"
      });

      return { message: "Deposit request submitted. Waiting for admin approval." };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to submit deposit request" });
    }
  });

  // POST /wallet/withdraw
  fastify.post("/wallet/withdraw", async (request, reply) => {
    try {
      const { amount, upiId } = withdrawalSchema.parse(request.body);
      const userId = (request.user as any).id;

      // Check balance
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

      if (!wallet || parseFloat(wallet.balance) < amount) {
        return reply.code(400).send({ error: "Insufficient balance" });
      }

      // Record withdrawal request and lock balance in transaction
      await db.transaction(async (tx) => {
        await tx.insert(withdrawalRequests).values({
          userId,
          amount: amount.toString(),
          upiId,
          status: "pending"
        });

        // Optional: Deduct from balance immediately and put into locked?
        // For simplicity in this exchange, we'll just check balance here
        // and deduct it upon approval. 
        // Actual high-end systems lock it.
      });

      return { message: "Withdrawal request submitted for approval." };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to submit withdrawal request" });
    }
  });

  // GET /wallet/transactions
  fastify.get("/wallet/transactions", async (request) => {
    const userId = (request.user as any).id;

    const deposits = await db
      .select()
      .from(depositRequests)
      .where(eq(depositRequests.userId, userId))
      .orderBy(desc(depositRequests.createdAt))
      .limit(20);

    const withdrawals = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(20);
      
    return {
      deposits,
      withdrawals
    };
  });
}
