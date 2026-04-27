import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequests } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const result = await db.execute(`
      SELECT 
        wr.id, wr.user_id as "userId", wr.amount, wr.upi_id as "upiId",
        wr.status, wr.created_at as "createdAt",
        u.username, u.email
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      ORDER BY wr.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
