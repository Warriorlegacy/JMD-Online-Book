export type PriceLevel = {
  price: string;
  size: number;
};

export function calculateLiability(
  side: "back" | "lay",
  stake: number,
  odds: number
): number {
  if (side === "lay") {
    return stake * (odds - 1);
  }
  return 0;
}

export function calculateProfit(
  side: "back" | "lay",
  stake: number,
  odds: number
): number {
  if (side === "back") {
    return stake * (odds - 1);
  }
  return stake;
}

export function validateUTR(utr: string): boolean {
  return /^\d{12}$/.test(utr);
}

export function sortOrderBook(
  backs: PriceLevel[],
  lays: PriceLevel[]
): { backs: PriceLevel[]; lays: PriceLevel[] } {
  const sortedBacks = [...backs].sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    return priceB - priceA;
  });

  const sortedLays = [...lays].sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    return priceA - priceB;
  });

  return { backs: sortedBacks, lays: sortedLays };
}
