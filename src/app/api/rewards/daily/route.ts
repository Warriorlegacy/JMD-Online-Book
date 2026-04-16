import { ok, fail } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getProfile, addNotification, addTransaction, upsertProfile } from "@/lib/repo";
import { applyBalanceDelta } from "@/lib/wallet";

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getProfile(session.id);
    if (!profile) return fail("Profile not found");

    const lastLogin = profile.last_login_at ? new Date(profile.last_login_at) : null;
    const now = new Date();
    const canClaim = !lastLogin || lastLogin.toDateString() !== now.toDateString();

    return ok({ canClaim, lastLogin: lastLogin?.toISOString() ?? null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to check daily reward", 500);
  }
}

export async function POST() {
  try {
    const session = await requireSession();
    const profile = await getProfile(session.id);
    if (!profile) return fail("Profile not found");

    const lastLogin = profile.last_login_at ? new Date(profile.last_login_at) : null;
    const now = new Date();

    if (lastLogin && lastLogin.toDateString() === now.toDateString()) {
      return fail("Already claimed today", 409);
    }

    const reward = 10;
    const result = await applyBalanceDelta({
      userId: session.id,
      amount: reward,
      type: "bonus",
    });

    if (!result.success) {
      return fail(result.error ?? "Failed to add reward");
    }

    await addTransaction({
      user_id: session.id,
      type: "bonus",
      amount: reward,
      status: "completed",
      balance_before: result.previous,
      balance_after: result.balance,
    });

    await addNotification({
      user_id: session.id,
      title: "Daily Reward Claimed!",
      body: `You earned ₹${reward} for logging in today.`,
      type: "success",
    });

    await upsertProfile({ id: session.id, last_login_at: now.toISOString() });

    return ok({ reward, balance: result.balance });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to claim daily reward", 500);
  }
}



