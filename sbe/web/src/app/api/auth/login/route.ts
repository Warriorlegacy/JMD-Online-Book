import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
  const secretStr = process.env.JWT_SECRET;
  if (!secretStr) {
    console.error("JWT_SECRET environment variable is not set");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
  const JWT_SECRET = new TextEncoder().encode(secretStr);
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Explicitly use public schema to avoid auth.users ambiguity
      const result = await client.query(
        `SELECT id, username, email, password_hash, role
         FROM public.users
         WHERE lower(email) = lower($1) OR lower(username) = lower($1)
         LIMIT 1`,
        [identifier]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const user = result.rows?.[0];

      if (!user.password_hash) {
        return NextResponse.json({ error: "Invalid credentials — account may use a different login method" }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Get wallet balance
      const walletResult = await client.query(
        "SELECT balance FROM public.wallets WHERE user_id = $1 LIMIT 1",
        [user.id]
      );
      const balance = walletResult.rows?.[0]?.balance ?? "0.00";

      // Sign JWT — matches same secret as Fastify backend
      const token = await new SignJWT({
        id: user.id,
        role: user.role,
        username: user.username,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: String(balance),
        },
        token,
      });

      response.cookies.set("sbe_token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    } finally {
      client.release();
    }
  } catch (err: any) {
    const dbUrl = process.env.DATABASE_URL || "";
    console.error("[POST /api/auth/login] ERROR:", err.message);
    return NextResponse.json({ 
      error: "Internal server error", 
      dbUrlLength: dbUrl.length,
      dbUrlPrefix: dbUrl?.substring(0, 10),
      detail: err.message 
    }, { status: 500 });
  }
}
