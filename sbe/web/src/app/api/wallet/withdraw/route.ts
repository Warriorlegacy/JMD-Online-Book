import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { withdrawalRequests, wallets, ledgerEntries } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { jwtVerify } from "jose";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const body = await request.json();
    const { amount, upiId } = body;

    if (!amount || amount <= 0 || !upiId) {
      return NextResponse.json({ error: "Invalid amount or UPI ID" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // Get wallet
      const [wallet] = await tx.select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

      if (!wallet || parseFloat(wallet.balance) < amount) {
        throw new Error("Insufficient balance");
      }

      // Deduct from balance directly
      await tx.update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(wallets.id, wallet.id));

      // Create withdrawal request
      const [requestRecord] = await tx.insert(withdrawalRequests).values({
        userId,
        amount: amount.toString(),
        upiId,
        status: "pending"
      }).returning();

      // Create ledger entry
      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        amount: amount.toString(),
        currency: wallet.currency,
        type: "withdrawal",
        referenceId: requestRecord.id
      });

      return requestRecord;
    });

    return NextResponse.json({ message: "Withdrawal request submitted successfully", request: result });
  } catch (err: any) {
    console.error("Withdrawal error:", err);
    if (err.message === "Insufficient balance") {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
