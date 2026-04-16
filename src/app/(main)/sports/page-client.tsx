"use client";

import { useState, useEffect, useCallback } from "react";
import { OddsTable } from "@/components/OddsTable";
import { BetSlip } from "@/components/BetSlip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SportEvent, OddsMarket, BetType } from "@/lib/types/betting";

const SPORT_CATEGORIES = ["Cricket", "Football", "Tennis", "Horse Racing", "Kabaddi", "Politics", "Binary", "Other"];

interface SportsPageClientProps {
  initialEvents: SportEvent[];
  initialSport?: string;
}

export function SportsPageClient({ initialEvents, initialSport }: SportsPageClientProps) {
  const [events, setEvents] = useState<SportEvent[]>(initialEvents);
  const [selectedSport, setSelectedSport] = useState(initialSport ?? "");
  const [selectedMarket, setSelectedMarket] = useState<OddsMarket | null>(null);
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const url = selectedSport
        ? `/api/sports/events?sport=${encodeURIComponent(selectedSport)}`
        : "/api/sports/events";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data ?? []);
      }
    } catch { /* silent */ }
  }, [selectedSport]);

  useEffect(() => {
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const liveEvents = events.filter((e) => e.status === "live");
  const upcomingEvents = events.filter((e) => e.status !== "live");

  function handleSelectOdds(market: OddsMarket, betType: BetType) {
    setSelectedMarket(market);
    setSelectedBetType(betType);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-[28px] font-semibold text-white"
          style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
          Sports Betting
        </h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.48)] mt-1">Live odds updated every 30 seconds</p>
      </div>

      {/* Category strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedSport("")}
          className={`flex-shrink-0 rounded-[980px] px-4 py-2 text-[12px] font-medium transition-colors ${
            !selectedSport
              ? "bg-[#0071e3] text-white"
              : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.56)] hover:text-white"
          }`}
        >
          All
        </button>
        {SPORT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedSport(cat.toLowerCase())}
            className={`flex-shrink-0 rounded-[980px] px-4 py-2 text-[12px] font-medium transition-colors ${
              selectedSport === cat.toLowerCase()
                ? "bg-[#0071e3] text-white"
                : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.56)] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Live events */}
      {liveEvents.length > 0 && (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-[#ff453a] uppercase tracking-wider flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff453a] animate-pulse" />
            In-Play
          </p>
          {liveEvents.map((event) => (
            <EventCard key={event.id} event={event} onSelectOdds={handleSelectOdds} />
          ))}
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <p className="text-[12px] font-semibold text-[rgba(255,255,255,0.48)] uppercase tracking-wider">Upcoming</p>
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} onSelectOdds={handleSelectOdds} />
          ))}
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-16 text-[rgba(255,255,255,0.3)]">
          <p className="text-4xl mb-4">🏏</p>
          <p className="text-[17px]">No events available right now</p>
        </div>
      )}

      {/* Bet slip */}
      {selectedMarket && selectedBetType && (
        <BetSlip
          market={selectedMarket}
          betType={selectedBetType}
          onClose={() => { setSelectedMarket(null); setSelectedBetType(null); }}
          onSuccess={fetchEvents}
        />
      )}
    </div>
  );
}

function EventCard({
  event,
  onSelectOdds,
}: {
  event: SportEvent;
  onSelectOdds: (market: OddsMarket, betType: BetType) => void;
}) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {event.status === "live" && <Badge tone="danger">LIVE</Badge>}
            <span className="text-[12px] text-[rgba(255,255,255,0.48)] capitalize">{event.sport}</span>
            {event.league && (
              <span className="text-[12px] text-[rgba(255,255,255,0.3)]">· {event.league}</span>
            )}
          </div>
          <p className="text-[17px] font-semibold text-white">
            {event.home_team} vs {event.away_team}
          </p>
          <p className="text-[12px] text-[rgba(255,255,255,0.48)] mt-0.5">
            {new Date(event.start_time).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
          </p>
        </div>
        {event.is_betting_locked && (
          <span className="text-[12px] text-[#ff453a] bg-[rgba(255,69,58,0.12)] rounded-full px-2 py-0.5">
            Suspended
          </span>
        )}
      </div>

      {event.odds_markets && event.odds_markets.length > 0 && (
        <OddsTable
          markets={event.odds_markets}
          isBettingLocked={event.is_betting_locked}
          onSelectOdds={onSelectOdds}
        />
      )}
    </Card>
  );
}
