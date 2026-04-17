import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev_sbe_secret_key_123"
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sbe_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify JWT locally — no need to hit the Render backend
    let payload: any;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch {
      const response = NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      response.cookies.delete("sbe_token");
      return response;
    }

    // Fetch fresh user data from DB
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.username, u.email, u.role, w.balance
         FROM users u
         LEFT JOIN wallets w ON w.user_id = u.id
         WHERE u.id = $1
         LIMIT 1`,
        [payload.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = result.rows[0];
      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
        },
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[GET /api/auth/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
