import { createAdminClient } from "@/lib/supabase/admin";
import { addNotification } from "@/lib/repo";

/**
 * Process bet settlement and trigger gamification hooks
 * Call this after every bet is settled
 */
export async function processBetSettlement(betId: string, userId: string, result: 'win' | 'lose' | 'draw', amount: number, _payout: number) {
  const supabase = createAdminClient();

  if (result === 'lose') {
    // Process loss recovery cashback
    await supabase.rpc("process_loss_cashback", {
      p_user_id: userId,
      p_loss_amount: amount,
    });
  }

  // Check for near win events (for lost bets that were very close)
  // This would typically be called from game engine with proximity score
  // This is a placeholder hook point
}

/**
 * Record near win event with proximity score
 * @param proximity 0.0 = no chance, 1.0 = almost won
 */
export async function recordNearWin(betId: string, proximity: number) {
  const supabase = createAdminClient();

  const { data: result } = await supabase.rpc("record_near_win", {
    p_bet_id: betId,
    p_proximity: proximity,
  });

  if (result?.success && proximity >= 0.75) {
    const { data: bet } = await supabase.from("bets").select("user_id, amount").eq("id", betId).single();

    if (bet) {
      await addNotification({
        user_id: bet.user_id,
        title: proximity >= 0.9 ? "That was SO close! 😮" : "Almost had it!",
        body: proximity >= 0.9
          ? `You were milliseconds away from winning ₹${Math.round(bet.amount * 8)}! Next time it's yours!`
          : "Keep playing, your luck is about to turn around!",
        type: "warning",
        metadata: { bet_id: betId, proximity },
      });
    }
  }

  return result;
}

/**
 * Send friend win notifications to all followers
 */
export async function notifyFriendWin(userId: string, winAmount: number, gameName: string) {
  const supabase = createAdminClient();

  const { data: followers } = await supabase
    .from("user_friends")
    .select("user_id")
    .eq("friend_id", userId)
    .eq("notifications_enabled", true);

  if (!followers?.length) return;

  const { data: winner } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  for (const follower of followers) {
    await addNotification({
      user_id: follower.user_id,
      title: `${winner?.full_name || "Your friend"} won big! 🎉`,
      body: `They just won ₹${winAmount} on ${gameName}! Go join them!`,
      type: "win",
      metadata: {
        is_friend_win: true,
        friend_id: userId,
        friend_name: winner?.full_name,
        win_amount: winAmount,
        game_name: gameName,
      },
    });
  }
}

/**
 * Get user streak information
 */
export async function getUserStreak(userId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

/**
 * Get available cashbacks for user
 */
export async function getUserCashbacks(userId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("loss_recovery")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

/**
 * Get daily rewards configuration
 */
export async function getDailyRewardsConfig() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("daily_rewards")
    .select("*")
    .eq("is_active", true)
    .order("day_number");

  return data ?? [];
}

/**
 * Get streak tiers configuration
 */
export async function getStreakTiers() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("streak_tiers")
    .select("*")
    .eq("is_active", true)
    .order("streak_days");

  return data ?? [];
}
