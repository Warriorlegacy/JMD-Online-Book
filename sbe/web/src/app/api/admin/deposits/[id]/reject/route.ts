import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const client = await pool.connect();
    let deposit;
    try {
      const result = await client.query(
        `SELECT id, status
         FROM public.deposit_requests
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      deposit = result.rows[0];
    } finally {
      client.release();
    }

    if (!deposit) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 });
    }
    if (deposit.status !== "pending") {
      return NextResponse.json({ error: `Deposit is already ${deposit.status}` }, { status: 400 });
    }

    const updateClient = await pool.connect();
    try {
      await updateClient.query(
        `UPDATE public.deposit_requests
         SET status = 'rejected'
         WHERE id = $1`,
        [id]
      );
    } finally {
      updateClient.release();
    }

    return NextResponse.json({ success: true, message: "Deposit rejected" });
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed to reject deposit" },
      { status: 500 }
    );
  }
}
