import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { wallets, depositRequests, withdrawalRequests, ledgerEntries } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { WalletService } from "../services/wallet.js";
import { paymentService } from "../services/payments/PaymentService.js";

const depositInitSchema = z.object({
  amount: z.string().transform(val => parseFloat(val)),
  provider: z.string().default("simulation"),
});

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
  fastify.addHook("preValidation", async (request, reply) => {
    if (request.url.includes("/deposit/webhook")) return;
    await fastify.authenticate(request, reply);
  });

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

  // POST /wallet/deposit/init
  fastify.post("/wallet/deposit/init", async (request, reply) => {
    try {
      const { amount, provider } = depositInitSchema.parse(request.body);
      const userId = (request.user as any).id;

      const payProvider = paymentService.getProvider(provider);
      const session = await payProvider.createSession(amount, userId, "INR");

      await db.insert(depositRequests).values({
        userId,
        amount: amount.toString(),
        upiId: "", // not needed for gateways
        utrNumber: session.reference,
        paymentGateway: payProvider.name,
        paymentReference: session.reference,
        status: "pending"
      });

      return {
        url: session.url,
        confirmation: session.confirmation,
        reference: session.reference
      };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Failed to initialize deposit" });
    }
  });

  // POST /wallet/deposit/webhook
  fastify.post("/wallet/deposit/webhook", async (request, reply) => {
    try {
      const signature = request.headers["stripe-signature"] as string;
      const payload = request.body as any;

      // Find the request to determine provider
      const reference = payload.reference || payload.id;
      const [depReq] = await db
        .select()
        .from(depositRequests)
        .where(eq(depositRequests.paymentReference, reference))
        .limit(1);

      if (!depReq) {
        return reply.code(404).send({ error: "Deposit request not found" });
      }

      const provider = paymentService.getProvider(depReq.paymentGateway || "simulation");
      const verification = await provider.verifyWebhook(payload, signature);

      if (verification.status === "completed") {
        await db.transaction(async (tx) => {
          await tx.update(depositRequests)
            .set({ status: "completed" })
            .where(eq(depositRequests.id, depReq.id));

          await WalletService.credit(depReq.userId, depReq.amount, depReq.id);
        });

        fastify.ws.sendToUser(depReq.userId, {
          type: "wallet_update",
          message: "Your deposit has been credited successfully!"
        });
      }

      return { status: "ok" };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(400).send({ error: "Webhook verification failed" });
    }
  });

  // POST /wallet/deposit (legacy manual UPI)
  fastify.post("/wallet/deposit", async (request, reply) => {
    try {
      const { amount, upiId, utrNumber } = depositSchema.parse(request.body);
      const userId = (request.user as any).id;

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

      await db.transaction(async (tx) => {
        // Lock funds immediately
        await WalletService.lockFunds(userId, amount.toString(), "withdrawal_req", "withdrawal");

        await tx.insert(withdrawalRequests).values({
          userId,
          amount: amount.toString(),
          upiId,
          status: "pending"
        });
      });

      return { message: "Withdrawal request submitted and funds locked. Waiting for approval." };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: err.message || "Failed to submit withdrawal request" });
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
