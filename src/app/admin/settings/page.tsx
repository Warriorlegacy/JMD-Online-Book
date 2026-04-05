import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getAdminDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin settings"
        title="Runtime configuration"
        subtitle="Live site settings and payout method definitions from Supabase."
      />
      <Card className="space-y-3">
        {data.siteSettings.map((setting) => (
          <div
            key={setting.key}
            className="flex flex-col justify-between gap-1 rounded-3xl border border-white/6 bg-white/4 p-4 md:flex-row md:items-center"
          >
            <div>
              <p className="font-semibold text-white">{setting.key}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{setting.description}</p>
            </div>
            <p className="text-sm font-semibold text-amber-200">{setting.value}</p>
          </div>
        ))}
      </Card>
      <Card className="space-y-4">
        <SectionHeading
          title="Admin audit trail"
          subtitle="Recent protected actions recorded in the live database."
        />
        <div className="space-y-3">
          {data.adminActivity.length ? (
            data.adminActivity.map((entry) => (
              <div
                key={entry.id}
                className="rounded-3xl border border-white/6 bg-white/4 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{entry.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{entry.body}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              No admin audit entries yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
