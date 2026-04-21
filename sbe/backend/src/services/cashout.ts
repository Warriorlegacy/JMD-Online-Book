import { db } from "../db/index.js";
import { bets, betSelections, oddsMarkets } from "../db/schema.js";
import { WalletService } from "./wallet.js";
import { eq, and } from "drizzle-orm";

export class CashOutService {
  static async calculateCashOutValue(betId: string): Promise<number> {
    const [bet] = await db.select().from(bets).where(eq(bets.id, betId)).limit(1);
    if (!bet) throw new Error("Bet not found");
    if (bet.status !== "open") throw new Error("Bet cannot be cashed out");

    const selections = await db.select().from(betSelections).where(eq(betSelections.betId, betId));
    const stake = parseFloat(bet.stake);
    const initialOdds = parseFloat(bet.totalOdds);

    let currentTotalProbability = 1;

    for (const sel of selections) {
      const [market] = await db.select().from(oddsMarkets)
        .where(and(eq(oddsMarkets.id, sel.marketId), eq(oddsMarkets.selection, sel.selectionId)))
        .limit(1);

      if (!market) throw new Error(`Market not found for selection ${sel.selectionId}`);
      
      const currentOdds = parseFloat(market.odds);
      // Probability = 1 / Odds
      currentTotalProbability *= (1 / currentOdds);
    }

    // Formula: CashOutValue = (Stake * InitialOdds) * (CurrentProbabilityOfWinning)
    const cashOutValue = (stake * initialOdds) * currentTotalProbability;
    
    return cashOutValue;
  }

  static async executeCashOut(betId: string, userId: string) {
    const [bet] = await db.select().from(bets).where(eq(bets.id, betId)).limit(1);
    if (!bet) throw new Error("Bet not found");
    if (bet.userId !== userId) throw new Error("Unauthorized");
    if (bet.status !== "open") throw new Error("Bet cannot be cashed out");

    const cashOutValue = await this.calculateCashOutValue(betId);

    return await db.transaction(async (tx) => {
      // 1. Mark bet as cashed out
      await tx.update(bets).set({ status: "cashed_out" }).where(eq(bets.id, betId));

       // 2. Credit user wallet
       await WalletService.credit(
         userId, 
         cashOutValue.toFixed(2), 
         `cashout_bet_${betId}`, 
         "cash_out"
       );

      return { 
        betId, 
        cashOutValue: cashOutValue.toFixed(2), 
        status: "cashed_out" 
      };
    });
  }
}
