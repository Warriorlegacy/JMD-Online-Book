"use client";

import { useState } from "react";
import { Bell, CheckCircle, Loader, X, ChevronRight, Shield } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type NotifTab = "All Notifications" | "Outcomes" | "Compliance" | "Promotions";

// ── Demo notifications ────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    id: "n1", type: "alert",
    title: "Action Required: KYC Update",
    body: "Your identity verification document is nearing expiration. Please upload a new proof of address to avoid betting restrictions.",
    badge: "EXPIRING IN 2D",
    badgeColor: "text-amber-400 border border-amber-500/20 bg-amber-500/10",
    cta: "COMPLETE VERIFICATION",
    ctaColor: "text-amber-400",
    borderColor: "border-red-500/30 bg-red-500/5",
  },
  {
    id: "n2", type: "won",
    title: "Bet Settled: WON",
    sub: "PREMIER LEAGUE • MAN CITY VS ARSENAL",
    time: "2 minutes ago",
    amount: "+$4,250.00",
    amountColor: "text-emerald-400",
    details: [
      { label: "STAKE", value: "$1,000.00" },
      { label: "ODDS",  value: "4.25" },
      { label: "MARKET", value: "Correct Score (2-1)" },
    ],
    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    iconBg: "bg-emerald-500/15 border border-emerald-500/20",
  },
  {
    id: "n3", type: "goal",
    title: "GOAL SCORED!",
    body: 'Erling Haaland scores. Your bet "Man City to score 2+" is now active.',
    badge: "LIVE 72'",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    icon: "⚽",
    live: true,
  },
  {
    id: "n4", type: "lost",
    title: "Bet Settled: LOST",
    sub: "NBA • LAKERS VS WARRIORS",
    time: "1 hour ago",
    amount: "-$250.00",
    amountColor: "text-red-400",
    details: [
      { label: "STAKE",  value: "$250.00" },
      { label: "ODDS",   value: "1.95" },
      { label: "MARKET", value: "Total Points (Over 220)" },
    ],
    icon: <X className="w-5 h-5 text-red-400" />,
    iconBg: "bg-red-500/15 border border-red-500/20",
  },
  {
    id: "n5", type: "refund",
    title: "Bet Settled: REFUNDED",
    sub: "TENNIS • NADAL VS ALCARAZ",
    amount: "$500.00",
    amountColor: "text-white",
    badge: "STAKE RETURNED",
    badgeColor: "text-white/40 border border-white/10",
    body: "Market voided due to player retirement (Injury). Stake returned to main balance.",
    details: null,
    icon: <Loader className="w-5 h-5 text-white/40 animate-spin" />,
    iconBg: "bg-white/5 border border-white/10",
  },
];

const NOTIF_TABS: NotifTab[] = ["All Notifications", "Outcomes", "Compliance", "Promotions"];

