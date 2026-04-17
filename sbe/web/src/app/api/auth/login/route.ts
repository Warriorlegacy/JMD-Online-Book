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
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Find user by email or username
      const result = await client.query(
        `SELECT id, username, email, password_hash, role
         FROM users
         WHERE email = $1 OR username = $1
         LIMIT 1`,
        [identifier.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const user = result.rows[0];

      if (!user.password_hash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Sign JWT
      const token = await new SignJWT({ id: user.id, role: user.role, username: user.username })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const response = NextResponse.json({
        message: "Login successful",
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
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
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
