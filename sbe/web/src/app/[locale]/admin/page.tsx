"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, XCircle, Clock, Eye, User, FileText, Activity, BarChart3, MessageSquare, Shield, ScrollText, Settings, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { AdminMatchRow } from "@/components/admin-match-row";
import { DepositRequestRow } from "@/components/deposit-request-row";
import { AnnouncementManager } from "@/components/announcement-manager";
import AnalyticsTab from "@/components/admin-analytics-tab";
import SupportTab from "@/components/admin-support-tab";
import OutcomeCenter from "@/components/outcome-center";
import type { Match, Tournament } from "@/types";

type AdminTab = "dashboard" | "analytics" | "support" | "outcomes" | "matches" | "market" | "liability" | "deposits" | "kyc" | "users" | "announcements" | "referrals";

const SIDEBAR_NAV: { id: AdminTab; label: string; icon: React.ReactNode; }[] = [
  { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "analytics", label: "Analytics", icon: <Activity className="w-4 h-4" /> },
  { id: "outcomes", label: "Outcome Center", icon: <Bell className="w-4 h-4" /> },
  { id: "support", label: "Live Chat", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "matches", label: "Bet History", icon: <ScrollText className="w-4 h-4" /> },
  { id: "liability", label: "Risk Management", icon: <Shield className="w-4 h-4" /> },
  { id: "kyc", label: "Audit Logs", icon: <FileText className="w-4 h-4" /> },
];

