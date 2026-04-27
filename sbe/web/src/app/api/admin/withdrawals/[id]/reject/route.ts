import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const [withdrawal] = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }
    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: `Withdrawal is already ${withdrawal.status}` }, { status: 400 });
    }

    // Reject: release the locked funds back to available balance
    await db
      .update(withdrawalRequests)
      .set({ status: "rejected" })
      .where(eq(withdrawalRequests.id, id));

    await WalletService.releaseFunds(
      withdrawal.userId,
      withdrawal.amount,
      withdrawal.id,
      "INR"
    );

    return NextResponse.json({ success: true, message: "Withdrawal rejected and funds released" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reject withdrawal" },
      { status: 500 }
    );
  }
}
