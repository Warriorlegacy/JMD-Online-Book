import { FastifyInstance } from "fastify";
import { db } from "../db/index.js";
import { tenants } from "../db/schema.js";
import { eq } from "drizzle-orm";

export default async function tenantRoutes(fastify: FastifyInstance) {
  fastify.get("/tenant/config", async (request, reply) => {
    // For demo purposes, we return the first active tenant or a default
    // In a real production setup, this would use the request hostname to identify the tenant
    try {
      const activeTenants = await db.select().from(tenants).where(eq(tenants.isActive, 1)).limit(1);
      
      if (activeTenants.length > 0) {
        const t = activeTenants[0];
        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          theme: {
            primaryColor: t.slug === "kinetic" ? "#0071e3" : "#10b981", // Demo theme variations
            backgroundColor: "#0a0e17"
          }
        };
      }

      return {
        id: "default",
        name: "Kinetic Ledger",
        slug: "kinetic",
        theme: {
          primaryColor: "#0071e3",
          backgroundColor: "#0a0e17"
        }
      };
    } catch (err: any) {
      fastify.log.error("Tenant config fetch error:", err);
      return reply.code(500).send({ error: "Failed to load tenant configuration" });
    }
  });
}
