import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { type FastifyInstance } from "fastify";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db/index.js";
import wsManagerPlugin from "./plugins/ws.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import { initPersistenceWorker } from "./worker.js";
import { CandleService } from "./services/candles.js";

const fastify: FastifyInstance = Fastify({
  logger: true,
});

async function start() {
  try {
    // Run migrations on startup
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Database migrations applied");

    // 1. Register Plugins
    await fastify.register(cors, {
      origin: (process.env.ALLOWED_ORIGINS || "https://jmd-online-book.vercel.app").split(","),
    });
    
    await fastify.register(websocket);
    await fastify.register(wsManagerPlugin);

    // 2. Register Routes
    await fastify.register(orderRoutes);
    await fastify.register(adminRoutes);

    // 3. Health Check
    fastify.get("/health", async () => {
      return { status: "ok", version: "1.0.0" };
    });

    // 3. Start Workers
    initPersistenceWorker();
    CandleService.init();

    // 4. Start Listening
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: "0.0.0.0" });
    
    console.log(`🚀 SBE Backend running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
