import type { CasinoRound } from "@/lib/types/betting";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  waiting:      { label: "WAITING",      color: "rgba(255,255,255,0.48)", bg: "rgba(255,255,255,0.06)" },
  betting_open: { label: "BETTING OPEN", color: "#30d158",                bg: "rgba(48,209,88,0.12)" },
  dealing:      { label: "DEALING",      color: "#2997ff",                bg: "rgba(0,113,227,0.12)" },
  result:       { label: "RESULT",       color: "#2997ff",                bg: "rgba(0,113,227,0.12)" },
  settled:      { label: "SETTLED",      color: "rgba(255,255,255,0.48)", bg: "rgba(255,255,255,0.06)" },
};

interface CasinoRoundStatusProps {
  round: CasinoRound | null;
  history: Array<{ id: string; result: string | null; created_at: string }>;
}

export function CasinoRoundStatus({ round, history }: CasinoRoundStatusProps) {
  const statusInfo = round
    ? (STATUS_LABELS[round.status] ?? STATUS_LABELS.waiting)
    : STATUS_LABELS.waiting;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="rounded-full px-3 py-1 text-[12px] font-bold tracking-wider"
          style={{ background: statusInfo.bg, color: statusInfo.color }}
        >
          {statusInfo.label}
        </span>
        {round?.result && (
          <span className="text-[14px] font-semibold text-white">Result: {round.result}</span>
        )}
      </div>

      {history.length > 0 && (
        <div>
          <p className="text-[12px] text-[rgba(255,255,255,0.48)] uppercase tracking-wider mb-2">
            Last 20 Results
          </p>
          <div className="flex flex-wrap gap-1.5">
            {history.map((h) => (
              <span
                key={h.id}
                className="rounded-lg bg-[rgba(255,255,255,0.06)] px-2 py-1 text-[12px] text-[rgba(255,255,255,0.56)]"
              >
                {h.result ?? "—"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
