import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    // Only allow fetching own bets unless admin
    if (queryUserId && queryUserId !== userId && payload.role !== "admin") {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = queryUserId || userId;

    const activeOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, targetUserId),
          eq(orders.status, "open") // or partially_matched
        )
      )
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(activeOrders);
  } catch (err: any) {
    console.error("Failed to fetch active bets:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
