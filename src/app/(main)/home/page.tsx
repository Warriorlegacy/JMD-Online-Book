import {
  Bell,
  CircleDollarSign,
  Sparkles,
} from "lucide-react";

import { HomeHero } from "@/components/dashboard/home-hero";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMainDashboardData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const data = await getMainDashboardData();
  const unreadNotifications = data.notifications.filter((item) => !item.is_read).length;
  const pendingTransactions = data.transactions.filter((item) => item.status === "pending").length;

  return (
    <div className="space-y-6">
      <HomeHero balance={Number(data.profile?.balance ?? 0)} />

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
          value={formatCurrency(
            data.commissions.reduce((total, item) => total + Number(item.amount ?? 0), 0),
          )}
          hint="Direct and second-level earnings"
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Recent activity"
            title="Latest transactions"
            subtitle="Keep track of every balance move and approval stage."
          />
          <div className="space-y-3">
            {data.transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-3xl border border-white/6 bg-white/4 px-4 py-3"
              >
                <div>
                  <p className="font-semibold capitalize text-white">{transaction.type}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{transaction.status}</p>
                </div>
                <p className="font-semibold text-amber-200">
                  {formatCurrency(Number(transaction.amount))}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading
            eyebrow="Featured lobby"
            title="Hot games"
            subtitle="Fresh catalog entries pulled from the live game list."
          />
          <div className="space-y-3">
            {data.games.slice(0, 4).map((game) => (
              <div key={game.id} className="rounded-3xl border border-white/6 bg-white/4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{game.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{game.provider}</p>
                  </div>
                  <Badge tone={game.is_hot ? "warning" : "neutral"}>
                    {game.is_hot ? "Hot" : game.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
