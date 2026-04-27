import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allMatches = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.startTime));
    return NextResponse.json(allMatches);
  } catch (err: any) {
    console.error("Failed to fetch matches:", err);
    return NextResponse.json([]);
  }
}
