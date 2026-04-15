"use client";

import { OddsGrid } from "@/components/odds-grid";
import { BetSlip } from "@/components/bet-slip";
import { MarketChart } from "@/components/market-chart";
import { PriceLadder } from "@/components/price-ladder";
import { useSocket } from "@/lib/socket";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TradeEvent {
  price: number;
  size: number;
}

function TradesTicker() {
  const { on } = useSocket();
  const [recentTrades, setRecentTrades] = useState<TradeEvent[]>([]);

  useEffect(() => {
    const unsubscribe = on<{ events: TradeEvent[] }>("match_events", (data) => {
      setRecentTrades(prev => [data.events[0], ...prev].slice(0, 5));
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [on]);

  if (recentTrades.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center">
         <p className="text-xs text-slate-500 italic">Watching for live matches...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 shadow-2xl">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Matches</h3>
      <div className="space-y-2">
        {recentTrades.map((trade, i) => (
          <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-slate-900/50 animate-in fade-in slide-in-from-right duration-500">
             <div className="flex flex-col">
                <span className="font-bold text-white">₹ {(trade.size / 100).toFixed(0)}</span>
                <span className="text-[9px] text-slate-500">at {trade.price}</span>
             </div>
             <div className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-bold text-[9px]">MATCHED</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Match {
  id: string;
  title?: string;
  team_a: string;
  team_b: string;
  teamA?: string;
  teamB?: string;
  startTime?: string;
  start_time?: string;
  status: string;
}

export default function Home() {
  const { connected } = useSocket();
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveMatch() {
      try {
        const res = await fetch(`/api/matches/active`);
        const data = await res.json();
        if (res.ok && data && !data.error) {
          setActiveMatch(data);
        }
      } catch (err) {
        console.error("Failed to fetch active match:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveMatch();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
      </div>
    );
  }

  if (!activeMatch) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">⚽</div>
          <p className="text-slate-400 text-sm">No active matches right now.</p>
          <p className="text-slate-600 text-xs">Check back soon or create a match via the admin API.</p>
        </div>
      </div>
    );
  }

  const matchId = activeMatch.id;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-32 md:pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900 px-6 py-10 md:px-12 md:py-20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest text-cyan-400">
            {activeMatch ? `${activeMatch.team_a || activeMatch.teamA} v ${activeMatch.team_b || activeMatch.teamB}` : "Demo Match"}
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-yellow-500")}></span>
          </div>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-white">
            The Future of <br />
            <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent leading-tight pb-2">
              Sports Exchange
            </span>
          </h1>
          <p className="text-sm md:text-lg text-slate-400">
            Ultra-low latency matching. Institutional-grade depth. 0% house edge. 
            Experience the world&apos;s most advanced peer-to-peer betting platform.
          </p>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-cyan-600/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]"></div>
      </section>

      {/* Main Trading Area */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Chart & Odds */}
        <div className="space-y-6 md:space-y-8">
          <MarketChart matchId={matchId} />
          <OddsGrid matchId={matchId} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-900 bg-slate-950 p-6 hover:border-slate-800 transition-colors">
              <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Market Liquidity</h3>
              <p className="text-xs md:text-sm text-slate-400">
                SBE provides deep liquidity across all major sporting events, ensuring your orders are matched at the best possible price.
              </p>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-950 p-6 hover:border-slate-800 transition-colors">
              <h3 className="mb-2 text-sm font-bold text-white uppercase tracking-wider">Fast Execution</h3>
              <p className="text-xs md:text-sm text-slate-400">
                Our distributed ledger and matching engine process thousands of transactions per second with sub-millisecond precision.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side / Mobile Bottom: Sidebar */}
        <aside className="space-y-6 md:space-y-8">
          <PriceLadder matchId={matchId} />
          <TradesTicker />
          <div className="hidden lg:block">
            <BetSlip matchId={matchId} />
          </div>
        </aside>
      </div>
    </div>
  );
}
