import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { announcements } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const announcementSchema = z.object({
  message: z.string(),
  active: z.number().default(1),
});

export default async function announcementRoutes(fastify: FastifyInstance) {
  // GET /announcements - List active announcements (public)
  fastify.get("/announcements", async () => {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.active, 1))
      .orderBy(desc(announcements.createdAt));
  });

  // Admin routes
  fastify.get("/admin/announcements", { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    if ((request.user as any).role !== "admin") return reply.code(403).send({ error: "Forbidden" });
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  });

  fastify.post("/admin/announcements", { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    if ((request.user as any).role !== "admin") return reply.code(403).send({ error: "Forbidden" });
    const { message, active } = announcementSchema.parse(request.body);
    const [newAnnouncement] = await db.insert(announcements).values({ message, active }).returning();
    return newAnnouncement;
  });

  fastify.delete("/admin/announcements/:id", { preHandler: [(fastify as any).authenticate] }, async (request, reply) => {
    if ((request.user as any).role !== "admin") return reply.code(403).send({ error: "Forbidden" });
    const { id } = request.params as { id: string };
    await db.delete(announcements).where(eq(announcements.id, id));
    return { success: true };
  });
}
