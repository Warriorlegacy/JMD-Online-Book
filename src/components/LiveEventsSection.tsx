import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export async function LiveEventsSection() {
  let events: Array<{
    id: string;
    home_team: string;
    away_team: string;
    sport: string;
    status: string;
    start_time: string;
    odds_markets: Array<{ back_odds: number; lay_odds: number; outcome: string }>;
  }> = [];

  try {
    const db = createAdminClient();
    const { data } = await db
      .from("sport_events")
      .select("id, home_team, away_team, sport, status, start_time, odds_markets(back_odds, lay_odds, outcome)")
      .in("status", ["live", "upcoming"])
      .order("status", { ascending: false })
      .order("start_time", { ascending: true })
      .limit(10);
    events = (data ?? []) as typeof events;
  } catch { /* silent */ }

  if (events.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2
        className="text-[17px] font-semibold text-white flex items-center gap-2"
        style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-[#ff453a] animate-pulse" />
        Live &amp; Upcoming
      </h2>
      <div className="space-y-2">
        {events.map((event) => {
          const firstMarket = event.odds_markets?.[0];
          return (
            <Link
              key={event.id}
              href={`/sports/${event.id}`}
              className="flex items-center justify-between rounded-[18px] bg-[#1c1c1e] px-4 py-3 transition-colors hover:bg-[#272729]"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  {event.status === "live" && (
                    <span className="text-[10px] font-bold text-[#ff453a] bg-[rgba(255,69,58,0.15)] rounded-full px-1.5 py-0.5">
                      LIVE
                    </span>
                  )}
                  <span className="text-[12px] text-[rgba(255,255,255,0.48)] capitalize">{event.sport}</span>
                </div>
                <p className="text-[14px] font-semibold text-white">
                  {event.home_team} vs {event.away_team}
                </p>
              </div>
              {firstMarket && (
                <div className="flex gap-2 text-[12px]">
                  <span className="rounded-lg bg-[rgba(0,113,227,0.15)] text-[#2997ff] px-2 py-1 font-semibold">
                    {Number(firstMarket.back_odds).toFixed(2)}
                  </span>
                  <span className="rounded-lg bg-[rgba(255,69,58,0.12)] text-[#ff453a] px-2 py-1 font-semibold">
                    {Number(firstMarket.lay_odds).toFixed(2)}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
