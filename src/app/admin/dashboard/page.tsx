import { ArrowDownCircle, ArrowUpCircle, Landmark, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminDashboardData } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin dashboard"
        title="Operations snapshot"
        subtitle="Realtime wallet operations, user growth, and pending approvals."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={String(data.stats.total_users)}
          hint="Registered players"
          icon={Users}
        />
        <StatCard
          label="Pending deposits"
          value={String(data.stats.pending_deposits)}
          hint="Need approval"
          icon={ArrowDownCircle}
        />
        <StatCard
          label="Pending withdrawals"
          value={String(data.stats.pending_withdrawals)}
          hint="Need review"
          icon={ArrowUpCircle}
        />
        <StatCard
          label="Total wallet exposure"
          value={formatCurrency(Number(data.stats.total_balance))}
          hint="Aggregate player balance"
          icon={Landmark}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <SectionHeading title="Recent users" subtitle="Latest account creations." />
          <div className="space-y-3">
            {data.users.map((user) => (
              <div key={user.id} className="rounded-3xl border border-white/6 bg-white/4 p-4">
                <p className="font-semibold text-white">{user.full_name ?? user.email}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="space-y-4">
            <SectionHeading title="Incoming queue" subtitle="Most recent transaction requests." />
            <div className="space-y-3">
              {data.transactions.slice(0, 8).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-3xl border border-white/6 bg-white/4 p-4"
                >
                  <div>
                    <p className="font-semibold capitalize text-white">{transaction.type}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{transaction.status}</p>
                  </div>
                  <p className="font-semibold text-white">
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <SectionHeading title="Admin activity" subtitle="Recent protected actions and admin sign-ins." />
            <div className="space-y-3">
              {data.adminActivity.length ? (
                data.adminActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-3xl border border-white/6 bg-white/4 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{entry.title}</p>
                      <Badge tone="neutral">{formatDate(entry.created_at)}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">{entry.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Admin activity will appear here after logins and approvals.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
