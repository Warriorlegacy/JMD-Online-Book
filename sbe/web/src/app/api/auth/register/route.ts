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
    const { username, email, password } = body;

    // Basic validation
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "Username must be 3-20 characters" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username can only contain alphanumeric characters and underscores" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Check for existing user — explicitly target public schema to avoid auth.users
      const existing = await client.query(
        "SELECT id FROM public.users WHERE lower(email) = $1 OR lower(username) = $2 LIMIT 1",
        [email.toLowerCase(), username.toLowerCase()]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create user + wallet in transaction
      await client.query("BEGIN");
      const userResult = await client.query(
        `INSERT INTO public.users (username, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, username, email, role`,
        [username, email.toLowerCase(), passwordHash]
      );
      const newUser = userResult.rows[0];

      // Create wallet for new user (use numeric 0 for the balance columns)
      await client.query(
        `INSERT INTO public.wallets (user_id, currency, balance, locked_balance)
         VALUES ($1, 'INR', 0, 0)`,
        [newUser.id]
      );
      await client.query("COMMIT");

      // Sign JWT — matches the same secret as the Fastify backend
      const token = await new SignJWT({
        id: newUser.id,
        role: newUser.role,
        username: newUser.username,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({
        message: "Registration successful",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      }, { status: 201 });

      response.cookies.set("sbe_token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/auth/register] ERROR:", errorMsg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
