import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateSecret, verify, generateURI } from "otplib";
import { db } from "../db/index.js";
import { users, wallets } from "../db/schema.js";
import { eq, or } from "drizzle-orm";

interface MfaTokenPayload {
  id: string;
  purpose: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    role: string;
    username: string;
    email?: string;
  };
}

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  identifier: z.string(), // can be email or username
  password: z.string(),
});

const verify2faSchema = z.object({
  mfaToken: z.string(),
  code: z.string(),
});

// Simple in-memory rate limiter for 2FA verification
const mfaRateLimit = new Map<string, { attempts: number; lastAttempt: number }>();
const MAX_MFA_ATTEMPTS = 5;
const MFA_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/2fa/setup
  fastify.post("/auth/2fa/setup", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const user = request.user as AuthenticatedRequest['user'];
      const secret = generateSecret();
      
      await db
        .update(users)
        .set({ twoFactorSecret: secret })
        .where(eq(users.id, user.id));
        
      const otpauth = generateURI({ issuer: "JMD Online Book", secret, label: user.email || "" });
      
      return { 
        secret, 
        otpauth,
        message: "2FA secret generated. Please scan the QR code and verify the first code to enable 2FA."
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

  // POST /auth/2fa/enable
  fastify.post("/auth/2fa/enable", { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { code } = verify2faSchema.omit({ mfaToken: true }).parse(request.body);
      const user = request.user as AuthenticatedRequest['user'];
      
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
        
      if (!dbUser?.twoFactorSecret) {
        return reply.code(400).send({ error: "2FA not set up. Please call /auth/2fa/setup first." });
      }
      
      const isValid = verify({ token: code, secret: dbUser.twoFactorSecret });
      if (!isValid) {
        return reply.code(400).send({ error: "Invalid verification code" });
      }
      
      await db
        .update(users)
        .set({ twoFactorEnabled: 1 })
        .where(eq(users.id, user.id));
        
      return { message: "Two-factor authentication enabled successfully" };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ error: err.issues[0].message });
      }
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });

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

      // Generate referral code helper
      const generateReferralCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

      // Create user and wallet in a transaction
      const result = await db.transaction(async (tx) => {
        const referralCode = generateReferralCode();
        
        const [newUser] = await tx
          .insert(users)
          .values({
            username,
            email,
            passwordHash,
            role: "user",
            referralCode,
            referredByCode: (request.body as any).referredBy || null,
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

      if (user.twoFactorEnabled === 1) {
        const mfaToken = fastify.jwt.sign(
          { id: user.id, purpose: "mfa_verify" }, 
          { expiresIn: "10m" }
        );
        
        return {
          status: "MFA_REQUIRED",
          mfaToken,
          message: "Two-factor authentication is required"
        };
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

  // POST /auth/2fa/verify
  fastify.post("/auth/2fa/verify", async (request, reply) => {
    try {
      const { mfaToken, code } = verify2faSchema.parse(request.body);
      
      const decoded = fastify.jwt.verify(mfaToken) as MfaTokenPayload;
      if (decoded.purpose !== "mfa_verify") {
        return reply.code(401).send({ error: "Invalid MFA token" });
      }
      
      const userId = decoded.id;
      
      // Rate limiting
      const rateLimit = mfaRateLimit.get(userId);
      if (rateLimit && rateLimit.attempts >= MAX_MFA_ATTEMPTS && (Date.now() - rateLimit.lastAttempt) < MFA_LOCKOUT_TIME) {
        return reply.code(429).send({ error: "Too many failed attempts. Please try again in 15 minutes." });
      }
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
        
      if (!user || !user.twoFactorSecret) {
        return reply.code(401).send({ error: "Invalid session or 2FA not configured" });
      }
      
      const isValid = verify({ token: code, secret: user.twoFactorSecret });
      
      if (!isValid) {
        const currentLimit = rateLimit || { attempts: 0, lastAttempt: 0 };
        mfaRateLimit.set(userId, { 
          attempts: currentLimit.attempts + 1, 
          lastAttempt: Date.now() 
        });
        return reply.code(401).send({ error: "Invalid verification code" });
      }
      
      // Clear rate limit on success
      mfaRateLimit.delete(userId);
      
      // Sign final JWT
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
        message: "2FA verification successful",
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
      return reply.code(401).send({ error: "Invalid or expired MFA token" });
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
