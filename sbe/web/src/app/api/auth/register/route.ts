import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { pool } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev_sbe_secret_key_123"
);

export async function POST(request: NextRequest) {
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
      // Check existing user
      const existing = await client.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1",
        [email.toLowerCase(), username.toLowerCase()]
      );
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create user + wallet in transaction
      await client.query("BEGIN");
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, username, email, role`,
        [username, email.toLowerCase(), passwordHash]
      );
      const newUser = userResult.rows[0];

      await client.query(
        `INSERT INTO wallets (user_id, currency, balance, locked_balance)
         VALUES ($1, 'INR', '0.00000000', '0.00000000')`,
        [newUser.id]
      );
      await client.query("COMMIT");

      // Sign JWT
      const token = await new SignJWT({ id: newUser.id, role: newUser.role, username: newUser.username })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({
        message: "Registration successful",
        user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
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
  } catch (err: any) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
