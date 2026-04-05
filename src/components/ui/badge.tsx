import { memo } from "react";
import { cn } from "@/lib/utils";

export const Badge = memo(function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-white/8 text-[var(--color-text-muted)]",
        tone === "success" && "bg-emerald-500/15 text-emerald-300",
        tone === "warning" && "bg-amber-500/15 text-amber-300",
        tone === "danger" && "bg-rose-500/15 text-rose-300",
        className,
      )}
    >
      {children}
    </span>
  );
});
