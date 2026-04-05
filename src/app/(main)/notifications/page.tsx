import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMainDashboardData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage() {
  const data = await getMainDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Notifications"
        title="Live account alerts"
        subtitle="Realtime inserts from the notifications table appear here instantly when available."
      />
      <div className="space-y-4">
        {data.notifications.map((notification) => (
          <Card key={notification.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{notification.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{notification.body}</p>
              </div>
              <Badge tone={notification.is_read ? "neutral" : "warning"}>
                {notification.is_read ? "Read" : "Unread"}
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{formatDate(notification.created_at)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
