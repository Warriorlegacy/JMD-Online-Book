import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "../db/index.js";
import { users, referrals, referralEarnings } from "../db/schema.js";
import { eq, sql, count } from "drizzle-orm";

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    role: string;
    username: string;
  };
}

export default async function referralRoutes(fastify: FastifyInstance) {
  // GET /referral/stats
  fastify.get("/referral/stats", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = request.user as AuthenticatedRequest['user'];

      // Get count of users referred by this user
      const [refereeCount] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.referredByCode, sql`(SELECT referral_code FROM users WHERE id = ${user.id})`));

      // Get total earnings from referrals
      const [totalEarnings] = await db
        .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
        .from(referralEarnings)
        .where(eq(referralEarnings.referralId, sql`(SELECT id FROM referrals WHERE referrer_id = ${user.id} LIMIT 1)`));

      // Get user's own referral code
      const [dbUser] = await db
        .select({ code: users.referralCode })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      return {
        referralCode: dbUser?.code || "",
        totalReferees: Number(refereeCount?.count || 0),
        totalEarnings: totalEarnings?.total || "0.00000000",
        referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${dbUser?.code || ""}`
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // GET /referral/list
  fastify.get("/referral/list", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = request.user as AuthenticatedRequest['user'];
      
      const refereeList = await db
        .select({
          id: users.id,
          username: users.username,
          createdAt: users.createdAt,
          status: users.referralStatus
        })
        .from(users)
        .where(eq(users.referredByCode, sql`(SELECT referral_code FROM users WHERE id = ${user.id})`));

      return refereeList;
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
}
