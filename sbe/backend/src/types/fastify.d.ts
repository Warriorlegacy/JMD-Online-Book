import { DrizzlePool } from "../db";

declare module "fastify" {
  interface FastifyInstance {
    db: DrizzlePool;
  }
}
