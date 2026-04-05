import { memo } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export const StatCard = memo(function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        <div className="rounded-2xl bg-amber-400/12 p-2 text-amber-300">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-white">
          {value}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
      </div>
    </Card>
  );
});
