import { subMinutes } from "date-fns";

import { countRecentTransactionsByType } from "@/lib/repo";

export async function enforceTransactionRateLimit(
  userId: string,
  type: "deposit" | "withdraw" | "bet",
) {
  const cutoff = subMinutes(new Date(), 10).toISOString();
  const count = await countRecentTransactionsByType(userId, type, cutoff);

  if (count >= 5) {
    throw new Error(`Too many ${type} requests. Try again shortly.`);
  }
}
