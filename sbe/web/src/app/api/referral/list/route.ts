import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  const secretStr = process.env.JWT_SECRET;

  if (!token || !secretStr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const JWT_SECRET = new TextEncoder().encode(secretStr);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;
    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT u.id, u.username, r.created_at as "createdAt", r.status
         FROM public.referrals r
         INNER JOIN public.users u ON u.id = r.referee_id
         WHERE r.referrer_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
      );

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
