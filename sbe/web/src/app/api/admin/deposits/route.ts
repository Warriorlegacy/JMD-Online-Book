import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
      SELECT 
        dr.id, dr.user_id as "userId", dr.amount, dr.upi_id as "upiId",
        dr.utr_number as "utrNumber", NULL::text as "paymentGateway",
        NULL::text as "paymentReference", dr.status, dr.created_at as "createdAt",
        u.username, u.email
      FROM public.deposit_requests dr
      LEFT JOIN public.users u ON dr.user_id = u.id
      ORDER BY dr.created_at DESC
    `);
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
