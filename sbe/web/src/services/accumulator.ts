import { db } from "../db/index.js";
import { bets, betSelections } from "../db/schema.js";
import { WalletService } from "./wallet.js";
import { eq } from "drizzle-orm";

export interface AccumulatorSelection {
  matchId: string;
  marketId: string;
  selectionId: string;
  odds: number;
}

export class AccumulatorService {
  static calculateTotalOdds(selections: AccumulatorSelection[]): number {
    return selections.reduce((acc, sel) => acc * sel.odds, 1);
  }

  static calculatePotentialPayout(stake: number, totalOdds: number): number {
    return stake * totalOdds;
  }

  static async validateSelections(selections: AccumulatorSelection[]): Promise<{ valid: boolean; error?: string }> {
    const matchSelections = new Map<string, string[]>();

    for (const sel of selections) {
      if (!matchSelections.has(sel.matchId)) {
        matchSelections.set(sel.matchId, []);
      }
      matchSelections.get(sel.matchId)!.push(sel.marketId);
    }

    for (const [matchId, markets] of matchSelections) {
      const uniqueMarkets = new Set(markets);
      if (uniqueMarkets.size !== markets.length) {
        return { 
          valid: false, 
          error: `Correlating markets detected for match ${matchId}. You can only select one outcome per market per match.` 
        };
      }
    }

    return { valid: true };
  }

  static async placeAccumulatorBet(
    userId: string, 
    tenantId: string, 
    stake: number, 
    selections: AccumulatorSelection[]
  ) {
    const validation = await this.validateSelections(selections);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const totalOdds = this.calculateTotalOdds(selections);
    const potentialPayout = this.calculatePotentialPayout(stake, totalOdds);

    // Lock funds using WalletService
    await WalletService.lockFunds(
      userId, 
      stake.toFixed(2), 
      `acc_bet_${Date.now()}`, 
      "accumulator_stake"
    );

    return await db.transaction(async (tx) => {
      const [bet] = await tx.insert(bets).values({
        userId,
        tenantId,
        totalOdds: totalOdds.toFixed(4),
        stake: stake.toFixed(8),
        potentialPayout: potentialPayout.toFixed(8),
        status: "open",
      }).returning();

      const selectionValues = selections.map(sel => ({
        betId: bet.id,
        matchId: sel.matchId,
        marketId: sel.marketId,
        selectionId: sel.selectionId,
        odds: sel.odds.toFixed(4),
      }));

      await tx.insert(betSelections).values(selectionValues);

      return bet;
    });
  }

  static async settleAccumulator(betId: string) {
    const [bet] = await db.select().from(bets).where(eq(bets.id, betId)).limit(1);
    if (!bet) throw new Error("Bet not found");

    const selections = await db.select().from(betSelections).where(eq(betSelections.betId, betId));
    
    let allWon = true;
    let anyLost = false;

    for (const sel of selections) {
      // Here we would check the actual match result. 
      // Since we don't have a match result table yet, I'll assume 
      // we have a way to determine if a selection won/lost.
      // For now, I will implement the "All-or-Nothing" logic structure.
      const status = await this.getSelectionStatus(sel.matchId, sel.selectionId);
      if (status === "lost") {
        anyLost = true;
        allWon = false;
        break;
      } else if (status === "pending") {
        allWon = false;
      }
    }

    if (anyLost) {
      await db.update(bets).set({ status: "lost" }).where(eq(bets.id, betId));
      // Stake is already locked/deducted
    } else if (allWon) {
      await db.update(bets).set({ status: "won" }).where(eq(bets.id, betId));
       const payout = parseFloat(bet.potentialPayout);
       await WalletService.credit(bet.userId, payout.toFixed(2), `payout_bet_${betId}`, "bet_win");
    }
  }

  private static async getSelectionStatus(_matchId: string, _selectionId: string): Promise<"won" | "lost" | "pending"> {
    // This is a placeholder. In a real system, this would check the match result.
    return "pending"; 
  }
}
