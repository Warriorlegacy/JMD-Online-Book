"use client";

import { useState, useEffect } from "react";
import { TrendingUp, MousePointer, UserPlus, Copy, ArrowUpRight, ArrowDownRight, DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const COMMISSION_DATA = [30, 50, 65, 48, 80, 70, 90, 65, 75, 85, 72, 95];
const REVENUE_DATA = [45, 65, 80, 60, 95, 85, 110, 80, 92, 105, 88, 120];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const TRAFFIC_SOURCES = [
  { label: "DIRECT", pct: 52, color: "#0071e3" },
  { label: "SOCIAL", pct: 26, color: "#4f46e5" },
  { label: "SEARCH", pct: 14, color: "#0f766e" },
  { label: "PARTNERS", pct: 8, color: "#162a3d" },
];

interface ReferralStat {
  referralCode: string;
  totalReferees: number;
  totalEarnings: string;
  referralLink: string;
}

interface Referee {
  id: string;
  username: string;
  createdAt: string;
  status: string;
}

function EarningsChart() {
  const maxValue = Math.max(...REVENUE_DATA, ...COMMISSION_DATA);

  return (
    <div className="flex h-full items-end gap-2">
      {MONTHS.map((month, index) => {
        const revenueHeight = Math.max(12, (REVENUE_DATA[index] / maxValue) * 100);
        const commissionHeight = Math.max(8, (COMMISSION_DATA[index] / maxValue) * 100);

        return (
          <div key={month} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-2.5 rounded-full bg-white/10"
                style={{ height: `${commissionHeight}%` }}
              />
              <div
                className="w-2.5 rounded-full bg-[#0071e3]"
                style={{ height: `${revenueHeight}%` }}
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
              {month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"30D" | "90D" | "ALL">("30D");
  const [stats, setStats] = useState<ReferralStat | null>(null);
  const [referrals, setReferrals] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          fetch("/api/referral/stats"),
          fetch("/api/referral/list")
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (listRes.ok) setReferrals(await listRes.json());
      } catch (err) {
        console.error("Failed to fetch referral data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyToClipboard = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3]" />
      </div>
    );
  }

  const totalEarnings = parseFloat(stats?.totalEarnings || "0");

  const statCards = [
    { 
      label: "TOTAL COMMISSION", 
      value: `₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
      change: "+0% from last month", 
      up: true, 
      icon: <DollarSign className="w-5 h-5" /> 
    },
    { label: "CLICK-THROUGH RATE", value: "0.00%", change: "N/A", up: null, icon: <MousePointer className="w-5 h-5" /> },
    { label: "CONVERSION RATE", value: "0.00%", change: "N/A", up: null, icon: <TrendingUp className="w-5 h-5" /> },
    { 
      label: "TOTAL REFERRALS", 
      value: stats?.totalReferees.toString() || "0", 
      change: "New partners", 
      up: true, 
      icon: <UserPlus className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight italic">AFFILIATE PORTAL</h2>
          <p className="text-white/30 text-sm mt-1 uppercase font-black tracking-widest">
            {user?.username} / PARTNER DASHBOARD
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/5">
          {(["30D", "90D", "ALL"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-[10px] font-black transition-all uppercase tracking-widest ${
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
          <div key={card.label} className="bg-[#162a3d]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{card.label}</p>
              <div className="p-2 bg-white/5 rounded-xl text-white/30 group-hover:text-white/50 transition-colors">
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-white italic tracking-tight">{card.value}</p>
            <div className={`flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest ${
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
        <div className="lg:col-span-2 bg-[#162a3d]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-white mb-6 uppercase tracking-[0.2em]">COMMISSION PERFORMANCE</h3>
          <div className="h-64">
            <EarningsChart />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-[#162a3d]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">TRAFFIC SOURCES</h3>
          <div className="space-y-5">
            {TRAFFIC_SOURCES.map(src => (
              <div key={src.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{src.label}</span>
                  <span className="text-white font-black text-xs">{src.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${src.pct}%`, background: src.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20">
            <p className="text-[9px] font-black text-[#0071e3] uppercase tracking-[0.2em] mb-2">PARTNER INSIGHT</p>
            <p className="text-white/60 text-[11px] leading-relaxed font-medium">
              Real-time tracking of direct referrals is now active. Share your unique link to start earning.
            </p>
          </div>
        </div>
      </div>

      {/* Referrals table + Marketing Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Referrals */}
        <div className="lg:col-span-3 bg-[#162a3d]/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">NETWORK GROWTH</h3>
            <button className="text-[#0071e3] text-[10px] font-black uppercase tracking-widest hover:underline">Full Report</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em] border-b border-white/5 bg-white/2">
                <th className="p-6 text-left">PARTNER</th>
                <th className="p-6 text-left">JOIN DATE</th>
                <th className="p-6 text-left">STATUS</th>
                <th className="p-6 text-right">VOLUME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {referrals.length > 0 ? referrals.map(ref => (
                <tr key={ref.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0071e3]/20 flex items-center justify-center text-[#0071e3] font-black text-[10px]">
                        {(ref.username || "PN")?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-white font-black italic">{ref.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-xs font-bold uppercase">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${ref.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${ref.status === "active" ? "text-emerald-400" : "text-white/20"}`}>
                        {ref.status || "PENDING"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-black text-white text-sm italic">₹0.00</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-white/20 text-xs font-black uppercase tracking-widest">
                    No active referrals found. Start sharing to earn!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Marketing Assets */}
        <div className="lg:col-span-2 bg-[#162a3d]/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">PARTNER TOOLS</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">UNIQUE TRACKING LINK</p>
              <div className="flex items-center gap-2 p-4 bg-black/40 border border-white/10 rounded-xl group hover:border-[#0071e3]/50 transition-all cursor-pointer" onClick={copyToClipboard}>
                <span className="flex-1 text-[11px] text-white/60 truncate font-black tracking-tight uppercase">
                  {stats?.referralLink || "Loading..."}
                </span>
                <button className="p-1.5 hover:bg-[#0071e3] rounded-lg transition-all group-hover:scale-110">
                  <Copy className={`w-4 h-4 ${copied ? "text-emerald-400" : "text-white/30"}`} />
                </button>
              </div>
              {copied && <p className="text-[9px] font-black text-emerald-400 mt-2 uppercase tracking-widest text-center">Copied to clipboard!</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["BANNER_728x90", "CARD_300x250"].map(size => (
                <div key={size} className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#0071e3]/10 to-[#162a3d] border border-white/10 flex flex-col items-center justify-center p-2 cursor-pointer hover:border-[#0071e3]/40 transition-all group relative">
                  <div className="absolute inset-0 bg-[#0071e3]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest relative z-10">{size}</span>
                  <ArrowUpRight className="w-3 h-3 text-white/10 absolute top-2 right-2 group-hover:text-[#0071e3] transition-colors" />
                </div>
              ))}
            </div>

            <button className="w-full py-4 border border-white/5 bg-white/2 rounded-xl text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all">
              Marketing Material Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
