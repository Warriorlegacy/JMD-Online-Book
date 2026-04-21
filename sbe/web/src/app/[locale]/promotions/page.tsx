"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ChevronLeft, ChevronRight, Headphones, Settings,
  CheckCircle, XCircle, Clock,
} from "lucide-react";

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SIDEBAR = [
  { id: "sportsbook",    label: "Sportsbook",    icon: "🏟️", href: "/sports" },
  { id: "live-dealer",  label: "Live Dealer",  icon: "🃏", href: "/live-dealer" },
  { id: "promotions",   label: "Promotions",   icon: "🎁", href: "/promotions" },
  { id: "wallet",       label: "Wallet",       icon: "💳", href: "/wallet" },
  { id: "verification", label: "Verification", icon: "🛡️", href: "/profile/verification" },
];

// ── Demo data ─────────────────────────────────────────────────────────────────
const ACTIVE_BONUSES = [
  {
    id: "wb1", name: "Welcome Pack: Match 1", tag: "SPORTSBOOK EXCLUSIVE",
    lockedValue: 500, wagered: 15000, total: 20000,
  },
  {
    id: "wb2", name: "Weekend High-Roller", tag: "LIVE DEALER ONLY",
    lockedValue: 750, wagered: 4500, total: 37500,
  },
];

const INCENTIVES = [
  {
    id: "i1", badge: "LIMITED TIME", badgeColor: "bg-amber-500 text-black",
    emoji: "🪙", title: "50% Kinetic Reload",
    desc: "Top up your balance by Friday and get up to $200 in bonus credits instantly.",
    cta: "Opt In Now", ctaColor: "bg-white text-black",
  },
  {
    id: "i2", badge: "DAILY PERK", badgeColor: "bg-[#AFFF00]/80 text-black",
    emoji: "🎯", title: "$25 Risk-Free Bet",
    desc: "Your first parlay of the day is protected. Get a refund if one leg lets you down.",
    cta: "Claim Reward", ctaColor: "bg-white/10 border border-white/20 text-white",
  },
  {
    id: "i3", badge: "IDENTITY", badgeColor: "bg-[#0071e3]/80 text-white",
    emoji: "🔓", title: "Level 2 Unlock",
    desc: "Verify your ID today to unlock higher withdrawal limits and a $50 loyalty chip.",
    cta: "Verify Now", ctaColor: "bg-white/10 border border-white/20 text-white",
  },
];

type LedgerTab = "All History" | "Sports" | "Casino";

const LEDGER = [
  { id: "l1", name: "Super Bowl LVIII Free Play", date: "Feb 11, 2024", type: "Fixed Credit",       value: "$100.00",    status: "RELEASED" },
  { id: "l2", name: "First Deposit Match",         date: "Jan 15, 2024", type: "Bonus Carryover",    value: "$1,000.00",  status: "RELEASED" },
  { id: "l3", name: "Referral Bonus – x2",         date: "Jan 02, 2024", type: "Social Incentive",   value: "$50.00",     status: "EXPIRED" },
];

const STATUS_STYLES: Record<string, string> = {
  RELEASED: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  EXPIRED:  "bg-red-500/10     text-red-400     border border-red-500/20",
  PENDING:  "bg-amber-500/10   text-amber-400   border border-amber-500/20",
};

