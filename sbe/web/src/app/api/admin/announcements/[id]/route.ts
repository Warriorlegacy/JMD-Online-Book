import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Partial<{ message: string; active: number }> = {};
    if (body.message !== undefined) updates.message = body.message;
    if (body.active !== undefined) updates.active = body.active;

    const [row] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.delete(announcements).where(eq(announcements.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed" },
      { status: 500 }
    );
  }
}
