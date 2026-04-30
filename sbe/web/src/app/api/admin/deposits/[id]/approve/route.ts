import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import { WalletService } from "@/services/wallet";

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
        `SELECT id, user_id as "userId", amount, status
         FROM public.deposit_requests
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      deposit = result.rows?.[0];
    } finally {
      client.release();
    }

    if (!deposit) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 });
    }
    if (deposit.status !== "pending") {
      return NextResponse.json({ error: `Deposit is already ${deposit.status}` }, { status: 400 });
    }

    // Update status to approved
    const updateClient = await pool.connect();
    try {
      await updateClient.query(
        `UPDATE public.deposit_requests
         SET status = 'approved'
         WHERE id = $1`,
        [id]
      );
    } finally {
      updateClient.release();
    }

    // Credit the user's wallet
    await WalletService.credit(
      deposit.userId,
      deposit.amount,
      deposit.id,
      "deposit_approved",
      "INR"
    );

    return NextResponse.json({ success: true, message: "Deposit approved and wallet credited" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to approve deposit" },
      { status: 500 }
    );
  }
}
