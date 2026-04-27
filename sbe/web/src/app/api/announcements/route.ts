import { NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(announcements)
      .where(eq(announcements.active, 1))
      .orderBy(desc(announcements.createdAt));
    return NextResponse.json(data);
  } catch (err) {
    console.error("Announcements error:", err);
    return NextResponse.json([]);
  }
}
