import {
  Bell,
  CircleDollarSign,
  Sparkles,
} from "lucide-react";

import { HomeHero } from "@/components/dashboard/home-hero";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { GamificationPanel } from "@/components/dashboard/gamification-panel";
import { StickyActionBar } from "@/components/dashboard/sticky-action-bar";
import { DailyRewardClaim } from "@/components/dashboard/daily-reward";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMainDashboardData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let data: Awaited<ReturnType<typeof getMainDashboardData>> | null = null;
  let error: string | null = null;

  try {
    console.log("HomePage: Starting data fetch");
    data = await getMainDashboardData();
    console.log("HomePage: Data fetch successful", {
      hasSession: !!data?.session,
      profileCount: data?.profile ? 1 : 0,
      transactionsCount: data?.transactions?.length || 0,
      notificationsCount: data?.notifications?.length || 0,
    });
  } catch (err) {
    console.error("Home page data fetch error:", err);
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-3xl font-black text-red-400">
          System Error
        </h1>
        <p className="text-gray-400 max-w-md">
          There was an error loading the dashboard. Please try again later.
        </p>
        <div className="text-xs text-gray-500 bg-gray-800 p-4 rounded max-w-lg">
          <strong>Error:</strong> {error}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!data?.session) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-3xl font-black">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            JMD Online Book
          </span>
        </h1>
        <p className="text-gray-400 max-w-md">
          Sign in to access your wallet, games, and transactions.
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all"
          >
            Create Account
          </a>
        </div>
      </div>
    );
  }

  const notifications = data.notifications ?? [];
  const transactions = data.transactions ?? [];
  const commissions = data.commissions ?? [];

  // Safe calculations with fallbacks
  let unreadNotifications = 0;
  let pendingTransactions = 0;
  let chartData: Array<{ day: string; balance: number }> = [];
  let todayProfit = 0;
  let level = 1;
  let xp = 0;
  let xpToNext = 5;
  let totalWins = 0;
  let referralEarnings = 0;

  try {
    unreadNotifications = notifications.filter((item) => !item.is_read).length;
    pendingTransactions = transactions.filter((item) => item.status === "pending").length;

    // Build chart data from transactions
    chartData = transactions
      .filter((t) => t.status === "approved")
      .slice(0, 7)
      .reverse()
      .map((t, i) => ({
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] ?? `Day ${i + 1}`,
        balance: Math.abs(Number(t.amount) || 0),
      }));

    // Calculate today's profit/loss
    const todayTransactions = transactions.filter((t) => {
      if (!t.created_at) return false;
      try {
        const today = new Date().toDateString();
        return new Date(t.created_at).toDateString() === today;
      } catch {
        return false;
      }
    });
    todayProfit = todayTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0;
      if (t.type === "deposit" || t.type === "commission") return sum + amount;
      if (t.type === "withdraw" || t.type === "bet") return sum - amount;
      return sum;
    }, 0);

    // Calculate level/XP from balance and activity
    const totalActivity = transactions.length;
    level = Math.floor(totalActivity / 5) + 1;
    xp = totalActivity % 5;
    xpToNext = 5;
    totalWins = transactions.filter((t) => t.status === "approved" && (t.type === "commission" || t.type === "deposit")).length;
    referralEarnings = commissions.reduce((total, item) => total + (Number(item.amount) || 0), 0);

    console.log("HomePage: Calculations completed", {
      unreadNotifications,
      pendingTransactions,
      chartDataLength: chartData.length,
      todayProfit,
      level,
      xp,
      totalWins,
      referralEarnings,
    });
  } catch (calcError) {
    console.error("HomePage: Calculation error:", calcError);
    error = `Calculation error: ${calcError instanceof Error ? calcError.message : "Unknown calculation error"}`;
  }

  return (
    <div className="space-y-6">
      <HomeHero balance={Number(data.profile?.balance ?? 0)} />

      {/* Daily Reward */}
      <DailyRewardClaim />

      {/* Chart */}
      <BalanceChart data={chartData} />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Pending requests"
          value={String(pendingTransactions)}
          hint="Transactions waiting for approval"
          icon={CircleDollarSign}
        />
        <StatCard
          label="Unread notifications"
          value={String(unreadNotifications)}
          hint="New updates from admin and wallet events"
          icon={Bell}
        />
        <StatCard
          label="Referral commission"
          value={formatCurrency(referralEarnings)}
          hint="Direct and second-level earnings"
          icon={Sparkles}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Transactions */}
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Recent activity"
            title="Latest transactions"
            subtitle="Keep track of every balance move and approval stage."
          />
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No transactions yet. Make your first deposit to get started!</p>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-3xl border border-white/6 bg-white/4 px-4 py-3 active:scale-[0.99] transition-transform"
                >
                  <div>
                    <p className="font-semibold capitalize text-white">{transaction.type}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{transaction.status}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === "deposit" || transaction.type === "commission"
                        ? "text-emerald-400"
                        : "text-amber-200"
                    }`}>
                      {transaction.type === "deposit" || transaction.type === "commission" ? "+" : ""}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: Gamification */}
        <div className="space-y-4">
          <GamificationPanel
            streak={7}
            level={level}
            xp={xp}
            xpToNext={xpToNext}
            todayProfit={todayProfit}
            totalWins={totalWins}
          />

          {/* Games Preview */}
          <Card className="space-y-4">
            <SectionHeading
              eyebrow="Featured"
              title="Hot games"
              subtitle="Tap to play"
            />
            <div className="space-y-3">
              {data.games.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No games available yet</p>
              ) : (
                data.games.slice(0, 4).map((game) => (
                  <div
                    key={game.id}
                    className="rounded-3xl border border-white/6 bg-white/4 p-4 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{game.name}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">{game.provider}</p>
                      </div>
                      <Badge tone={game.is_hot ? "warning" : "neutral"}>
                        {game.is_hot ? "🔥 Hot" : game.category}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky mobile action bar */}
      <StickyActionBar />
    </div>
  );
}
