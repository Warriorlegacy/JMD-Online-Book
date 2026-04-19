import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users, wallets } from "../db/schema.js";
import { eq, or } from "drizzle-orm";

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  identifier: z.string(), // can be email or username
  password: z.string(),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/register
  fastify.post("/auth/register", async (request, reply) => {
    try {
      const { username, email, password } = registerSchema.parse(request.body);

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)))
        .limit(1);

      if (existingUser.length > 0) {
        return reply.code(400).send({ error: "Username or email already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user and wallet in a transaction
      const result = await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            username,
            email,
            passwordHash,
            role: "user",
          })
          .returning();

        const [newWallet] = await tx
          .insert(wallets)
          .values({
            userId: newUser.id,
            currency: "INR",
            balance: "0.00000000",
          })
          .returning();

        return { user: newUser, wallet: newWallet };
      });

      // Sign JWT
      const token = fastify.jwt.sign({ 
        id: result.user.id, 
        role: result.user.role,
        username: result.user.username 
      });

      // Set cookie
      reply.setCookie("sbe_token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        message: "Registration successful",
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role
        },
        token
      };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // POST /auth/login
  fastify.post("/auth/login", async (request, reply) => {
    try {
      const { identifier, password } = loginSchema.parse(request.body);

      const [user] = await db
        .select()
        .from(users)
        .where(or(eq(users.email, identifier), eq(users.username, identifier)))
        .limit(1);

      if (!user || !user.passwordHash) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      // Sign JWT
      const token = fastify.jwt.sign({ 
        id: user.id, 
        role: user.role,
        username: user.username 
      });

      // Set cookie
      reply.setCookie("sbe_token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // POST /auth/logout
  fastify.post("/auth/logout", async (request, reply) => {
    reply.clearCookie("sbe_token", { path: "/" });
    return { message: "Logged out successfully" };
  });

  // GET /auth/me
  fastify.get("/auth/me", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    return { user: request.user };
  });
}
