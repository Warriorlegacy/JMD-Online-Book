import { created, fail } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { enforceTransactionRateLimit } from "@/lib/rate-limit";
import { addBet, addNotification, addTransaction, getGameById, getProfile } from "@/lib/repo";
import { placeBetSchema } from "@/lib/validators";
import { applyBalanceDelta } from "@/lib/wallet";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = placeBetSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid bet request");
    }

    await enforceTransactionRateLimit(session.id, "bet");

    const game = await getGameById(parsed.data.game_id);
    if (!game || !game.is_active) {
      return fail("Game not found or inactive");
    }

    if (parsed.data.amount < (game.min_bet ?? 10)) {
      return fail(`Minimum bet is ${game.min_bet ?? 10}`);
    }

    if (parsed.data.amount > (game.max_bet ?? 100000)) {
      return fail(`Maximum bet is ${game.max_bet ?? 100000}`);
    }

    const profile = await getProfile(session.id);
    if (!profile) {
      return fail("User profile not found");
    }

    if (Number(profile.balance ?? 0) < parsed.data.amount) {
      return fail("Insufficient balance");
    }

    const balanceResult = await applyBalanceDelta({
      userId: session.id,
      amount: -parsed.data.amount,
      type: "bet",
    });

    if (!balanceResult.success) {
      return fail(balanceResult.error ?? "Balance update failed");
    }

    const bet = await addBet({
      user_id: session.id,
      game_id: parsed.data.game_id,
      amount: parsed.data.amount,
      odds: parsed.data.odds,
      potential_win: parsed.data.amount * parsed.data.odds,
    });

    await addTransaction({
      user_id: session.id,
      type: "bet",
      amount: -parsed.data.amount,
      status: "completed",
      balance_before: balanceResult.previous,
      balance_after: balanceResult.balance,
    });

    await addNotification({
      user_id: session.id,
      title: "Bet placed successfully",
      body: `Your bet of ₹${parsed.data.amount} on ${game.name} has been placed.`,
      type: "info",
    });

    return created(bet);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to place bet", 500);
  }
}