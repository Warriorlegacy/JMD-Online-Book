import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminDashboardData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function AdminUsersPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin users"
        title="Player directory"
        subtitle="Roles, referral status, and current balances."
      />
      <div className="space-y-4">
        {data.users.map((user) => (
          <Card key={user.id} className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Player</p>
              <p className="mt-1 font-semibold text-white">{user.full_name ?? user.email}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Role</p>
              <p className="mt-1 font-semibold capitalize text-white">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Referral code</p>
              <p className="mt-1 font-semibold text-white">{user.referral_code ?? "NA"}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Balance</p>
              <p className="mt-1 font-semibold text-white">
                {formatCurrency(Number(user.balance ?? 0))}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
