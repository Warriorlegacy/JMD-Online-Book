"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBetSlip } from "@/context/bet-slip-context";
import { useSocket } from "@/context/socket-context";
import { Match, PriceLevel } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Search,
  Star,
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────
const SPORT_SIDEBAR = [
  { id: "favorites",  label: "Favorites",  icon: <Star className="w-4 h-4" /> },
  { id: "football",   label: "Soccer",     icon: "⚽" },
  { id: "basketball", label: "Basketball", icon: "🏀" },
  { id: "tennis",     label: "Tennis",     icon: "🎾" },
  { id: "esports",    label: "Esports",    icon: "🎮" },
  { id: "cricket",    label: "Cricket",    icon: "🏏" },
];

const TOP_LEAGUES = [
  { id: "pl",      label: "Premier League",    count: 34, icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "ucl",     label: "Champions League",  count: 8,  icon: "⭐" },
  { id: "nba",     label: "NBA",               count: 5,  icon: "🏀" },
];

const DEMO_LIVE = [
  {
    id: "live-1",    league: "PREMIER LEAGUE", time: "72'", teamA: "Arsenal",   teamB: "Liverpool",
    scoreA: 2, scoreB: 1, status: "in_play" as const, live: true,
    oddsA: 1.85, oddsD: 3.20, oddsB: 4.15,
    extraLabel: "LIVE STREAM AVAILABLE",
  },
  {
    id: "live-2",    league: "NBA", time: "Q3 04:12", teamA: "Lakers",    teamB: "Celtics",
    scoreA: 94, scoreB: 88, status: "in_play" as const, live: true,
    oddsA: 1.91, oddsD: null, oddsB: 2.10,
    extraLabel: null,
  },
];

const DEMO_TOP: Array<{
  id: string; time: string; day: string; teamA: string; teamB: string;
  league: string; venue: string; liveMin?: number;
  oddsA: number; oddsD: number; oddsB: number;
  o25: number; u25: number; hcA: string; hcB: string;
}> = [
  { id: "m1", time: "20:00", day: "TODAY", teamA: "Man City", teamB: "Tottenham",
    league: "PREMIER LEAGUE", venue: "ETIHAD STADIUM",
    oddsA: 1.42, oddsD: 4.50, oddsB: 6.80, o25: 1.65, u25: 2.10, hcA: "2.05", hcB: "1.82" },
  { id: "m2", time: "20:45", day: "TODAY", teamA: "AC Milan",  teamB: "Juventus",
    league: "SERIE A", venue: "SAN SIRO",
    oddsA: 2.25, oddsD: 3.10, oddsB: 3.40, o25: 2.00, u25: 1.75, hcA: "2.25", hcB: "1.65" },
  { id: "m3", time: "LIVE",  day: "68'",  teamA: "Bayern",   teamB: "Dortmund",
    league: "BUNDESLIGA", venue: "", liveMin: 68,
    oddsA: 1.22, oddsD: 4.10, oddsB: 12.0, o25: 1.55, u25: 2.30, hcA: "—", hcB: "—" },
];

const POPULAR = [
  { rank: 1, label: "Arsenal to Win", odds: 1.85 },
  { rank: 2, label: "Lakers ML",      odds: 1.45 },
];

const MARKET_TABS = ["MAIN MARKETS", "GOALS", "CORNERS"] as const;

function OddsBtn({ value, onClick, blue }: { value: number | string; onClick?: () => void; blue?: boolean }) {
  if (value === "—") {
    return (
      <div className="flex items-center justify-center w-14 h-9 rounded-lg bg-[#0d1120] border border-white/5">
        <Lock className="w-3 h-3 text-white/20" />
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`w-14 h-9 rounded-lg text-sm font-black transition-all active:scale-95 hover:brightness-110 ${
        blue
          ? "bg-[#0071e3]/15 border border-[#0071e3]/30 text-[#0071e3]"
          : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
      }`}
    >
      {value}
    </button>
  );
}

