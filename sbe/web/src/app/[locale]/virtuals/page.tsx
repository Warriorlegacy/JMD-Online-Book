"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "@/i18n/navigation";
import {
  LayoutDashboard, BarChart2, Users, Megaphone, DollarSign,
  Settings, HelpCircle, LogOut, Calendar, Lock, X,
} from "lucide-react";

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDEBAR = [
  { id: "dashboard",       label: "Dashboard",       Icon: LayoutDashboard, href: "/dashboard" },
  { id: "analytics",       label: "Analytics",       Icon: BarChart2,       href: "/affiliate/analytics" },
  { id: "referrals",       label: "Referrals",       Icon: Users,           href: "/affiliate/referrals" },
  { id: "marketing",       label: "Marketing Assets", Icon: Megaphone,      href: "/affiliate/marketing" },
  { id: "earnings",        label: "Earnings",         Icon: DollarSign,     href: "/affiliate/earnings" },
  { id: "settings",        label: "Settings",         Icon: Settings,       href: "/affiliate/settings" },
];

// ── Demo data ─────────────────────────────────────────────────────────────────
type BetType = "WIN / EACH WAY" | "FORECAST" | "TRICAST";

const RUNNERS = [
  { pos: 1, name: "Neon Velocity",  color: "bg-purple-600", form: [true, true, false],  ew: "1/4 1-2-3", odds: "3.50",  locked: false },
  { pos: 2, name: "Digital Sultan", color: "bg-amber-500",  form: [true, false, false, false], ew: "1/4 1-2-3", odds: "5.20",  locked: false, selected: true },
  { pos: 3, name: "Kinetic Pulse",  color: "bg-pink-500",   form: [true, true, true, true], ew: "1/4 1-2-3", odds: "12.0", locked: false },
  { pos: 4, name: "Lunar Eclipse",  color: "bg-slate-600",  form: [],                   ew: "--",         odds: null,    locked: true },
];

const UPCOMING_RACES = [
  { id: "r1", sport: "🏎️", name: "Silverstone GP",        sub: "Motor Racing",  time: "NEXT", up: true },
  { id: "r2", sport: "⚽", name: "London Blue vs Madrid", sub: "Football",      time: "14:15", up: false },
  { id: "r3", sport: "🐕", name: "Dover Sprint",           sub: "Greyhounds",   time: "14:20", up: false },
  { id: "r4", sport: "🏀", name: "LA Stars vs NY Hawks",  sub: "Basketball",   time: "14:25", up: false },
];

// Form dot colours
const formColor = (win: boolean) => win ? "bg-emerald-400" : "bg-white/20";