const TOP_NAV: { id: AdminTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analytics", label: "Analytics" },
  { id: "support", label: "Support" },
  { id: "matches", label: "Staff" },
  { id: "referrals", label: "Reports" },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <div className="py-20 text-center animate-pulse text-primary font-bold">LOADING ADMIN SYSTEM...</div>;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-[#0a0e17] -mt-4 -mx-4">
      {/* Left Sidebar */}
      <aside className="w-52 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1117] py-5 hidden lg:flex">
        {/* Brand */}
        <div className="px-5 mb-8">
          <span className="text-white font-black text-base tracking-tight">Kinetic Admin</span>
        </div>

        {/* Platform Health */}
        <div className="px-4 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">PLATFORM HEALTH</span>
            </div>
            <p className="text-emerald-400/60 text-[9px]">99.9% Uptime | Real-time</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-2">
          {SIDEBAR_NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-[#0071e3]/20 text-[#0071e3] border border-[#0071e3]/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 space-y-2 border-t border-white/5">
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all text-sm">
            <Settings className="w-4 h-4" /><span>System Settings</span>
          </button>
          <button onClick={() => router.push("/")} className="w-full flex items-center gap-2 px-4 py-2.5 text-white/30 hover:text-red-400 rounded-xl hover:bg-red-500/5 transition-all text-sm">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <header className="flex items-center justify-between px-6 h-14 border-b border-white/5 bg-[#0a0e17]/95 backdrop-blur-sm sticky top-0 z-20">
          <nav className="flex items-center gap-1">
            {TOP_NAV.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? "text-white border-b-2 border-[#0071e3]"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Activity className="w-5 h-5 text-white/40" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5 text-white/40" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/30 flex items-center justify-center">
              <User className="w-4 h-4 text-[#0071e3]" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Advanced Tabs overflow for narrower screens */}
          <div className="flex flex-wrap gap-2 p-1 glass rounded-2xl mb-8 border border-white/5 lg:hidden">
            {["matches", "market", "liability", "deposits", "kyc", "users", "announcements", "referrals"].map(id => (
              <button
                key={id}
                onClick={() => setActiveTab(id as AdminTab)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === id
                    ? "bg-primary text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {id}
              </button>
            ))}
          </div>

          <div className="min-h-[600px] animate-in fade-in duration-500">
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "support" && <SupportTab />}
            {activeTab === "outcomes" && <OutcomeCenter />}
            {activeTab === "dashboard" && <AnalyticsTab />}
            {activeTab === "matches" && <MatchesTab />}
            {activeTab === "market" && <MarketControlTab />}
            {activeTab === "liability" && <LiabilityTab />}
            {activeTab === "deposits" && <DepositsTab />}
            {activeTab === "kyc" && <KYCTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "announcements" && <AnnouncementManager />}
            {activeTab === "referrals" && <ReferralsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchesTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [settlingMatchId, setSettlingMatchId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [startTime, setStartTime] = useState("");

  function normalizeMatch(m: any): Match {
    return {
      id: m.id,
      tournamentId: m.tournament_id || m.tournamentId,
      teamA: m.team_a || m.teamA,
      teamB: m.team_b || m.teamB,
      tournamentName: m.tournament_name || m.tournamentName,
      startTime: m.start_time || m.startTime,
      status: m.status,
      sportType: m.sport_type || m.sportType,
      score: m.score,
      elapsedMinutes: m.elapsed_minutes || m.elapsedMinutes,
    };
  }

  const fetchMatches = useCallback(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then((data: any[]) => {
        const normalized = Array.isArray(data) ? data.map(normalizeMatch) : [normalizeMatch(data)];
        setMatches(normalized);
      })
      .catch(() => setMatches([]));
  }, []);

  useEffect(() => {
    fetchMatches();
    fetch('/api/admin/tournaments')
      .then(res => res.json())
      .then(setTournaments)
      .catch(() => setTournaments([]));
  }, [fetchMatches]);

  const handleSetInPlay = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/matches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_play' }),
      });
      if (res.ok) {
        fetchMatches();
      } else {
        console.error('Failed to set match in play');
      }
    } catch (err) {
      console.error(err);
    }
    setProcessing(null);
  };

  const handleSettle = async (id: string, result: 'team_a' | 'team_b' | 'draw') => {
    setProcessing(id);
    setSettlingMatchId(null);
    try {
      const res = await fetch(`/api/admin/matches/${id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      if (res.ok) {
        fetchMatches();
      } else {
        console.error('Failed to settle match');
      }
    } catch (err) {
      console.error(err);
    }
    setProcessing(null);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamA, teamB, tournamentId, startTime }),
      });
      if (res.ok) {
        setShowCreateForm(false);
        setTeamA("");
        setTeamB("");
        setTournamentId("");
        setStartTime("");
        fetchMatches();
      } else {
        setError('Failed to create match');
      }
    } catch {
      setError('Failed to create match');
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
       {/* Create Market Interface */}
       <button
         onClick={() => setShowCreateForm(!showCreateForm)}
         className="w-full py-6 px-8 glass-card border border-white/10 rounded-2xl text-left hover:bg-white/5 transition-all flex items-center justify-between group"
       >
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
             <span className="text-xl font-bold">+</span>
           </div>
           <span className="text-white font-bold text-lg">INITIALIZE NEW MARKET</span>
         </div>
         <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-primary transition-colors">Click to Expand</div>
       </button>
       
       {/* Create Match Form */}
       {showCreateForm && (
         <div className="glass-card border border-white/10 rounded-3xl p-10 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
           <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             MARKET SPECIFICATIONS
           </h3>
           {error && <p className="text-red-400 text-sm mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</p>}
           <form onSubmit={handleCreateMatch} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 ml-1">Operational ID (Team A)</label>
                 <input
                   type="text"
                   value={teamA}
                   onChange={e => setTeamA(e.target.value)}
                   required
                   className="w-full px-5 py-4 glass border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-primary/50 focus:outline-none transition-all"
                   placeholder="E.g. Manchester City"
                 />
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 ml-1">Target Counterpart (Team B)</label>
                 <input
                   type="text"
                   value={teamB}
                   onChange={e => setTeamB(e.target.value)}
                   required
                   className="w-full px-5 py-4 glass border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-primary/50 focus:outline-none transition-all"
                   placeholder="E.g. Arsenal"
                 />
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 ml-1">Tournament Sector</label>
                 <select
                   value={tournamentId}
                   onChange={e => setTournamentId(e.target.value)}
                   required
                   className="w-full px-5 py-4 glass border border-white/10 rounded-xl text-white focus:border-primary/50 focus:outline-none transition-all appearance-none"
                 >
                   <option value="" className="bg-black">Select Sector...</option>
                   {tournaments.map(t => (
                     <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 ml-1">Execution Pipeline (Start Time)</label>
                 <input
                   type="datetime-local"
                   value={startTime}
                   onChange={e => setStartTime(e.target.value)}
                   required
                   className="w-full px-5 py-4 glass border border-white/10 rounded-xl text-white focus:border-primary/50 focus:outline-none transition-all [color-scheme:dark]"
                 />
               </div>
             </div>
             <div className="flex gap-4 pt-4">
               <button
                 type="submit"
                 disabled={creating}
                 className="px-10 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,113,227,0.3)] active:scale-95"
               >
                 {creating ? "EXECUTING..." : "DEPLOY MARKET"}
               </button>
               <button
                 type="button"
                 onClick={() => {
                   setShowCreateForm(false);
                   setError(null);
                 }}
                 className="px-8 py-4 glass border border-white/10 rounded-xl text-white/60 font-bold hover:text-white hover:bg-white/5 transition-all"
               >
                 ABORT
               </button>
             </div>
           </form>
         </div>
       )}
 
       {/* Matches List */}
       <div className="space-y-4">
         {matches.map(match => (
           <AdminMatchRow
             key={match.id}
             match={match}
             onSetInPlay={handleSetInPlay}
             onSettle={() => setSettlingMatchId(match.id)}
             isProcessing={processing === match.id}
           />
         ))}
       </div>
 
       {/* Settle Modal */}
        {settlingMatchId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass-card border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16 blur-2xl" />
             <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
               FINALIZE SETTLEMENT
             </h3>
             <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-8">
               SELECT DEFINITIVE MARKET OUTCOME
             </p>
             <div className="grid grid-cols-1 gap-4">
               <button
                 onClick={() => handleSettle(settlingMatchId, 'team_a')}
                 disabled={processing === settlingMatchId}
                 className="group relative py-5 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50 overflow-hidden"
               >
                 <div className="flex items-center justify-between relative z-10">
                   <span>TEAM A PERFORMANCE VICTORY</span>
                   <CheckCircle2 className="w-4 h-4" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
               <button
                 onClick={() => handleSettle(settlingMatchId, 'team_b')}
                 disabled={processing === settlingMatchId}
                 className="group relative py-5 px-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50 overflow-hidden"
               >
                 <div className="flex items-center justify-between relative z-10">
                   <span>TEAM B COUNTERPART VICTORY</span>
                   <XCircle className="w-4 h-4" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
               <button
                 onClick={() => handleSettle(settlingMatchId, 'draw')}
                 disabled={processing === settlingMatchId}
                 className="group relative py-5 px-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 font-bold text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50 overflow-hidden"
               >
                 <div className="flex items-center justify-between relative z-10">
                   <span>EQUILIBRIUM (DRAW)</span>
                   <Clock className="w-4 h-4" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               </button>
             </div>
             <div className="mt-8 text-center">
               <button
                 onClick={() => setSettlingMatchId(null)}
                 className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
               >
                 Abort Settlement
               </button>
             </div>
           </div>
          </div>
        )}
    </div>
  );
}

function DepositsTab() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/deposits')
      .then(res => res.json())
      .then(setDeposits);
  }, []);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    const res = await fetch(`/api/admin/deposits/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      setDeposits(prev => prev.filter(d => d.id !== id));
    }
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    const res = await fetch(`/api/admin/deposits/${id}/reject`, { method: 'POST' });
    if (res.ok) {
      setDeposits(prev => prev.filter(d => d.id !== id));
    }
    setProcessing(null);
  };

  return (
    <div className="space-y-4">
       {deposits.length === 0 ? (
         <div className="glass-card p-12 text-center rounded-3xl border border-white/5">
           <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">No pending deposits</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 gap-4">
           {deposits.map(dep => (
             <DepositRequestRow
               key={dep.id}
               deposit={dep}
               onApprove={handleApprove}
               onReject={handleReject}
               isProcessing={processing === dep.id}
             />
           ))}
         </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return (
    <div className="overflow-x-auto glass-card rounded-3xl border border-white/5 animate-in slide-in-from-bottom-4 duration-500">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-bold text-white/40 uppercase border-b border-white/5 bg-white/2">
            <th className="py-6 px-8 tracking-widest">Operator / User</th>
            <th className="py-6 px-8 tracking-widest">Network / Email</th>
            <th className="py-6 px-8 tracking-widest">Privileges</th>
            <th className="py-6 px-8 tracking-widest">Balance (INR)</th>
            <th className="py-6 px-8 tracking-widest">Provisioned</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map(u => (
            <tr key={u.id} className="text-sm hover:bg-white/5 transition-all group">
              <td className="py-6 px-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {String(u.username || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-white font-bold group-hover:text-primary transition-colors">{u.username}</span>
                </div>
              </td>
              <td className="py-6 px-8 text-white/40 font-medium">{u.email}</td>
              <td className="py-6 px-8">
                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                  {u.role}
                </span>
              </td>
              <td className="py-6 px-8">
                <span className="text-emerald-400 font-mono font-bold">
                  ₹{parseFloat(u.balance || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </td>
              <td className="py-6 px-8 text-white/20 text-xs font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KYCTab() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [decision, setDecision] = useState<"verified" | "rejected">("verified");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/admin/kyc/queue');
      if (!res.ok) throw new Error("Failed to fetch KYC queue");
      const data = await res.json();
      setQueue(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleViewDocuments = async (user: any) => {
    setSelectedUser(user);
    setDocUrls({});
    
    if (!user.documents) return;

    const urls: Record<string, string> = {};
    for (const [key, path] of Object.entries(user.documents)) {
      if (typeof path === 'string') {
        try {
          const res = await fetch(`/api/admin/kyc/document/${path}`);
          const data = await res.json();
          urls[key] = data.url;
        } catch (e) {
          console.error(`Failed to fetch URL for ${key}`, e);
        }
      }
    }
    setDocUrls(urls);
  };

  const handleReview = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          decision,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to review KYC");
      
      setSelectedUser(null);
      setNotes("");
      fetchQueue();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 ml-1">PENDING VERIFICATIONS</h2>
          {queue.length === 0 ? (
            <div className="glass-card rounded-3xl border border-white/5 p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">ALL OPERATORS VERIFIED</p>
            </div>
          ) : (
            queue.map((user) => (
              <div 
                key={user.id}
                onClick={() => handleViewDocuments(user)}
                className={cn(
                  "p-8 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group",
                  selectedUser?.id === user.id 
                    ? "glass bg-primary/20 border-primary/40 shadow-[0_0_30px_rgba(0,113,227,0.2)]" 
                    : "glass border-white/5 text-white/70 hover:bg-white/5"
                )}
              >
                {selectedUser?.id === user.id && <div className="absolute left-0 top-0 w-1 h-full bg-primary" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                      selectedUser?.id === user.id ? "bg-primary text-white" : "bg-white/5 text-white/40"
                    )}>
                      <User className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-white">{user.username}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 flex items-center gap-2">
                      <Clock className="w-3 h-3 animate-spin duration-7000" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">AWAITING REVIEW</span>
                    </div>
                    <Eye className={cn("w-6 h-6 transition-all duration-300", selectedUser?.id === user.id ? "text-primary scale-110" : "opacity-0 group-hover:opacity-100")} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
  
        <div className="lg:col-span-6">
          {selectedUser ? (
            <div className="glass-card rounded-3xl border border-white/10 p-12 sticky top-12 space-y-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full border border-primary/20 text-[9px] font-bold tracking-widest uppercase mb-2">
                  KYC CASE ID: {String(selectedUser?.id || "UUID").substring(0,8).toUpperCase()}
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Operator Analysis</h2>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Submitting Entity: {selectedUser.username}</p>
              </div>
              
              <div className="space-y-8">
                <div className="p-8 rounded-3xl glass border border-white/5 space-y-6">
                   <div className="flex items-center gap-3 text-primary mb-2">
                      <User className="w-5 h-5" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">BIOSPATIAL DATA</span>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-2 tracking-widest">Date of Birth</p>
                        <p className="text-sm font-bold text-white font-mono">{selectedUser.documents?.dob || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-2 tracking-widest">Registered Address</p>
                        <p className="text-sm font-bold text-white leading-relaxed">{selectedUser.documents?.address || "N/A"}</p>
                      </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-primary mb-2">
                      <FileText className="w-5 h-5" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">DOCUMENTATION VAULT</span>
                   </div>
                  <div className="grid grid-cols-1 gap-4">
                      {Object.entries(selectedUser.documents || {}).map(([key]) => {
                       if (key === 'dob' || key === 'address') return null;
                       return (
                         <a 
                           key={key} 
                           href={docUrls[key]} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-between p-6 rounded-2xl glass border border-white/5 hover:bg-white/5 hover:border-primary/30 transition-all group"
                         >
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-primary transition-colors">
                               <FileText className="w-5 h-5" />
                             </div>
                             <span className="text-[10px] font-bold text-white uppercase tracking-widest">{key}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold text-white/20 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Preview Document</span>
                             <Eye className="w-5 h-5 text-white/20 group-hover:text-primary transition-all" />
                           </div>
                         </a>
                       );
                     })}
                  </div>
               </div>
             </div>
  
             <div className="space-y-8 pt-8 border-t border-white/10">
               <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">SYSTEM ANALYST NOTES</label>
                 <textarea 
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   className="w-full glass border border-white/10 rounded-2xl p-5 text-sm font-medium text-white focus:outline-none focus:border-primary/50 transition-all placeholder-white/10"
                   rows={4}
                   placeholder="Enter decision rationale or observations..."
                 />
               </div>
  
               <div className="grid grid-cols-2 gap-6">
                 <button 
                   onClick={() => { setDecision("rejected"); }}
                   className={cn(
                     "h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border",
                     decision === "rejected" 
                      ? "bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)]" 
                      : "glass border-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                   )}
                 >
                   <XCircle className="w-4 h-4" /> TERMINATE CASE
                 </button>
                 <button 
                   onClick={() => { setDecision("verified"); }}
                   className={cn(
                     "h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border",
                     decision === "verified" 
                      ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]" 
                      : "glass border-white/5 text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                   )}
                 >
                   <CheckCircle2 className="w-4 h-4" /> AUTHORIZE ACCESS
                 </button>
               </div>
  
               <button 
                 onClick={handleReview}
                 disabled={loading}
                 className="w-full h-16 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(0,113,227,0.4)]"
               >
                 {loading ? "COMMITTING DATA..." : "FINALIZE VERIFICATION"}
               </button>
             </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl border border-white/5 p-32 text-center space-y-8 animate-in fade-in duration-1000">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group">
                <Eye className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">VERIFICATION ENGINE READY</p>
                <p className="text-white/20 text-[9px] font-medium uppercase tracking-widest">Select an entity from the queue to initiate analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

function LiabilityTab() {
  const [data, setData] = useState<any>(null);
  const { connected, subscribe, on } = useSocket();
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/admin/liability')
      .then(res => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (connected) {
      subscribe("global");
    }
  }, [connected, subscribe]);

  useEffect(() => {
    const unsub = on<any>("notification", (alert) => {
      if (alert.notifType === "alert") {
        setRiskAlerts(prev => [alert, ...prev].slice(0, 5));
      }
    });
    return () => unsub();
  }, [on]);

  if (!data) return <div className="glass-card p-20 text-center rounded-3xl border border-white/5 text-white/20 uppercase font-bold tracking-widest text-xs">QUANTIFYING RISK...</div>;

  return (
    <div className="space-y-12">
      {/* Real-time Alerts */}
      {riskAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1 animate-pulse">CRITICAL RISK INTERVENTIONS</h2>
          {riskAlerts.map((alert, i) => (
            <div key={i} className="glass-card border border-red-500/30 bg-red-500/5 p-6 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
                    <Shield className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-tight">{alert.title}</h4>
                    <p className="text-white/50 text-xs mt-1">{alert.body}</p>
                 </div>
               </div>
               <button className="px-6 py-3 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all">
                 {alert.cta}
               </button>
            </div>
          ))}
        </div>
      )}

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-10 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">NET GLOBAL EXPOSURE</p>
          <p className="text-4xl font-mono font-bold text-white">₹{data.total.exposure.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase">
             <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
             ACTIVE LIQUIDITY RISK
          </div>
        </div>
        <div className="glass-card p-10 rounded-3xl border border-white/10 relative overflow-hidden">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">ACTIVE COUNTERPARTS</p>
          <p className="text-4xl font-mono font-bold text-white">{data.total.activeUsers}</p>
          <div className="mt-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">UNIQUE POSITIONS</div>
        </div>
        <div className="glass-card p-10 rounded-3xl border border-white/10 relative overflow-hidden">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">OPEN EXECUTIONS</p>
          <p className="text-4xl font-mono font-bold text-white">{data.total.openOrders}</p>
          <div className="mt-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">PENDING SETTLEMENT</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 ml-1">RISK BY MARKET SECTOR</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {data.bySport.map((sport: any) => (
               <div key={sport.sportType} className="glass border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all">
                 <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">{sport.sportType}</p>
                 <p className="text-2xl font-mono font-bold text-white mb-2">₹{sport.exposure.toLocaleString()}</p>
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{sport.orderCount} OPEN POSITIONS</p>
                 <div className="mt-6 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min((sport.exposure / data.total.exposure) * 100, 100)}%` }} 
                    />
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-12">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-6 ml-1">TOP RISK PROFILES (USER-LEVEL)</h2>
          <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-white/40 uppercase bg-white/2 border-b border-white/5">
                    <th className="py-6 px-10">ENTITY</th>
                    <th className="py-6 px-10">TOTAL EXPOSURE</th>
                    <th className="py-6 px-10">POSITION COUNT</th>
                    <th className="py-6 px-10 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.byUser.map((user: any) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-all">
                      <td className="py-6 px-10 font-bold text-white">{user.username}</td>
                      <td className="py-6 px-10 text-red-400 font-mono font-bold">₹{user.exposure.toLocaleString()}</td>
                      <td className="py-6 px-10 text-white/30 font-mono">{user.orderCount}</td>
                      <td className="py-6 px-10 text-right">
                        <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">VIEW LEDGER</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketControlTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [selection, setSelection] = useState<string>("team_a");
  const [type, setType] = useState<"back" | "lay">("back");
  const [price, setPrice] = useState<string>("2.00");
  const [stake, setStake] = useState<string>("1000");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        setMatches(data);
        if (data.length > 0) setSelectedMatch(data[0].id);
      });
  }, []);

  const handleInject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/market/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: selectedMatch,
          selectionId: selection,
          type,
          price: parseFloat(price),
          stake: parseFloat(stake)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `LIQUIDITY INJECTED: ${stake} AT ${price}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'INJECTION FAILED' });
      }
    } catch {
      setMessage({ type: 'error', text: 'COMMUNICATIONS FAILURE' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="glass-card rounded-[2.5rem] border border-white/10 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Market Liquidity Engine</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Autonomous System Intervention</p>
          </div>
        </div>

        {message && (
          <div className={cn(
            "p-5 rounded-2xl border mb-8 animate-in zoom-in-95 duration-300",
            message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          )}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleInject} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Target Market (Match)</label>
              <select 
                value={selectedMatch}
                onChange={e => setSelectedMatch(e.target.value)}
                className="w-full h-16 glass border border-white/10 rounded-2xl px-6 text-white text-sm font-bold focus:border-primary/50 outline-none appearance-none"
              >
                {matches.map(m => (
                  <option key={m.id} value={m.id} className="bg-black">{m.teamA} v {m.teamB}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Outcome Selection</label>
              <select 
                value={selection}
                onChange={e => setSelection(e.target.value)}
                className="w-full h-16 glass border border-white/10 rounded-2xl px-6 text-white text-sm font-bold focus:border-primary/50 outline-none appearance-none"
              >
                <option value="team_a" className="bg-black">TEAM A</option>
                <option value="team_b" className="bg-black">TEAM B</option>
                <option value="draw" className="bg-black">DRAW (EQUILIBRIUM)</option>
              </select>
            </div>
          </div>

          <div className="flex p-1 glass rounded-2xl border border-white/5 h-16">
            <button 
              type="button"
              onClick={() => setType("back")}
              className={cn(
                "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                type === "back" ? "bg-[#0071e3] text-white shadow-[0_0_20px_rgba(0,113,227,0.4)]" : "text-white/40 hover:text-white"
              )}
            >
              INJECT BACK LIQUIDITY
            </button>
            <button 
              type="button"
              onClick={() => setType("lay")}
              className={cn(
                "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                type === "lay" ? "bg-[#f54242] text-white shadow-[0_0_20px_rgba(245,66,66,0.4)]" : "text-white/40 hover:text-white"
              )}
            >
              INJECT LAY LIQUIDITY
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Execution Price (Decimal)</label>
              <input 
                type="number" 
                step="0.01" 
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full h-16 glass border border-white/10 rounded-2xl px-6 text-white font-mono font-bold focus:border-primary/50 outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Volume (Stake INR)</label>
              <input 
                type="number" 
                value={stake}
                onChange={e => setStake(e.target.value)}
                className="w-full h-16 glass border border-white/10 rounded-2xl px-6 text-white font-mono font-bold focus:border-primary/50 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            {loading ? "PROCESSING PIPELINE..." : "COMMIT INJECTION TO LEDGER"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ReferralsTab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/referrals')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="glass-card p-20 text-center rounded-3xl border border-white/5 text-white/20 uppercase font-bold tracking-widest text-xs">COLLECTING NETWORK DATA...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-10 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">TOTAL NETWORK REFERRALS</p>
          <p className="text-4xl font-mono font-bold text-white">{data.stats.total_referrals}</p>
        </div>
        <div className="glass-card p-10 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700" />
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">TOTAL COMMISSIONS DISBURSED</p>
          <p className="text-4xl font-mono font-bold text-white">₹{parseFloat(data.stats.total_commissions).toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/2">
          <h2 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">TOP ARCHITECTS (REFERRERS)</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-bold text-white/30 uppercase border-b border-white/5 tracking-[0.2em]">
              <th className="py-6 px-10">OPERATOR</th>
              <th className="py-6 px-10 text-center">NETWORK SIZE</th>
              <th className="py-6 px-10 text-center">REFERRAL CODE</th>
              <th className="py-6 px-10 text-right">TOTAL REVENUE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.referrers.map((ref: any) => (
              <tr key={ref.id} className="hover:bg-white/5 transition-all group">
                <td className="py-6 px-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                      {String(ref.username || "R")[0].toUpperCase()}
                    </div>
                    <span className="text-white font-bold group-hover:text-primary transition-colors">{ref.username}</span>
                  </div>
                </td>
                <td className="py-6 px-10 text-center font-mono text-white/60">{ref.referred_count}</td>
                <td className="py-6 px-10 text-center font-mono text-primary font-bold">{ref.referral_code}</td>
                <td className="py-6 px-10 text-right text-emerald-400 font-mono font-bold">₹{parseFloat(ref.total_earned).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
