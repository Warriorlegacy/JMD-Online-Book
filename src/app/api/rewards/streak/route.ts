import { ok, fail } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getProfile, addNotification, addTransaction, upsertProfile } from "@/lib/repo";
import { applyBalanceDelta } from "@/lib/wallet";

const STREAK_TIERS = [
  { days: 1, reward: 5 },
  { days: 3, reward: 15 },
  { days: 5, reward: 50 },
  { days: 7, reward: 100 },
  { days: 14, reward: 250 },
  { days: 30, reward: 500 },
];

export async function GET() {
  try {
    const session = await requireSession();
    const profile = await getProfile(session.id);
    if (!profile) return fail("Profile not found");

    const lastLogin = profile.last_login_at ? new Date(profile.last_login_at) : null;
    const now = new Date();
    let streak = 0;

    if (lastLogin) {
      const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak = Math.min(diffDays, 30);
      }
    }

    const nextTier = STREAK_TIERS.find((t) => t.days > streak);

    return ok({ streak, nextTier: nextTier ?? null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to check streak", 500);
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

    let streak = 0;
    if (lastLogin) {
      const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak = diffDays;
      }
    }
    streak += 1;

    const tier = STREAK_TIERS.slice().reverse().find((t) => streak >= t.days);
    const reward = tier?.reward ?? 5;

    const result = await applyBalanceDelta({
      userId: session.id,
      amount: reward,
      type: "bonus",
    });

    if (!result.success) {
      return fail(result.error ?? "Failed to add streak bonus");
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
      title: `🔥 ${streak} Day Streak!`,
      body: `You earned ₹${reward} streak bonus!`,
      type: "success",
    });

    await upsertProfile({ id: session.id, last_login_at: now.toISOString() });

    return ok({ streak, reward, balance: result.balance });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to claim streak bonus", 500);
  }
}



