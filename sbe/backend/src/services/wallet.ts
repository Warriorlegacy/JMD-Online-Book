import { db } from "../db/index.js";
import { wallets, ledgerEntries } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export class WalletService {
  /**
   * Credits the user's wallet.
   */
  static async credit(userId: string, amount: string, referenceId: string, type: string = "deposit", currency: string = "INR") {
    return await db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)))
        .limit(1);

      if (!wallet) {
        // Create wallet if it doesn't exist
        const [newWallet] = await tx.insert(wallets).values({
          userId,
          currency,
          balance: amount,
          updatedAt: new Date(),
        }).returning();
        
        await tx.insert(ledgerEntries).values({
          walletId: newWallet.id,
          amount,
          currency,
          type,
          referenceId,
        });

        return { success: true, walletId: newWallet.id };
      }

      await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, wallet.id));

      await tx.insert(ledgerEntries).values({
        walletId: wallet.id,
        amount,
        currency,
        type,
        referenceId,
      });

      return { success: true, walletId: wallet.id };
    });
  }

  /**
   * Locks the required funds (stake or liability) for an order placement.
   * currency: 'INR', 'USD', etc.
   */
  static async lockFunds(userId: string, amount: string, orderId: string, type: string, currency: string = "INR") {
    return await db.transaction(async (tx) => {
      // 1. Get wallet ID and verify existence
      const [wallet] = await tx
        .select({ id: wallets.id })
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)))
        .limit(1);
      
      if (!wallet) {
        throw new Error(`Wallet not found for currency ${currency}`);
      }

      // 2. Atomic update with balance check
      const result = await tx
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} - ${amount}`,
          lockedBalance: sql`${wallets.lockedBalance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(and(eq(wallets.id, wallet.id), sql`${wallets.balance} >= ${amount}`));

      if (result.rowCount === 0) {
        throw new Error(`Insufficient balance in ${currency}`);
      }

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
        .where(and(eq(wallets.id, wallet.id), sql`${wallets.lockedBalance} >= ${amount}`));

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
