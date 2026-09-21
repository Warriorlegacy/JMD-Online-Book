import { describe, it, expect } from "vitest";
import { AccumulatorService, type AccumulatorSelection } from "../services/accumulator";

describe("AccumulatorService", () => {
  describe("calculateTotalOdds", () => {
    it("returns 1 for empty selections", () => {
      expect(AccumulatorService.calculateTotalOdds([])).toBe(1);
    });

    it("returns the single odds if there is one selection", () => {
      const selections: AccumulatorSelection[] = [
        { matchId: "1", marketId: "m1", selectionId: "s1", odds: 2.5 }
      ];
      expect(AccumulatorService.calculateTotalOdds(selections)).toBe(2.5);
    });

    it("multiplies the odds for multiple selections", () => {
      const selections: AccumulatorSelection[] = [
        { matchId: "1", marketId: "m1", selectionId: "s1", odds: 2.5 },
        { matchId: "2", marketId: "m2", selectionId: "s2", odds: 1.5 },
        { matchId: "3", marketId: "m3", selectionId: "s3", odds: 1.2 }
      ];
      // 2.5 * 1.5 * 1.2 = 4.5
      expect(AccumulatorService.calculateTotalOdds(selections)).toBeCloseTo(4.5);
    });
  });

  describe("calculatePotentialPayout", () => {
    it("calculates potential payout correctly", () => {
      expect(AccumulatorService.calculatePotentialPayout(100, 4.5)).toBe(450);
      expect(AccumulatorService.calculatePotentialPayout(50, 2)).toBe(100);
      expect(AccumulatorService.calculatePotentialPayout(0, 5)).toBe(0);
    });
  });

  describe("validateSelections", () => {
    it("returns valid for empty selections", async () => {
      const result = await AccumulatorService.validateSelections([]);
      expect(result.valid).toBe(true);
    });

    it("returns valid for multiple selections from different matches", async () => {
      const selections: AccumulatorSelection[] = [
        { matchId: "1", marketId: "m1", selectionId: "s1", odds: 2.5 },
        { matchId: "2", marketId: "m2", selectionId: "s2", odds: 1.5 }
      ];
      const result = await AccumulatorService.validateSelections(selections);
      expect(result.valid).toBe(true);
    });

    it("returns invalid for selections from the same market", async () => {
      const selections: AccumulatorSelection[] = [
        { matchId: "1", marketId: "m1", selectionId: "s1", odds: 2.5 },
        { matchId: "1", marketId: "m1", selectionId: "s2", odds: 1.5 }
      ];
      const result = await AccumulatorService.validateSelections(selections);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Correlating markets detected for match 1");
    });

    it("returns valid for selections from different markets of the same match", async () => {
      // The current logic in AccumulatorService seems to check if the same market is repeated in a match.
      // Wait, let's look at the current logic:
      // uniqueMarkets.size !== markets.length
      // If we select market m1 and market m2 for match 1:
      // markets = ["m1", "m2"]
      // uniqueMarkets = {"m1", "m2"} -> size 2 == length 2 -> valid.
      // So this should be valid.
      const selections: AccumulatorSelection[] = [
        { matchId: "1", marketId: "m1", selectionId: "s1", odds: 2.5 },
        { matchId: "1", marketId: "m2", selectionId: "s2", odds: 1.5 }
      ];
      const result = await AccumulatorService.validateSelections(selections);
      expect(result.valid).toBe(true);
    });
  });
});
