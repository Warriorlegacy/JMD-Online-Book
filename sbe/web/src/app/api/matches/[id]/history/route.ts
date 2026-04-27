import { NextResponse } from "next/server";
import { db } from "@/db";
import { marketHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const history = await db
      .select()
      .from(marketHistory)
      .where(eq(marketHistory.matchId, id))
      .orderBy(desc(marketHistory.timestamp))
      .limit(100);

    return NextResponse.json(history.reverse());
  } catch (err: any) {
    console.error("Match history error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
