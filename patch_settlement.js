const fs = require('fs');
const path = './sbe/web/src/services/settlement.ts';

let code = fs.readFileSync(path, 'utf8');

const newCode = `import { db } from "../db/index";
import { wallets, trades, ledgerEntries, matches } from "../db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export class SettlementService {
  /**
   * Settles a match with high precision and currency awareness.
   */
   static async settleMatch(matchId: string, winningResult: "team_a" | "team_b" | "draw", currency: string = "INR") {
     if (process.env.NODE_ENV !== 'production') console.log(\`[Settlement] Starting high-precision settlement for match \${matchId} (\${currency})\`);

     const unsettledTrades = await db.select().from(trades).where(and(eq(trades.matchID, matchId), eq(trades.settled, 0)));

     if (unsettledTrades.length === 0) {
       await db.update(matches).set({ status: "completed" }).where(eq(matches.id, matchId));
       return { success: true, affectedUsers: [] };
     }

     const affectedUsers = new Set<string>();

     // 1. Aggregation Phase (Memory only)
     const walletUpdates = new Map<string, { balanceDelta: number, lockedBalanceDelta: number }>();
     const newLedgerEntries: any[] = [];
     const settledTradeIds: string[] = [];

     for (const trade of unsettledTrades) {
        const backerId = trade.backerId;
        const layerId = trade.layerId;
        const stake = parseFloat(trade.stake);
        const price = parseFloat(trade.price);
        const profit = stake * (price - 1);
        const commissionRate = 0.02;

         const backerWins = trade.selectionId === winningResult;

         affectedUsers.add(backerId);
         affectedUsers.add(layerId);

         if (!walletUpdates.has(backerId)) walletUpdates.set(backerId, { balanceDelta: 0, lockedBalanceDelta: 0 });
         if (!walletUpdates.has(layerId)) walletUpdates.set(layerId, { balanceDelta: 0, lockedBalanceDelta: 0 });

         const backerUpdate = walletUpdates.get(backerId)!;
         const layerUpdate = walletUpdates.get(layerId)!;

         if (backerWins) {
          const commission = profit * commissionRate;
          const netProfit = profit - commission;
          const totalPayout = stake + netProfit;

          // Backer Payout
          backerUpdate.balanceDelta += totalPayout;
          backerUpdate.lockedBalanceDelta -= stake;

          // Layer Loss Release (Liability was profit)
          layerUpdate.lockedBalanceDelta -= profit;

          // We defer getting the walletId until inside the transaction
          // or we can select them all in one go before the transaction
          newLedgerEntries.push({
            userId: backerId,
            amount: totalPayout,
            currency,
            type: "settlement_win",
            referenceId: trade.id,
          });
        } else {
          // Layer Wins (Backer selection lost)
          const totalPayout = stake + profit; // Layer gets the backer's stake + their own liability back

          // Layer Payout
          layerUpdate.balanceDelta += totalPayout;
          layerUpdate.lockedBalanceDelta -= profit;

          // Backer Loss Release
          backerUpdate.lockedBalanceDelta -= stake;

          newLedgerEntries.push({
            userId: layerId,
            amount: totalPayout,
            currency,
            type: "settlement_lay_win",
            referenceId: trade.id,
          });
        }

        settledTradeIds.push(trade.id);
    }

    // 2. Resolve Wallet IDs for Ledger
    // Fetch all involved wallets in one query
    const userIdsArray = Array.from(affectedUsers);
    const affectedWallets = await db.select({ id: wallets.id, userId: wallets.userId })
      .from(wallets)
      .where(and(inArray(wallets.userId, userIdsArray), eq(wallets.currency, currency)));

    const walletMap = new Map(affectedWallets.map(w => [w.userId, w.id]));

    // Update ledger entries with real walletIds
    for (const entry of newLedgerEntries) {
      entry.walletId = walletMap.get(entry.userId);
      entry.amount = entry.amount.toFixed(8); // Formatting needed by DB
      delete entry.userId; // Not in DB schema
    }

    // 3. Execution Phase (Single Transaction)
    await db.transaction(async (tx) => {

      // Update Wallets in batch (using individual queries in tx is still much faster than opening a tx per trade)
      // Drizzle doesn't have a great bulk update yet, but firing off promises in parallel within a single TX is fast
      const walletUpdatePromises = Array.from(walletUpdates.entries()).map(([userId, update]) => {
        if (update.balanceDelta === 0 && update.lockedBalanceDelta === 0) return Promise.resolve();

        // Use sign-aware string formatting to ensure correct sql injection
        const balanceOp = update.balanceDelta >= 0 ? '+' : '-';
        const lockedOp = update.lockedBalanceDelta >= 0 ? '+' : '-';

        return tx.update(wallets)
          .set({
            balance: sql\`\${wallets.balance} \${sql.raw(balanceOp)} \${Math.abs(update.balanceDelta).toFixed(8)}\`,
            lockedBalance: sql\`\${wallets.lockedBalance} \${sql.raw(lockedOp)} \${Math.abs(update.lockedBalanceDelta).toFixed(8)}\`,
            updatedAt: new Date(),
          })
          .where(and(eq(wallets.userId, userId), eq(wallets.currency, currency)));
      });

      // Execute wallet updates in chunks to avoid overwhelming pool if thousands of users
      const CHUNK_SIZE = 50;
      for (let i = 0; i < walletUpdatePromises.length; i += CHUNK_SIZE) {
        await Promise.all(walletUpdatePromises.slice(i, i + CHUNK_SIZE));
      }

      // Insert Ledger Entries in bulk chunks
      const LEDGER_CHUNK_SIZE = 1000;
      for (let i = 0; i < newLedgerEntries.length; i += LEDGER_CHUNK_SIZE) {
        await tx.insert(ledgerEntries).values(newLedgerEntries.slice(i, i + LEDGER_CHUNK_SIZE));
      }

      // Mark trades as settled
      const TRADE_CHUNK_SIZE = 1000;
      for (let i = 0; i < settledTradeIds.length; i += TRADE_CHUNK_SIZE) {
        await tx.update(trades)
          .set({ settled: 1 })
          .where(inArray(trades.id, settledTradeIds.slice(i, i + TRADE_CHUNK_SIZE)));
      }

      // Mark match completed
      await tx.update(matches).set({ status: "completed" }).where(eq(matches.id, matchId));
    });

    return { success: true, affectedUsers: userIdsArray };
   }
 }
`;

fs.writeFileSync(path, newCode);
console.log('Patched', path);
