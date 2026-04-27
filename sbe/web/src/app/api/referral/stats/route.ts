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
        `SELECT
           u.referral_code as "referralCode",
           COUNT(DISTINCT r.id)::int as "totalReferees",
           COALESCE(SUM(re.amount), 0)::text as "totalEarnings"
         FROM public.users u
         LEFT JOIN public.referrals r ON r.referrer_id = u.id
         LEFT JOIN public.referral_earnings re ON re.referral_id = r.id
         WHERE u.id = $1
         GROUP BY u.id, u.referral_code`,
        [userId]
      );

      const row = result.rows[0] ?? {
        referralCode: null,
        totalReferees: 0,
        totalEarnings: "0",
      };
      const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

      return NextResponse.json({
        referralCode: row.referralCode,
        totalReferees: row.totalReferees,
        totalEarnings: row.totalEarnings,
        referralLink: row.referralCode ? `${origin}/register?ref=${row.referralCode}` : "",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
