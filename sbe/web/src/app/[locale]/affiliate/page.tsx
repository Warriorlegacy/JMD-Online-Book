"use client";

import { useState } from "react";
import { TrendingUp, MousePointer, UserPlus, Copy, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

const COMMISSION_DATA = [30, 50, 65, 48, 80, 70, 90, 65, 75, 85, 72, 95];
const REVENUE_DATA = [45, 65, 80, 60, 95, 85, 110, 80, 92, 105, 88, 120];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const REFERRALS = [
  { id: "#82194-TX", date: "Oct 24, 2023", status: "Active", commission: "$42.00" },
  { id: "#91023-AM", date: "Oct 22, 2023", status: "Active", commission: "$128.50" },
  { id: "#77281-PL", date: "Oct 21, 2023", status: "Inactive", commission: "$0.00" },
  { id: "#11092-KC", date: "Oct 20, 2023", status: "Active", commission: "$21.15" },
];

const PAYOUT_HISTORY = [
  { label: "Payout Successful", txId: "#PX90128", amount: "$4,250.00", date: "Oct 15, 2023" },
  { label: "Payout Successful", txId: "#PX89932", amount: "$3,800.25", date: "Sep 15, 2023" },
];

const TRAFFIC_SOURCES = [
  { label: "Direct Referrals", pct: 62, color: "#0071e3" },
  { label: "Social Media", pct: 24, color: "#8B5CF6" },
  { label: "Blogging/Review", pct: 10, color: "#AFFF00" },
  { label: "Email Campaigns", pct: 4, color: "#F97316" },
];

function EarningsChart() {
  const maxR = Math.max(...REVENUE_DATA);
  const maxC = Math.max(...COMMISSION_DATA);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
          <span className="text-white/40 text-xs">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#AFFF00]" />
          <span className="text-white/40 text-xs">Commission</span>
        </div>
      </div>
      <div className="flex-1 relative">
        {/* Y-axis grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="border-t border-white/5 w-full" />
          ))}
        </div>
        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-1.5 pb-6">
          {MONTHS.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex items-end gap-0.5" style={{ height: "calc(100% - 20px)" }}>
                <div
                  className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{ height: `${(REVENUE_DATA[i] / maxR) * 100}%`, background: "rgba(0,113,227,0.5)" }}
                />
                <div
                  className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                  style={{ height: `${(COMMISSION_DATA[i] / maxC) * 100}%`, background: "rgba(175,255,0,0.5)" }}
                />
              </div>
              <span className="text-[8px] text-white/20 font-bold">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AffiliateDashboard() {
  const [period, setPeriod] = useState<"30D" | "90D" | "ALL">("30D");

  const statCards = [
    { label: "TOTAL COMMISSION", value: "$12,482.50", change: "+14.2% from last month", up: true, icon: <DollarSign className="w-5 h-5" /> },
    { label: "CLICK-THROUGH RATE", value: "8.42%", change: "+2.1% improvement", up: true, icon: <MousePointer className="w-5 h-5" /> },
    { label: "CONVERSION RATE", value: "3.15%", change: "Stable performance", up: null, icon: <TrendingUp className="w-5 h-5" /> },
    { label: "NEW REFERRALS", value: "1,204", change: "-5% vs last period", up: false, icon: <UserPlus className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Affiliate Dashboard</h2>
          <p className="text-white/30 text-sm mt-1">Performance tracking for the last {period === "30D" ? "30 days" : period === "90D" ? "90 days" : "all time"}</p>
        </div>
        <div className="flex items-center gap-2 p-1 glass-card rounded-full border border-white/5">
          {(["30D", "90D", "ALL"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all uppercase ${
                period === p ? "bg-[#0071e3] text-white shadow-lg" : "text-white/40 hover:text-white"
              }`}
            >
              {p === "30D" ? "30 DAYS" : p === "90D" ? "90 DAYS" : "ALL TIME"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{card.label}</p>
              <div className="p-2 bg-white/5 rounded-xl text-white/30 group-hover:text-white/50 transition-colors">
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-white">{card.value}</p>
            <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${
              card.up === true ? "text-emerald-400" : card.up === false ? "text-red-400" : "text-white/30"
            }`}>
              {card.up === true && <ArrowUpRight className="w-3 h-3" />}
              {card.up === false && <ArrowDownRight className="w-3 h-3" />}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-black text-white mb-4">Earnings Performance</h3>
          <div className="h-56">
            <EarningsChart />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
          <h3 className="text-base font-black text-white">Traffic Sources</h3>
          <div className="space-y-4">
            {TRAFFIC_SOURCES.map(src => (
              <div key={src.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white/60 text-sm">{src.label}</span>
                  <span className="text-white font-black text-sm">{src.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${src.pct}%`, background: src.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Growth tip */}
          <div className="p-4 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20">
            <p className="text-[9px] font-black text-[#0071e3] uppercase tracking-widest mb-2">GROWTH TIP</p>
            <p className="text-white/60 text-xs leading-relaxed">
              Focus on direct referrals — they convert 3.5x higher than social traffic this month.
            </p>
          </div>
        </div>
      </div>

      {/* Referrals table + Marketing Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Referrals */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="font-black text-white">Recent Referrals</h3>
            <button className="text-[#0071e3] text-xs font-bold hover:underline">View All</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[9px] font-bold text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/2">
                <th className="p-4 text-left">USER ID</th>
                <th className="p-4 text-left">DATE JOINED</th>
                <th className="p-4 text-left">STATUS</th>
                <th className="p-4 text-right">COMMISSION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {REFERRALS.map(ref => (
                <tr key={ref.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-sm text-white font-bold">{ref.id}</td>
                  <td className="px-4 py-3.5 text-white/40 text-sm">{ref.date}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${ref.status === "Active" ? "bg-emerald-400" : "bg-white/20"}`} />
                      <span className={`text-sm font-medium ${ref.status === "Active" ? "text-emerald-400" : "text-white/30"}`}>
                        {ref.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-black text-white">{ref.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Marketing Assets */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-black text-white">Marketing Assets</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">DEFAULT TRACKING LINK</p>
              <div className="flex items-center gap-2 p-3 bg-black/30 border border-white/10 rounded-xl">
                <span className="flex-1 text-xs text-white/40 truncate font-mono">https://kineticledger.com/join?ref=PRO...</span>
                <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <Copy className="w-3.5 h-3.5 text-white/30 hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Banner previews */}
            <div className="grid grid-cols-2 gap-3">
              {["728X90 BANNER", "300X250 CARD"].map(size => (
                <div key={size} className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#0071e3]/20 to-purple-900/30 border border-white/10 flex flex-col items-center justify-end p-2 cursor-pointer hover:border-[#0071e3]/30 transition-colors">
                  <span className="text-[8px] font-black text-white/30 uppercase">{size}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-3 border border-white/10 rounded-xl text-white/50 text-xs font-bold hover:text-white hover:border-white/20 transition-colors">
              Request Custom Creatives
            </button>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-black text-white">Payout History</h3>
        </div>
        <div className="divide-y divide-white/5">
          {PAYOUT_HISTORY.map((payout, i) => (
            <div key={i} className="flex items-center gap-5 px-6 py-5 hover:bg-white/2 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{payout.label}</p>
                <p className="text-white/30 text-xs mt-0.5">TRANSACTION ID: {payout.txId}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black">{payout.amount}</p>
                <p className="text-white/30 text-xs">{payout.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
