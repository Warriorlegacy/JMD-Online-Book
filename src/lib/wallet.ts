import { createAdminClient } from "@/lib/supabase/admin";
import type { TransactionType } from "@/types/database";

export async function applyBalanceDelta(params: {
  userId: string;
  amount: number;
  type: TransactionType | "commission";
}) {
  const supabase = createAdminClient();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.userId)
      .maybeSingle();

    if (profileError) {
      return { success: false, error: profileError.message } as const;
    }

    if (!profile) {
      return { success: false, error: "User not found" } as const;
    }

    const currentBalance = Number(profile.balance ?? 0);
    const newBalance = currentBalance + params.amount;

    if (["withdraw", "bet"].includes(params.type) && newBalance < 0) {
      return { success: false, error: "Insufficient balance" } as const;
    }

    const totalDeposited = Number(profile.total_deposited ?? 0);
    const totalWithdrawn = Number(profile.total_withdrawn ?? 0);
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        balance: newBalance,
        total_deposited:
          params.type === "deposit" ? totalDeposited + Math.abs(params.amount) : totalDeposited,
        total_withdrawn:
          params.type === "withdraw"
            ? totalWithdrawn + Math.abs(params.amount)
            : totalWithdrawn,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.userId)
      .eq("balance", profile.balance ?? 0)
      .select("*")
      .maybeSingle();

    if (updateError) {
      return { success: false, error: updateError.message } as const;
    }

    if (updatedProfile) {
      return {
        success: true,
        balance: Number(updatedProfile.balance ?? 0),
        previous: currentBalance,
      } as const;
    }
  }

  return { success: false, error: "Balance update conflicted. Please retry." } as const;
}

export async function computeDashboardStats() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) {
    throw error;
  }

  const stats = (data ?? {}) as Record<string, number | string | null>;
  return {
    total_users: Number(stats.total_users ?? 0),
    total_agents: Number(stats.total_agents ?? 0),
    today_deposits: Number(stats.today_deposits ?? 0),
    today_withdrawals: Number(stats.today_withdrawals ?? 0),
    pending_deposits: Number(stats.pending_deposits ?? 0),
    pending_withdrawals: Number(stats.pending_withdrawals ?? 0),
    total_balance: Number(stats.total_balance ?? 0),
    new_users_today: Number(stats.new_users_today ?? 0),
  };
}
