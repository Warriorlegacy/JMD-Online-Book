import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { desc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const data = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { message, active } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const [row] = await db
      .insert(announcements)
      .values({ message, active: active ?? 1 })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
