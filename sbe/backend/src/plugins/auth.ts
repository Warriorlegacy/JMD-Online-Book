import { createClient } from "@supabase/supabase-js";
import { FastifyRequest, FastifyReply } from "fastify";

const supabaseUrl = process.env.SUPABASE_URL || "https://zkvrlwqcfeecsecrzlnu.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function verifySession(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    // For demo purposes, if no auth header is present, we still use the mock user
    // In production, we would throw an unauthorized error.
    (request as any).user = { id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" };
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  (request as any).user = user;
}
