import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { supabase } from "../services/supabase.js";
import { kycService } from "../services/kyc-service.js";

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    role: string;
    username: string;
    email?: string;
  };
}

const kycDetailsSchema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date of birth format (YYYY-MM-DD)"),
  address: z.string().min(10, "Address is too short"),
});

export default async function kycRoutes(fastify: FastifyInstance) {
  // POST /kyc/details
  fastify.post("/kyc/details", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = request.user as AuthenticatedRequest['user'];
      const { dob, address } = kycDetailsSchema.parse(request.body);
      
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      const currentDocs = dbUser?.kycDocuments || {};
      
      await db
        .update(users)
        .set({
          kycDocuments: { ...currentDocs, dob, address }
        })
        .where(eq(users.id, user.id));
        
      return { message: "Personal details updated successfully" };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

    // POST /kyc/documents
    fastify.post("/kyc/documents", { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const user = request.user as AuthenticatedRequest['user'];
            
            const body = request.body as Record<string, any>;
            const docUrls = body.documents || {};
            
            if (!docUrls.front || !docUrls.back) {
                return reply.code(400).send({ error: "Both front and back document images are required" });
            }
            
            const [dbUser] = await db
                .select()
                .from(users)
                .where(eq(users.id, user.id))
                .limit(1);

            if (!dbUser) return reply.code(404).send({ error: "User not found" });

            const personalDetails = (dbUser.kycDocuments || {}) as Record<string, any>;
            if (!personalDetails.dob || !personalDetails.address) {
                return reply.code(400).send({ error: "Please update your personal details (DOB, address) first" });
            }

            // trigger identity verification via DIDIT
            const verification = await kycService.verifyIdentity({
                front: docUrls.front,
                back: docUrls.back,
                dob: personalDetails.dob,
                address: personalDetails.address
            });

            const kycStatus = verification.verified ? 'verified' : 'pending';
            
            await db
                .update(users)
                .set({
                    kycDocuments: { ...personalDetails, ...docUrls },
                    kycStatus: kycStatus
                })
                .where(eq(users.id, user.id));
            
            return { 
                message: verification.verified ? "Identity verified successfully!" : "Documents uploaded. Verification is pending.",
                status: kycStatus
            };
        } catch (err: any) {
            fastify.log.error(err);
            return reply.code(500).send({ error: err.message || "Internal server error" });
        }
    });

  // GET /kyc/status
  fastify.get("/kyc/status", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = request.user as AuthenticatedRequest['user'];
      
      const [dbUser] = await db
        .select({
          status: users.kycStatus,
          documents: users.kycDocuments
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!dbUser) {
        return reply.code(404).send({ error: "User not found" });
      }

      return {
        status: dbUser.status,
        documents: dbUser.documents
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });
}
