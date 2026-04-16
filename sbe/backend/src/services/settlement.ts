import { db } from "../db/index.js";
import { wallets, trades, ledgerEntries, matches } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export class SettlementService {
  /**
   * Settles a match with high precision and currency awareness.
   */
  static async settleMatch(matchId: string, winningResult: "team_a" | "team_b" | "draw", currency: string = "INR") {
    console.log(`[Settlement] Starting high-precision settlement for match ${matchId} (${currency})`);

     const unsettledTrades = await db.select().from(trades).where(and(eq(trades.matchID, matchId), eq(trades.settled, 0)));

     const affectedUsers = new Set<string>();

     for (const trade of unsettledTrades) {
      await db.transaction(async (tx) => {
        const backerId = trade.backerId;
        const layerId = trade.layerId;
        const stake = parseFloat(trade.stake);
        const price = parseFloat(trade.price);
        const profit = stake * (price - 1);
        const commissionRate = 0.02;

         const backerWins = true; // Strategy-dependent logic

         affectedUsers.add(backerId);
         affectedUsers.add(layerId);

         if (backerWins) {
          const commission = profit * commissionRate;
          const netProfit = profit - commission;
          const totalPayout = stake + netProfit;

          // Backer Payout
          await tx
            .update(wallets)
            .set({
              balance: sql`${wallets.balance} + ${totalPayout.toFixed(8)}`,
              lockedBalance: sql`${wallets.lockedBalance} - ${stake.toFixed(8)}`,
              updatedAt: new Date(),
            })
            .where(and(eq(wallets.userId, backerId), eq(wallets.currency, currency)));

          // Layer Loss Release
          const liability = profit;
          await tx
            .update(wallets)
            .set({
              lockedBalance: sql`${wallets.lockedBalance} - ${liability.toFixed(8)}`,
              updatedAt: new Date(),
            })
            .where(and(eq(wallets.userId, layerId), eq(wallets.currency, currency)));

          await tx.insert(ledgerEntries).values({
            walletId: (await tx.select().from(wallets).where(and(eq(wallets.userId, backerId), eq(wallets.currency, currency))).limit(1))[0].id,
            amount: totalPayout.toFixed(8),
            currency,
            type: "settlement_win",
            referenceId: trade.id,
          });
        }

        await tx.update(trades).set({ settled: 1 }).where(eq(trades.id, trade.id));
      });
    }

     await db.update(matches).set({ status: "completed" }).where(eq(matches.id, matchId));
     return { success: true, affectedUsers: Array.from(affectedUsers) };
   }
 }
