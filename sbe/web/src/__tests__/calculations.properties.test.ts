import { test, expect } from "vitest";
import fc from "fast-check";
import {
  calculateLiability,
  calculateProfit,
  validateUTR,
  sortOrderBook,
  type PriceLevel,
} from "@/lib/bet-calculations";

test("Property 1 & 2: Lay/Back liability and profit calculations", () => {
  fc.assert(
    fc.property(
      fc.constantFrom("back", "lay"),
      fc.integer({ min: 1, max: 100_000 }),
      fc
        .double({ min: 1.01, max: 1000, noNaN: true, noDefaultInfinity: true })
        .map((o) => Math.round(o * 100) / 100),
      (side, stake, odds) => {
        const liab = calculateLiability(side, stake, odds);
        const prof = calculateProfit(side, stake, odds);
        if (side === "lay") {
          expect(liab).toBeCloseTo(stake * (odds - 1), 2);
          expect(prof).toBe(stake);
        } else {
          expect(liab).toBe(0);
          expect(prof).toBeCloseTo(stake * (odds - 1), 2);
        }
      }
    ),
    { numRuns: 100 }
  );
});

test("Property 6: UTR validation rejects strings less than 12 digits", () => {
  // Generate digit strings of length 0-11 (excluding 12)
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 11 }).chain(len => 
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: len, maxLength: len })
      ).map((arr) => arr.join("")),
      (digits) => {
        expect(validateUTR(digits)).toBe(false);
      }
    ),
    { numRuns: 100 }
  );

  // Also ensure exactly 12 digits passes
  fc.assert(
    fc.property(
      fc.array(fc.integer({ min: 0, max: 9 }), {
        minLength: 12,
        maxLength: 12,
      }).map(arr => arr.join("")),
      (digits) => {
        expect(validateUTR(digits)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});

test("Property 7: OrderBook sort invariant", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          price: fc
            .double({ min: 1.01, max: 1000, noNaN: true, noDefaultInfinity: true })
            .map((p) => p.toFixed(2)),
          size: fc.integer({ min: 0, max: 1_000_000 }),
        })
      ),
      fc.array(
        fc.record({
          price: fc
            .double({ min: 1.01, max: 1000, noNaN: true, noDefaultInfinity: true })
            .map((p) => p.toFixed(2)),
          size: fc.integer({ min: 0, max: 1_000_000 }),
        })
      ),
      (backs, lays) => {
        const { backs: sortedBacks, lays: sortedLays } =
          sortOrderBook(backs, lays);
        // backs descending
        for (let i = 1; i < sortedBacks.length; i++) {
          expect(parseFloat(sortedBacks[i].price)).toBeLessThanOrEqual(
            parseFloat(sortedBacks[i - 1].price)
          );
        }
        // lays ascending
        for (let i = 1; i < sortedLays.length; i++) {
          expect(parseFloat(sortedLays[i].price)).toBeGreaterThanOrEqual(
            parseFloat(sortedLays[i - 1].price)
          );
        }
      }
    ),
    { numRuns: 100 }
  );
});
