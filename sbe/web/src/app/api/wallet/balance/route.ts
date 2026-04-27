import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const [wallet] = await db.select({
      balance: wallets.balance,
      lockedBalance: wallets.lockedBalance,
      currency: wallets.currency
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

    if (!wallet) {
      return NextResponse.json({ balance: 0, locked: 0, currency: "INR" });
    }

    return NextResponse.json({
      balance: parseFloat(wallet.balance),
      locked: parseFloat(wallet.lockedBalance),
      currency: wallet.currency
    });
  } catch (err: any) {
    console.error("Wallet balance error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