export default function OutcomeCenterTab() {
  const [activeTab, setActiveTab] = useState<NotifTab>("All Notifications");
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <div className="flex gap-5">

      {/* ── Notification feed ──────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Centralized Alerts</p>
          <h2 className="text-4xl font-black text-white">Outcome Center</h2>
          <p className="text-white/40 text-sm mt-2 max-w-lg leading-relaxed">
            Real-time resolution for every market interaction. Monitor payouts,
            compliance tasks, and live match shifts.
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 p-1 bg-white/3 border border-white/5 rounded-xl">
            {NOTIF_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-white/10 text-white border-b-2 border-[#0071e3]"
                    : "text-white/30 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 rounded-xl border border-white/15 text-white/60 font-bold text-sm hover:bg-white/5 transition-all">
              Mark all as read
            </button>
            <button className="px-5 py-2 rounded-xl bg-[#0071e3] text-white font-bold text-sm hover:bg-[#0064cc] active:scale-95 transition-all">
              Preferences
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {NOTIFICATIONS.map(n => (
            <NotifCard key={n.id} n={n} />
          ))}
        </div>
      </div>

      {/* ── Right rail ─────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 space-y-4">

        {/* Notification Settings */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0071e3]" />
            <h3 className="text-white font-black text-sm">Notification Settings</h3>
          </div>
          <ToggleRow label="Push Notifications" sub="Real-Time Alerts" value={pushEnabled} onChange={setPushEnabled} />
          <ToggleRow label="Email Summaries"    sub="Daily Bet Reports" value={emailEnabled} onChange={setEmailEnabled} />
          <ToggleRow label="SMS Alerts"         sub="Critical Updates Only" value={smsEnabled} onChange={setSmsEnabled} />
          <button className="w-full py-2.5 rounded-xl border border-white/15 text-white font-bold text-[9px] uppercase tracking-widest hover:bg-white/5 transition-all">
            Update Channels
          </button>
        </div>

        {/* Outcome Summary */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 space-y-4">
          <h3 className="text-white font-black text-sm">Outcome Summary</h3>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-white/40 text-xs">Win Rate (Last 7d)</p>
              <p className="text-white font-black text-2xl">68%</p>
            </div>
            <div className="h-2 bg-white/5 rounded-full">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: "68%" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Won",  value: "$12.4k" },
              { label: "Total Bets", value: "142" },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-white font-black text-lg">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus alert CTA card */}
        <div className="rounded-2xl overflow-hidden border border-[#AFFF00]/15 bg-[#0d1120]">
          <div className="h-24 bg-gradient-to-br from-emerald-900/40 to-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-70 blur-sm">
              <div className="absolute w-16 h-2 bg-[#AFFF00] rounded-full rotate-45 left-4 top-4" />
              <div className="absolute w-12 h-2 bg-emerald-400 rounded-full -rotate-12 right-6 bottom-4" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="px-2 py-0.5 rounded-full bg-[#AFFF00]/10 border border-[#AFFF00]/20 inline-block">
              <span className="text-[#AFFF00] text-[8px] font-black uppercase">Bonus Alert</span>
            </div>
            <p className="text-white font-black text-sm">UCL Multi-Boost 15%</p>
            <p className="text-white/40 text-[10px] leading-relaxed">
              Expires in 14 hours. Your next parlay gets a payout boost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Notification card ─────────────────────────────────────────────────────────
function NotifCard({ n }: { n: (typeof NOTIFICATIONS)[0] }) {
  if (n.type === "alert") {
    return (
      <div className={`rounded-2xl border p-5 ${n.borderColor}`}>
        <div className="flex items-start gap-4 mb-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white font-black text-sm">{n.title}</h4>
              <span className={`text-[8px] font-black px-2 py-1 rounded-full ${n.badgeColor}`}>{n.badge}</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">{n.body}</p>
          </div>
        </div>
        <button className={`text-[9px] font-black uppercase tracking-widest ${n.ctaColor} hover:underline`}>{n.cta}</button>
      </div>
    );
  }

  if (n.type === "goal") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0">
          ⚽
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-emerald-400 font-black text-sm">{n.title}</h4>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${n.badgeColor}`}>{n.badge}</span>
          </div>
          <p className="text-white/50 text-xs">{n.body}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-emerald-500/40 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-5">
      <div className="flex items-start gap-4 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${(n as any).iconBg || "bg-white/5 border border-white/10"}`}>
          {(n as any).icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className="text-white font-black text-sm">{n.title}</h4>
            <span className={`font-black text-sm ${(n as any).amountColor}`}>{n.amount}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/30 text-[9px] font-bold">{n.sub}</p>
            <p className="text-white/20 text-[9px]">{n.time}</p>
          </div>
          {(n as any).badge && !(n as any).details && (
            <p className="text-white/30 text-[10px] italic">{n.body}</p>
          )}
        </div>
      </div>
      {(n as any).details && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
          {(n as any).details.map((d: { label: string; value: string }) => (
            <div key={d.label}>
              <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5">{d.label}</p>
              <p className="text-white/70 font-bold text-xs">{d.value}</p>
            </div>
          ))}
        </div>
      )}
      {n.type === "refund" && (
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${n.badgeColor}`}>{n.badge}</span>
          </div>
          <p className="text-white/30 text-[10px] italic">{n.body}</p>
        </div>
      )}
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, sub, value, onChange }: {
  label: string; sub: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-bold text-sm">{label}</p>
        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-all ${value ? "bg-[#0071e3]" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );
}
