import { describe, it, expect } from "vitest";
import { calculateLiability, calculateProfit, validateUTR, sortOrderBook, type PriceLevel } from "@/lib/bet-calculations";

describe("calculateLiability", () => {
  it("returns 0 for back side", () => {
    expect(calculateLiability("back", 100, 2.0)).toBe(0);
  });

  it("calculates liability correctly for lay side", () => {
    expect(calculateLiability("lay", 100, 2.0)).toBe(100);
    expect(calculateLiability("lay", 500, 1.5)).toBe(250);
    expect(calculateLiability("lay", 1000, 3.5)).toBe(2500);
  });
});

describe("calculateProfit", () => {
  it("returns stake for lay side", () => {
    expect(calculateProfit("lay", 100, 2.0)).toBe(100);
  });

  it("calculates profit correctly for back side", () => {
    expect(calculateProfit("back", 100, 2.0)).toBe(100);
    expect(calculateProfit("back", 100, 1.5)).toBe(50);
  });
});

describe("validateUTR", () => {
  it("returns false for empty string", () => {
    expect(validateUTR("")).toBe(false);
  });

  it("returns false for 10 digits", () => {
    expect(validateUTR("1234567890")).toBe(false);
  });

  it("returns false for 13 digits", () => {
    expect(validateUTR("1234567890123")).toBe(false);
  });

  it("returns false for letters", () => {
    expect(validateUTR("abcdefghijkl")).toBe(false);
  });

  it("returns true for valid 12-digit UTR", () => {
    expect(validateUTR("123456789012")).toBe(true);
  });

  it("returns true for valid 12-digit string with zeros", () => {
    expect(validateUTR("000000000000")).toBe(true);
  });
});

describe("sortOrderBook", () => {
  it("sorts backs in descending order by price", () => {
    const backs: PriceLevel[] = [
      { price: "2.0", size: 100 },
      { price: "2.2", size: 200 },
      { price: "1.9", size: 50 },
    ];
    const lays: PriceLevel[] = [];
    const result = sortOrderBook(backs, lays);
    expect(result.backs.map((p) => p.price)).toEqual(["2.2", "2.0", "1.9"]);
  });

  it("sorts lays in ascending order by price", () => {
    const backs: PriceLevel[] = [];
    const lays: PriceLevel[] = [
      { price: "1.8", size: 300 },
      { price: "2.1", size: 150 },
      { price: "1.9", size: 400 },
    ];
    const result = sortOrderBook(backs, lays);
    expect(result.lays.map((p) => p.price)).toEqual(["1.8", "1.9", "2.1"]);
  });

  it("does not mutate the original arrays", () => {
    const originalBacks: PriceLevel[] = [
      { price: "2.0", size: 100 },
      { price: "2.2", size: 200 },
    ];
    const originalLays: PriceLevel[] = [
      { price: "1.8", size: 300 },
      { price: "2.1", size: 150 },
    ];

    const backsCopy = [...originalBacks];
    const laysCopy = [...originalLays];

    sortOrderBook(originalBacks, originalLays);

    expect(originalBacks).toEqual(backsCopy);
    expect(originalLays).toEqual(laysCopy);
  });

  it("sorts correctly with string numbers as prices", () => {
    const backs: PriceLevel[] = [
      { price: "10.5", size: 100 },
      { price: "2.2", size: 200 },
      { price: "100.1", size: 50 },
    ];
    const lays: PriceLevel[] = [
      { price: "1.5", size: 300 },
      { price: "20.0", size: 150 },
    ];

    const result = sortOrderBook(backs, lays);

    expect(result.backs.map((p) => p.price)).toEqual(["100.1", "10.5", "2.2"]);
    expect(result.lays.map((p) => p.price)).toEqual(["1.5", "20.0"]);
  });
});
