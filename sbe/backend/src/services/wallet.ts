import { db } from "../db/index.js";
import { wallets, ledgerEntries } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export class WalletService {
  /**
   * Locks the required funds (stake or liability) for an order placement.
   * currency: 'INR', 'USD', etc.
   */
  static async lockFunds(userId: string, amount: string, orderId: string, type: string, currency: string = "INR") {
    return await db.transaction(async (tx) => {
      // 1. Get current wallet for specific currency
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)))
        .limit(1);
      
      if (!wallet) {
        throw new Error(`Wallet not found for currency ${currency}`);
      }

      const balance = parseFloat(wallet.balance);
      const required = parseFloat(amount);

      if (balance < required) {
        throw new Error(`Insufficient balance in ${currency}`);
      }

      // 2. Update wallet: Decrement balance, Increment lockedBalance
      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${amount}`,
          lockedBalance: sql`${wallets.lockedBalance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));

      // 3. Create Ledger Entry
      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        amount: amount,
        currency,
        type: `escrow_lock_${type}`,
        referenceId: orderId,
      });

      return { success: true };
    });
  }

  /**
   * Releases locked funds.
   */
  static async releaseFunds(userId: string, amount: string, orderId: string, currency: string = "INR") {
    return await db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)))
        .limit(1);
      
      if (!wallet) throw new Error("Wallet not found");

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${amount}`,
          lockedBalance: sql`${wallets.lockedBalance} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));

      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        amount: amount,
        currency,
        type: "escrow_release",
        referenceId: orderId,
      });

      return { success: true };
    });
  }
}