export default function PromotionsPage() {
  const router = useRouter();
  const [activeSidebar,  setActiveSidebar]  = useState("promotions");
  const [incentiveSlide, setIncentiveSlide] = useState(0);
  const [ledgerTab,      setLedgerTab]      = useState<LedgerTab>("All History");
  const maxSlide = Math.max(0, INCENTIVES.length - 1);

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 flex">

      {/* ── Left Sidebar ─────────────────────────────────────── */}
      <div className="w-48 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1120] min-h-screen">
        {/* User pill */}
        <div className="m-3 p-3 rounded-2xl bg-gradient-to-br from-amber-600/10 to-amber-900/10 border border-amber-500/15 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">G</div>
          <div className="min-w-0">
            <p className="text-white font-black text-xs truncate">Gold Tier</p>
            <p className="text-amber-400 text-[8px] font-bold">VIP Member</p>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {SIDEBAR.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSidebar(s.id); router.push(s.href as any); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeSidebar === s.id
                  ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
            <Headphones className="w-3.5 h-3.5" /> Support
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-6">

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-[#0d1120] p-10 min-h-[200px] flex flex-col justify-center">
          {/* Background texture */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#0071e3]/5 to-transparent" />
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/3 rounded-full"
                style={{
                  width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
                  right: `-${i * 20}px`, top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            ))}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Active Incentives</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight mb-3">Boost Your Edge.</h1>
            <p className="text-white/50 text-base mb-6">
              You have <span className="text-white font-bold">$1,250.00</span> in active bonuses currently unlocking.
              Stake on high-liquidity markets to accelerate wagering requirements.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-7 py-3 rounded-xl bg-[#0071e3] text-white font-bold text-sm hover:bg-[#0064cc] active:scale-95 transition-all">
                Claim New Reward
              </button>
              <button className="px-7 py-3 rounded-xl border border-white/15 text-white/70 font-bold text-sm hover:bg-white/5 transition-all">
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Live Bonus Tracking */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white font-black text-lg">Live Bonus Tracking</h2>
              <p className="text-white/30 text-xs">Real-time wagering progress for your active balances.</p>
            </div>
            <button className="text-[#0071e3] text-[9px] font-black uppercase tracking-widest hover:underline">Market Rules</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACTIVE_BONUSES.map(b => {
              const pct = Math.round((b.wagered / b.total) * 100);
              return (
                <div key={b.id} className="p-5 rounded-2xl border border-white/5 bg-[#0d1120]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-black text-base">{b.name}</p>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-0.5">{b.tag}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-white/30 uppercase">Locked Value</p>
                      <p className="text-white font-black text-lg">${b.lockedValue.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] font-bold text-white/40">Wagering Requirement</p>
                    <p className="text-emerald-400 text-[9px] font-black">{pct}% Complete</p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full mb-2">
                    <div className="h-full rounded-full bg-[#0071e3] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-white/30">${b.wagered.toLocaleString()} WAGERED</span>
                    <span className="text-white/20">${b.total.toLocaleString()} TOTAL</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Liquid Incentives */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-lg">Available Liquid Incentives</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIncentiveSlide(s => Math.max(0, s - 1))}
                disabled={incentiveSlide === 0}
                className="p-2 rounded-xl border border-white/10 text-white/30 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIncentiveSlide(s => Math.min(maxSlide, s + 1))}
                disabled={incentiveSlide === maxSlide}
                className="p-2 rounded-xl border border-white/10 text-white/30 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INCENTIVES.map(inc => (
              <div key={inc.id} className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden flex flex-col">
                {/* Image / visual area */}
                <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                  <span className="text-6xl">{inc.emoji}</span>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black ${inc.badgeColor}`}>
                      {inc.badge}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-white font-black text-base mb-1">{inc.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed flex-1 mb-4">{inc.desc}</p>
                  <button className={`w-full py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all ${inc.ctaColor}`}>
                    {inc.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reward Ledger */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-black text-lg">Reward Ledger</h2>
            <div className="flex items-center gap-1">
              {(["All History", "Sports", "Casino"] as LedgerTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setLedgerTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    ledgerTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[8px] font-black text-white/20 uppercase tracking-widest border-b border-white/5">
                  <th className="px-5 py-3.5 text-left">Incentive Identity</th>
                  <th className="px-5 py-3.5 text-left">Date Claimed</th>
                  <th className="px-5 py-3.5 text-left">Type</th>
                  <th className="px-5 py-3.5 text-right">Value</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {LEDGER.map(row => (
                  <tr key={row.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center flex-shrink-0">
                          {row.status === "RELEASED" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : row.status === "EXPIRED" ? (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <span className="text-white font-bold text-sm">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-sm">{row.date}</td>
                    <td className="px-5 py-4 text-white/50 text-sm">{row.type}</td>
                    <td className="px-5 py-4 text-right text-white font-black">{row.value}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${STATUS_STYLES[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-6 pb-2 text-center space-y-2">
          <div className="flex items-center justify-center gap-6 text-[9px] font-bold text-white/20 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Responsible Gambling</a>
            <a href="#" className="hover:text-white transition-colors">Affiliates</a>
          </div>
          <p className="text-[8px] text-white/10 uppercase tracking-widest">Kinetic Ledger • Responsible Gambling Only</p>
        </div>
      </div>
    </div>
  );
}
