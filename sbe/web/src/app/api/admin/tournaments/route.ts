import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { desc } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const data = await db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.createdAt));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { name, sportType, metadata } = await request.json();
    if (!name || !sportType) {
      return NextResponse.json({ error: "name and sportType are required" }, { status: 400 });
    }

    const [row] = await db
      .insert(tournaments)
      .values({ name, sportType, metadata: metadata ?? null })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed to create tournament" },
      { status: 500 }
    );
  }
}
