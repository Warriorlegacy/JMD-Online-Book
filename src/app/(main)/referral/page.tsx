import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getReferralTree } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function ReferralPage() {
  const session = await getSession();
  const tree = session ? await getReferralTree(session) : null;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Referral"
        title="Two-level commission tree"
        subtitle="Direct players and second-level referrals roll up into the same commission feed."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Referral code</p>
          <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {tree?.profile.referral_code ?? "LOCKED"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Direct referrals</p>
          <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {tree?.directReferrals.length ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-text-muted)]">Commission earned</p>
          <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {formatCurrency(
              tree?.commissions.reduce((total, item) => total + Number(item.amount ?? 0), 0) ?? 0,
            )}
          </p>
        </Card>
      </div>
      <Card className="space-y-4">
        <p className="font-semibold text-white">Direct referrals</p>
        <div className="space-y-3">
          {(tree?.directReferrals ?? []).map((profile) => (
            <div key={profile.id} className="rounded-3xl border border-white/6 bg-white/4 p-4">
              <p className="font-semibold text-white">{profile.full_name ?? profile.email}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{profile.email}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
