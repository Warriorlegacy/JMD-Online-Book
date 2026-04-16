"use client";

import type { OddsMarket, BetType } from "@/lib/types/betting";

interface OddsTableProps {
  markets: OddsMarket[];
  isBettingLocked?: boolean;
  onSelectOdds?: (market: OddsMarket, betType: BetType) => void;
}

export function OddsTable({ markets, isBettingLocked, onSelectOdds }: OddsTableProps) {
  const isStale = markets.some((m) => m.is_stale);

  return (
    <div className="relative">
      {isBettingLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] bg-black/60" style={{ backdropFilter: "blur(4px)" }}>
          <span className="rounded-full bg-[rgba(255,69,58,0.15)] border border-[rgba(255,69,58,0.3)] px-4 py-2 text-[12px] font-semibold text-[#ff453a]">
            Betting Suspended
          </span>
        </div>
      )}

      {isStale && (
        <p className="mb-2 text-[12px] text-[rgba(255,255,255,0.48)]">⚠ Odds may be delayed</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-[12px] text-[rgba(255,255,255,0.48)] uppercase tracking-wider">
              <th className="text-left py-2 pr-4">Outcome</th>
              <th className="text-center py-2 px-2 text-[#2997ff]">Back</th>
              <th className="text-center py-2 px-2 text-[#ff453a]">Lay</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market) => {
              const hasOverride = market.override_back_odds !== null || market.override_lay_odds !== null;
              return (
                <tr key={market.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td className="py-2 pr-4 text-white font-medium">
                    {market.outcome}
                    {hasOverride && (
                      <span className="ml-2 text-[10px] rounded-full bg-[rgba(0,113,227,0.15)] text-[#2997ff] px-1.5 py-0.5">
                        Override
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      disabled={!!isBettingLocked}
                      onClick={() => onSelectOdds?.(market, "back")}
                      className="min-w-[56px] rounded-xl bg-[rgba(0,113,227,0.15)] px-3 py-1.5 text-[#2997ff] font-semibold hover:bg-[rgba(0,113,227,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {market.effective_back_odds.toFixed(2)}
                    </button>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      disabled={!!isBettingLocked}
                      onClick={() => onSelectOdds?.(market, "lay")}
                      className="min-w-[56px] rounded-xl bg-[rgba(255,69,58,0.12)] px-3 py-1.5 text-[#ff453a] font-semibold hover:bg-[rgba(255,69,58,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {market.effective_lay_odds.toFixed(2)}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