export default function VirtualsPage() {
  const { user: _user } = useAuth();
  const router = useRouter();
  const [activeSidebar, setActiveSidebar] = useState("analytics");
  const [betType, setBetType] = useState<BetType>("WIN / EACH WAY");
  const [selectedRunner, setSelectedRunner] = useState<number | null>(2);
  const [stake, setStake] = useState("100.00");

  const selected = RUNNERS.find(r => r.pos === selectedRunner);
  const odds     = selected ? parseFloat(selected.odds || "0") : 0;
  const payout   = odds * parseFloat(stake || "0");

  const removeSelection = () => setSelectedRunner(null);

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 flex">

      {/* ── Left Sidebar ──────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1120] min-h-screen">

        {/* Brand / user card */}
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <p className="text-white font-black text-base tracking-tight">Affiliate Pro</p>
          <p className="text-amber-400 text-[9px] font-black uppercase tracking-widest">Gold Tier Member</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 space-y-0.5">
          {SIDEBAR.map(({ id, label, Icon, href }) => (
            <button
              key={id}
              onClick={() => { setActiveSidebar(id); router.push(href as any); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeSidebar === id
                  ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <button className="w-full py-2.5 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] text-[9px] font-black uppercase tracking-widest hover:bg-[#0071e3]/20 transition-all">
            Request Payout
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
            <HelpCircle className="w-3.5 h-3.5" /> Support
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">

        {/* Live sim hero */}
        <div className="relative bg-gradient-to-br from-slate-900 to-[#0a0e17]" style={{ minHeight: "260px" }}>
          {/* Atmospheric overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-transparent to-transparent" />
          {/* Athlete illustration area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[140px] opacity-10">🏃</span>
          </div>

          {/* TOP overlay tags */}
          <div className="absolute top-5 left-5 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-xs font-black">LIVE SIMULATION</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              <span className="text-white/60 text-xs font-bold">RACE ID: #VX-4429</span>
            </div>
          </div>

          {/* Race name + stats */}
          <div className="absolute bottom-8 left-6 right-6">
            <h1 className="text-4xl font-black text-white leading-tight mb-1">
              Ascot Virtual<br />Derby
            </h1>
            <p className="text-white/40 text-sm mb-5">6/8 Furlongs • Good to Firm</p>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Lap</p>
                <p className="text-white font-black text-2xl">02/03</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Time</p>
                <p className="text-white font-black text-2xl">0:44.2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bet type tabs */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-white/5">
          {(["WIN / EACH WAY", "FORECAST", "TRICAST"] as BetType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setBetType(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                betType === tab
                  ? "bg-[#0071e3] text-white"
                  : "border border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Runner table */}
        <div className="flex-1 px-5 py-4">
          <table className="w-full">
            <thead>
              <tr className="text-[8px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
                <th className="pb-3 text-left w-8">#</th>
                <th className="pb-3 text-left">Runner &amp; Form</th>
                <th className="pb-3 text-center">EW</th>
                <th className="pb-3 text-right w-28">Odds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RUNNERS.map(r => (
                <tr key={r.pos} className="hover:bg-white/2 transition-colors">
                  <td className="py-4 pr-3 text-white/30 font-bold">{r.pos}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                        {r.name?.[0] || "V"}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${r.locked ? "text-white/20" : "text-white"}`}>{r.name}</p>
                        {r.locked ? (
                          <p className="text-red-400/60 text-[9px] font-bold uppercase">Market Suspended</p>
                        ) : (
                          <div className="flex items-center gap-1 mt-1">
                            {r.form.map((w, i) => (
                              <div key={i} className={`w-2.5 h-2.5 rounded-full ${formColor(w)}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center text-white/30 text-xs font-bold">{r.ew}</td>
                  <td className="py-4 text-right">
                    {r.locked ? (
                      <div className="inline-flex items-center justify-center w-16 h-10 rounded-xl bg-white/3 border border-white/5">
                        <Lock className="w-4 h-4 text-white/20" />
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedRunner(r.pos === selectedRunner ? null : r.pos)}
                        className={`w-20 py-2.5 rounded-xl font-black text-lg transition-all active:scale-95 ${
                          selectedRunner === r.pos
                            ? "bg-[#AFFF00] text-black"
                            : "bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3]/20"
                        }`}
                      >
                        {r.odds}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Right rail ─────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-l border-white/5 bg-[#0d1120] p-4 gap-4 overflow-y-auto">

        {/* Upcoming Races */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-black text-sm uppercase tracking-tight">Upcoming Races</h3>
            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Calendar className="w-4 h-4 text-white/30" />
            </button>
          </div>
          <div className="space-y-2">
            {UPCOMING_RACES.map(race => (
              <div
                key={race.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  race.up
                    ? "border-[#AFFF00]/20 bg-[#AFFF00]/3"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">{race.sport}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs truncate ${race.up ? "text-white" : "text-white/70"}`}>{race.name}</p>
                  <p className="text-white/30 text-[9px]">{race.sub}</p>
                </div>
                <div className={`text-right flex-shrink-0 text-[9px] font-black ${race.up ? "text-[#AFFF00]" : "text-white/30"}`}>
                  {race.up ? (
                    <>
                      <p className="text-[#AFFF00]/60 text-[7px]">UP</p>
                      <p>NEXT</p>
                    </>
                  ) : (
                    <p>{race.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-2 py-2 text-[9px] font-black text-white/30 hover:text-[#0071e3] uppercase tracking-widest transition-colors">
            View Full Schedule
          </button>
        </div>

        {/* Bet Slip */}
        <div className="rounded-2xl border border-white/10 bg-[#0a0e17] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
                <span className="text-[#0071e3] text-[8px] font-black">🎫</span>
              </div>
              <span className="text-white font-black text-sm">BET SLIP</span>
            </div>
            {selectedRunner && (
              <div className="w-5 h-5 rounded-full bg-[#0071e3] flex items-center justify-center">
                <span className="text-white text-[9px] font-black">1</span>
              </div>
            )}
          </div>

          {selectedRunner && selected ? (
            <div className="p-4 space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">To Win</p>
                  <button onClick={removeSelection} className="text-white/20 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-white font-black text-sm">{selected.name}</p>
                <p className="text-white/30 text-[9px] mt-0.5">Ascot Virtual Derby • Race #VX-4429</p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Stake</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/15 bg-black/30">
                  <span className="text-white/30 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={stake}
                    onChange={e => setStake(e.target.value)}
                    className="flex-1 bg-transparent text-white font-black text-base outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-[9px] font-bold uppercase">Payout</span>
                  <span className="text-white font-black">${payout.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white/30">Total Stake</span>
                <span className="text-white">${parseFloat(stake || "0").toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Potential Return</span>
                <span className="text-[#0071e3] font-black">${payout.toFixed(2)}</span>
              </div>

              <button className="w-full py-3.5 rounded-xl bg-[#0071e3] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0064cc] active:scale-95 transition-all">
                Place Bet Now
              </button>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-white/20 text-sm">Select a runner to add to your bet slip</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
