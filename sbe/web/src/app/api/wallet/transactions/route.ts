import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { depositRequests, withdrawalRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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

    const deposits = await db
      .select()
      .from(depositRequests)
      .where(eq(depositRequests.userId, userId))
      .orderBy(desc(depositRequests.createdAt))
      .limit(20);

    const withdrawals = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt))
      .limit(20);
      
    return NextResponse.json({
      deposits,
      withdrawals
    });
  } catch (err: any) {
    console.error("Wallet transactions error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