function LiveMatchCard({ m }: { m: typeof DEMO_LIVE[0] }) {
  return (
    <div className="relative flex-shrink-0 w-72 glass-card rounded-2xl border border-white/5 p-5 overflow-hidden">
      {/* League badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-2 py-1 rounded-lg bg-[#0071e3]/15 border border-[#0071e3]/20 text-[#0071e3] text-[8px] font-black uppercase tracking-widest">
          {m.league} • {m.time}
        </span>
        {m.extraLabel && (
          <span className="text-[8px] text-emerald-400 font-bold uppercase">{m.extraLabel}</span>
        )}
      </div>

      {/* Score */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex-1 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
            {m.teamA === "Arsenal" ? "🔴" : m.teamA === "Lakers" ? "🟡" : "🔵"}
          </div>
          <p className="text-white font-black text-sm uppercase">{m.teamA}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-white">{m.scoreA}</span>
            <span className="text-white/30 font-bold">-</span>
            <span className="text-3xl font-black text-white">{m.scoreB}</span>
          </div>
          <div className="mt-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black animate-pulse">
              LIVE
            </span>
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
            {m.teamB === "Liverpool" ? "🔴" : "🟢"}
          </div>
          <p className="text-white font-black text-sm uppercase">{m.teamB}</p>
        </div>
      </div>

      {/* Quick odds */}
      <div className={`grid gap-2 ${m.oddsD ? "grid-cols-3" : "grid-cols-2"}`}>
        <button className="py-2 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] font-black text-sm">
          {m.oddsA}
        </button>
        {m.oddsD && (
          <button className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black text-sm">
            {m.oddsD}
          </button>
        )}
        <button className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black text-sm">
          {m.oddsB}
        </button>
      </div>
    </div>
  );
}

function normalizeMatch(m: any): Match {
  return {
    id: m.id,
    tournamentId: m.tournamentId || m.tournament_id || "",
    tournamentName: m.tournamentName || m.tournament_name || "",
    teamA: m.teamA || m.team_a || "Team A",
    teamB: m.teamB || m.team_b || "Team B",
    startTime: m.startTime || m.start_time || new Date().toISOString(),
    status: m.status,
    sportType: m.sportType || m.sport_type || "other",
    score: m.score,
    elapsedMinutes: m.elapsedMinutes || m.elapsed_minutes,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SportsPage() {
  const { setSelection } = useBetSlip();
  const { connected, subscribe, on } = useSocket();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSport, setActiveSport] = useState("football");
  const [activeMarketTab, setActiveMarketTab] = useState<typeof MARKET_TABS[number]>("MAIN MARKETS");

  const [betSlipItems, setBetSlipItems] = useState<Array<{ label: string; sub: string; odds: number }>>([
    { label: "Arsenal", sub: "Arsenal vs Liverpool", odds: 1.85 },
    { label: "Over 2.5", sub: "Man City vs Tottenham", odds: 1.65 },
  ]);
  const [stake, setStake] = useState("100");
  const [liveSlide, setLiveSlide] = useState(0);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setMatches(data.map(normalizeMatch));
          else if (data && "id" in data) setMatches([normalizeMatch(data)]);
        }
      } catch { /* silent */ } finally { setLoading(false); }
    }
    fetchMatches();
    const iv = setInterval(fetchMatches, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!connected) return;
    matches.forEach(m => subscribe(m.id));
  }, [connected, matches, subscribe]);

  useEffect(() => {
    if (!connected) return;
    const unsub = on<{ room: string; snapshot: { backs: [string, number][]; lays: [string, number][] } }>(
      "orderbook_update",
      () => {
      }
    );
    return () => unsub();
  }, [connected, on]);

  const totalOdds = betSlipItems.reduce((acc, s) => acc * s.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const potentialReturn = (stakeNum * totalOdds).toFixed(2);

  const quickSelect = (teamA: string, teamB: string, matchId: string, label: string, odds: number, side: "back" | "lay" = "back") => {
    setSelection({ matchId, matchName: `${teamA} v ${teamB}`, marketName: "Match Odds", selectionId: label.toLowerCase().replace(/ /g, "_"), selectionName: label, odds, side });
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 flex">
      {/* ── Left Sidebar ──────────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1120] min-h-screen">
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">SPORTS HUB</p>
          <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">LIVE & UPCOMING</p>
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {SPORT_SIDEBAR.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSport(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeSport === s.id
                  ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{typeof s.icon === "string" ? s.icon : s.icon}</span>
              {s.label}
            </button>
          ))}

          {/* Top Leagues */}
          <div className="pt-5 pb-2">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest px-3 mb-3">TOP LEAGUES</p>
            {TOP_LEAGUES.map(l => (
              <button
                key={l.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <span className="text-base">{l.icon}</span>
                <span className="flex-1 text-left truncate">{l.label}</span>
                <span className="text-[9px] font-black text-white/20 bg-white/5 rounded-full px-1.5 py-0.5">{l.count}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-white/5">
          <button className="w-full py-2.5 rounded-xl border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:border-white/20 hover:text-white/60 transition-all">
            VIEW ALL SPORTS
          </button>
        </div>
      </div>

      {/* ── Main Column ───────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top search bar (full-width within main) */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#0d1120]/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-1 max-w-sm px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/30">
            <Search className="w-4 h-4 flex-shrink-0" />
            <input className="bg-transparent flex-1 text-sm text-white placeholder:text-white/30 outline-none" placeholder="Search sports or leagues" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* ── LIVE NOW ─────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-lg font-black text-white uppercase tracking-wide">LIVE NOW</h2>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setLiveSlide(Math.max(0, liveSlide - 1))}
                  className="p-2 glass-card rounded-xl border border-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLiveSlide(Math.min(DEMO_LIVE.length - 1, liveSlide + 1))}
                  className="p-2 glass-card rounded-xl border border-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {DEMO_LIVE.map(m => <LiveMatchCard key={m.id} m={m} />)}
            </div>
          </div>

          {/* ── TOP MATCHES ──────────────────────────── */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-black text-white italic">TOP MATCHES</h2>
              <div className="flex gap-1 ml-auto">
                {MARKET_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveMarketTab(tab)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      activeMarketTab === tab
                        ? "bg-[#0071e3] text-white"
                        : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[180px_1fr_1fr_1fr] gap-2 px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 mb-1">
              <span>EVENT DETAIL</span>
              <span className="text-center">MATCH RESULT (1X2)</span>
              <span className="text-center">TOTAL GOALS</span>
              <span className="text-center">HANDICAP</span>
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-[#0071e3] animate-spin" />
                </div>
              ) : (
                <>
                  {/* Real matches from API */}
                  {matches.filter(m => m.status === "in_play" || m.status === "scheduled").slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      className={`grid grid-cols-[180px_1fr_1fr_1fr] gap-2 items-center px-4 py-3.5 rounded-2xl border transition-colors cursor-pointer hover:bg-white/3 ${
                        m.status === "in_play" ? "border-emerald-500/20 bg-emerald-500/3" : "border-white/5 bg-[#0d1120]"
                      }`}
                    >
                      <div>
                        {m.status === "in_play" && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-400 uppercase">
                              {m.elapsedMinutes ? `${m.elapsedMinutes}'` : "LIVE"}
                            </span>
                          </div>
                        )}
                        {m.status !== "in_play" && (
                          <div className="text-[9px] font-black text-white/30 mb-0.5">20:00</div>
                        )}
                        <Link href={`/match/${m.id}`} className="text-sm font-black text-white hover:text-[#0071e3] transition-colors">
                          {m.teamA} vs {m.teamB}
                        </Link>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest mt-0.5">{m.tournamentName}</p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <OddsBtn value="1.42" onClick={() => quickSelect(m.teamA, m.teamB, m.id, m.teamA, 1.42)} blue />
                        <OddsBtn value="4.50" onClick={() => quickSelect(m.teamA, m.teamB, m.id, "Draw", 4.50)} />
                        <OddsBtn value="6.80" onClick={() => quickSelect(m.teamA, m.teamB, m.id, m.teamB, 6.80)} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <OddsBtn value="1.65" onClick={() => quickSelect(m.teamA, m.teamB, m.id, "Over 2.5", 1.65)} />
                        <OddsBtn value="2.10" onClick={() => quickSelect(m.teamA, m.teamB, m.id, "Under 2.5", 2.10)} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <OddsBtn value="2.05" />
                        <OddsBtn value="1.82" />
                      </div>
                    </div>
                  ))}

                  {/* Demo matches (always visible as padding) */}
                  {DEMO_TOP.map(m => (
                    <div
                      key={m.id}
                      className={`grid grid-cols-[180px_1fr_1fr_1fr] gap-2 items-center px-4 py-3.5 rounded-2xl border transition-colors hover:bg-white/3 ${
                        m.liveMin ? "border-emerald-500/20 bg-emerald-500/3" : "border-white/5 bg-[#0d1120]"
                      }`}
                    >
                      <div>
                        {m.liveMin ? (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-400 uppercase">{m.liveMin}' LIVE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-white/50">{m.time}</span>
                            <span className="text-[8px] text-white/20 uppercase">{m.day}</span>
                          </div>
                        )}
                        <p className="text-sm font-black text-white">{m.teamA} vs {m.teamB}</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-widest mt-0.5">{m.league}{m.venue ? ` • ${m.venue}` : ""}</p>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <OddsBtn value={m.oddsA} blue />
                        <OddsBtn value={m.oddsD} />
                        <OddsBtn value={m.oddsB} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <OddsBtn value={m.o25} blue />
                        <OddsBtn value={m.u25} />
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <OddsBtn value={m.hcA} />
                        <OddsBtn value={m.hcB} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Bet Slip ────────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-l border-white/5 bg-[#0d1120] min-h-screen">
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">BET SLIP</h3>
          </div>
          <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white text-[9px] font-black flex items-center justify-center">
            {betSlipItems.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {betSlipItems.map((item, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl border border-white/5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">MATCH RESULT</p>
                  <p className="text-white font-black text-sm mt-0.5">{item.label}</p>
                  <p className="text-white/40 text-[10px]">{item.sub}</p>
                </div>
                <button onClick={() => setBetSlipItems(prev => prev.filter((_, j) => j !== i))} className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none">×</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#0071e3]">{item.odds}</span>
                {i === 0 && (
                  <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase flex items-center gap-1">
                    ⚡ ODDS BOOSTED
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Stake */}
          <div className="glass-card p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">STAKE AMOUNT</p>
              <span className="text-[8px] text-white/30 font-bold">$</span>
            </div>
            <input
              type="number"
              value={stake}
              onChange={e => setStake(e.target.value)}
              className="w-full bg-transparent text-3xl font-black text-white outline-none"
            />
          </div>

          <div className="px-1 space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase">
              <span>TOTAL ODDS</span>
              <span className="text-white">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase">
              <span>POTENTIAL RETURN</span>
              <span className="text-emerald-400 font-black text-sm">${potentialReturn}</span>
            </div>
          </div>

          <button className="w-full py-4 rounded-2xl bg-[#AFFF00] text-black font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">
            PLACE BET
          </button>
        </div>

        {/* My active bets */}
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex justify-between mb-3">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">MY ACTIVE BETS</p>
            <button className="text-[8px] text-[#0071e3] font-black hover:underline">SEE ALL</button>
          </div>
          <div className="glass-card p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-white/60">6-FOLD ACCA</span>
              <span className="text-[8px] font-black text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">LIVE</span>
            </div>
            <p className="text-[8px] text-white/30 mb-2">3/6 LEGS WON</p>
            <button className="w-full py-1.5 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] text-[9px] font-black hover:bg-[#0071e3]/20 transition-all">
              CASH OUT $42.50
            </button>
          </div>
        </div>

        {/* Popular */}
        <div className="border-t border-white/5 px-4 py-4">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">POPULAR TODAY</p>
          <div className="space-y-2">
            {POPULAR.map(p => (
              <div key={p.rank} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-white/5 text-white/30 text-[9px] font-black flex items-center justify-center">{p.rank}</span>
                <span className="flex-1 text-[10px] font-bold text-white/60">{p.label}</span>
                <span className="text-[#0071e3] font-black text-sm">{p.odds}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
