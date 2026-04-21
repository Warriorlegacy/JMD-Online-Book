"use client";


import { TrendingUp, Users, Shield, Activity, AlertTriangle, FileText, Clock, Download } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatCard { label: string; value: string; sub: string; icon: React.ReactNode; accent: string; trend?: string; }
interface RiskAlert { id: string; title: string; desc: string; severity: "CRITICAL" | "HIGH" | "MEDIUM"; action: string; }
interface ActivityLog { icon: React.ReactNode; text: string; time: string; }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STAT_CARDS: StatCard[] = [
  { label: "GROSS GAMING REVENUE", value: "$428,950.00", sub: "+12.4% vs previous day", icon: <TrendingUp className="w-5 h-5" />, accent: "#10B981", trend: "up" },
  { label: "ACTIVE STAKEHOLDERS", value: "14,822", sub: "842 currently online", icon: <Users className="w-5 h-5" />, accent: "#0071e3" },
  { label: "OPEN LIABILITIES", value: "$1,024,550.42", sub: "High Risk — 62% in Tier 1 events", icon: <AlertTriangle className="w-5 h-5" />, accent: "#EF4444", trend: "warn" },
  { label: "SYSTEM STABILITY", value: "99.998%", sub: "All services operational", icon: <Shield className="w-5 h-5" />, accent: "#10B981" },
];

const RISK_ALERTS: RiskAlert[] = [
  { id: "1", title: "Multiple Account Correlation: User#8291", desc: "IP Address match with 4 other accounts in \"Premier League\" market.", severity: "CRITICAL", action: "INVESTIGATE" },
  { id: "2", title: "Heavy Liability Spike: Lakers vs Celtics", desc: "$400k liability on Lakers ML in last 5 minutes from Tier 3 region.", severity: "HIGH", action: "ADJUST ODDS" },
  { id: "3", title: "Rapid Deposit Cycle: User#1104", desc: "$6,000 deposited via Crypto. Immediate 1.01 odds wagering pattern detected.", severity: "HIGH", action: "LOCK ACCOUNT" },
];

const ACTIVITY_LOG: ActivityLog[] = [
  { icon: <FileText className="w-4 h-4" />, text: "Admin_Sarah adjusted margin for ATP Wimbledon Finals", time: "4 minutes ago" },
  { icon: <Shield className="w-4 h-4" />, text: "Sys_Manager updated security protocols for Withdrawal Gateway", time: "1 hour ago" },
  { icon: <AlertTriangle className="w-4 h-4" />, text: "Risk_Bot_v2 suspended account ID: #9902 (Fraud Detection)", time: "2 hours ago" },
  { icon: <Activity className="w-4 h-4" />, text: "System automatic backup completed for Master Ledger", time: "5 hours ago" },
];

// Chart bar data
const CHART_BARS = [42, 58, 67, 52, 80, 71, 90, 65, 75, 85, 70, 88, 72, 60, 95, 78, 85, 92, 68, 74];

function MiniBarChart() {
  return (
    <div className="flex items-end gap-1 h-full w-full">
      {CHART_BARS.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-300 hover:opacity-80" style={{
          height: `${h}%`,
          background: `rgba(0, 113, 227, ${0.2 + (h / 100) * 0.5})`,
        }} />
      ))}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: RiskAlert["severity"] }) {
  const styles = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
    HIGH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    MEDIUM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function ActionButton({ action }: { action: string }) {
  const styles: Record<string, string> = {
    "INVESTIGATE": "text-amber-400 hover:bg-amber-500/10",
    "ADJUST ODDS": "text-[#0071e3] hover:bg-[#0071e3]/10",
    "LOCK ACCOUNT": "text-red-400 hover:bg-red-500/10",
  };
  return (
    <button className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${styles[action] || "text-white/40 hover:bg-white/5"}`}>
      {action}
    </button>
  );
}

export default function AnalyticsTab() {
  const timeframe = "Real-Time (24h)";


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Analytics Engine</h2>
          <p className="text-white/30 text-sm mt-1">Live data feed from Ledger-Node-Alpha7</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 glass-card border border-white/10 rounded-full text-sm text-white/60 hover:text-white hover:border-white/20 transition-all">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">TIMEFRAME:</span>
          <span className="font-bold">{timeframe}</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: card.accent }} />
            <div className="flex items-start justify-between mb-4">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">{card.label}</p>
              <div className="p-2 rounded-xl" style={{ background: `${card.accent}15`, color: card.accent }}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-white font-mono">{card.value}</p>
            <p className={`text-[10px] mt-2 font-bold ${card.trend === "warn" ? "text-red-400" : card.trend === "up" ? "text-emerald-400" : "text-white/30"}`}>
              {card.trend === "up" && "▲ "}{card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Health Monitor - wide chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">PLATFORM HEALTH MONITOR</h3>
              <p className="text-white/30 text-xs mt-1">Node cluster performance & latency metrics</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-widest">AVG LATENCY</p>
                <p className="text-emerald-400 font-black text-sm">24ms</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase tracking-widest">ERROR RATE</p>
                <p className="text-emerald-400 font-black text-sm">0.002%</p>
              </div>
            </div>
          </div>
          <div className="h-48">
            <MiniBarChart />
          </div>
        </div>

        {/* Financial Mix */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">FINANCIAL MIX</h3>
            <p className="text-white/30 text-xs mt-1">Deposit vs Withdrawal velocity</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">FIAT (USD/EUR)</span>
                <span className="text-sm font-black text-white">62%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#0071e3] rounded-full" style={{ width: "62%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CRYPTO (BTC/ETH/USDT)</span>
                <span className="text-sm font-black text-white">38%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#AFFF00] rounded-full" style={{ width: "38%" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">DEPOSITS</p>
              <p className="text-[#0071e3] font-black text-xl mt-1">$1.2M</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">WITHDRAWALS</p>
              <p className="text-amber-400 font-black text-xl mt-1">$840k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Risk Management Alerts */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-black text-white uppercase tracking-tight">RISK MANAGEMENT ALERTS</h3>
                <p className="text-white/30 text-xs">Live monitoring of high-exposure markets</p>
              </div>
            </div>
            <span className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-full">3 CRITICAL</span>
          </div>
          <div className="divide-y divide-white/5">
            {RISK_ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-5 hover:bg-white/2 transition-colors group">
                <SeverityBadge severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{alert.title}</p>
                  <p className="text-white/30 text-xs mt-0.5 truncate">{alert.desc}</p>
                </div>
                <ActionButton action={alert.action} />
              </div>
            ))}
          </div>
        </div>

        {/* Staff Activity Log */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-black text-white uppercase tracking-tight">STAFF ACTIVITY LOG</h3>
            <p className="text-white/30 text-xs mt-1">System changes and administrative actions</p>
          </div>
          <div className="divide-y divide-white/5">
            {ACTIVITY_LOG.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-4 hover:bg-white/2 transition-colors">
                <div className="mt-0.5 p-2 rounded-lg bg-white/5 text-white/30 flex-shrink-0">
                  {log.icon}
                </div>
                <div>
                  <p className="text-white/70 text-xs leading-relaxed">{log.text}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-white/20" />
                    <p className="text-white/20 text-[10px]">{log.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-xl text-[#0071e3] text-xs font-black uppercase tracking-widest hover:bg-[#0071e3]/20 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export Full Data Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
