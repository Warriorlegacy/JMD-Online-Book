import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    const token = await getTokenFromCookie();
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Join users and wallets to get balances
    const result = await db.execute(`
      SELECT 
        u.id, u.username, u.email, u.role, u.created_at as "createdAt",
        COALESCE(w.balance, '0') as balance
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id AND w.currency = 'INR'
      ORDER BY u.created_at DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

async function getTokenFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  if (!token) throw new Error("Unauthorized");
  return token;
}
