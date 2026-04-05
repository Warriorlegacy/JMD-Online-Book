import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMainDashboardData } from "@/lib/data";

export default async function ProfilePage() {
  const data = await getMainDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile"
        title="Account identity"
        subtitle="KYC-light contact and payout details pulled from the live profile record."
      />
      <Card className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Full name</p>
          <p className="mt-1 font-semibold text-white">{data.profile?.full_name ?? "User"}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Email</p>
          <p className="mt-1 font-semibold text-white">{data.profile?.email ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Phone</p>
          <p className="mt-1 font-semibold text-white">{data.profile?.phone ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Role</p>
          <p className="mt-1 font-semibold capitalize text-white">{data.profile?.role ?? "user"}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">UPI ID</p>
          <p className="mt-1 font-semibold text-white">{data.profile?.upi_id ?? "Not set"}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">Bank account</p>
          <p className="mt-1 font-semibold text-white">{data.profile?.bank_account ?? "Not set"}</p>
        </div>
      </Card>
    </div>
  );
}
