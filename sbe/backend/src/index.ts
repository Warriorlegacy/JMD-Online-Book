import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { type FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db/index.js";
import wsManagerPlugin from "./plugins/ws.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes, { seedDemoData } from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import walletRoutes from "./routes/wallet.js";
import announcementRoutes from "./routes/announcements.js";
import { initPersistenceWorker } from "./worker.js";
import { CandleService } from "./services/candles.js";
import { OrderEngineBridge } from "./services/engine.js";
import { globalErrorHandler } from "./middleware/error-handler.js";

// Extend FastifyInstance with authenticate decorator
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const fastify: FastifyInstance = Fastify({
  logger: true,
});

// Fail fast if JWT_SECRET is not set in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ JWT_SECRET environment variable is required in production");
    process.exit(1);
  }
  // In development, we'll use the secret but warn
  console.warn("⚠️  JWT_SECRET not set - using development secret (DO NOT USE IN PRODUCTION)");
}

async function start() {
  try {
    // Run migrations on startup — non-fatal if already applied
    try {
      await migrate(db, { migrationsFolder: "./drizzle" });
      fastify.log.info("✅ Database migrations applied");
    } catch (migrationErr: any) {
      fastify.log.warn("⚠️ Migration warning (may already be applied):", migrationErr.message);
    }

    // Seed demo data if DB is empty
    await seedDemoData();

    // 1. Register Plugins
    await fastify.register(cors, {
      origin: true, // Allow all origins in dev, or specific URLs in prod
      credentials: true,
    });

    await fastify.register(fastifyCookie);
    await fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET!,
      cookie: {
        cookieName: "sbe_token",
        signed: false,
      },
    });

    await fastify.register(websocket);
    await fastify.register(wsManagerPlugin);

    // Set Global Error Handler
    fastify.setErrorHandler(globalErrorHandler);

    // Authenticate decorator
    fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    });

    // 2. Register Routes
    await fastify.register(authRoutes);
    await fastify.register(orderRoutes);
    await fastify.register(adminRoutes);
    await fastify.register(walletRoutes);
    await fastify.register(announcementRoutes);

    // 3. Health Check
    fastify.get("/health", async () => {
      return { status: "ok", version: "1.0.0" };
    });

    // 3. Start Workers
    initPersistenceWorker(fastify);
    CandleService.init();
    OrderEngineBridge.getInstance(); // Initialize matching engine

    // 4. Start Listening
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: "0.0.0.0" });

    fastify.log.info(`🚀 SBE Backend running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

