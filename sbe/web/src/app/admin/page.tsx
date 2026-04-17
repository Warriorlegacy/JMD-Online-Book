"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AdminMatchRow } from "@/components/admin-match-row";
import { DepositRequestRow } from "@/components/deposit-request-row";
import { AnnouncementManager } from "@/components/announcement-manager";
import type { Match, Tournament } from "@/types";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"matches" | "deposits" | "users" | "announcements">("matches");

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!user || user.role !== "admin") return null;

  // Tabs
  const tabs = [
    { id: "matches", label: "Matches" },
    { id: "deposits", label: "Deposits" },
    { id: "users", label: "Users" },
    { id: "announcements", label: "Announcements" },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-8">Admin Panel</h1>

      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-white/10 mb-6 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-[10px] font-black uppercase tracking-wider transition-all
              ${activeTab === tab.id 
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400' 
                : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "matches" && <MatchesTab />}
        {activeTab === "deposits" && <DepositsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "announcements" && <AnnouncementManager />}
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
    <div className="space-y-4">
      {/* Create Match Toggle */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="w-full py-3 px-4 bg-slate-900/50 border border-white/10 rounded-lg text-left hover:bg-slate-800/50 transition-all"
      >
        <span className="text-cyan-400 font-bold">+</span>{" "}
        <span className="text-white font-bold">Create New Match</span>
      </button>

      {/* Create Match Form */}
      {showCreateForm && (
        <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 -mt-2">
          <h3 className="text-white font-bold mb-4">New Match Details</h3>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Team A</label>
                <input
                  type="text"
                  value={teamA}
                  onChange={e => setTeamA(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:border-cyan-400/50 focus:outline-none transition-all"
                  placeholder="Enter team A name"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Team B</label>
                <input
                  type="text"
                  value={teamB}
                  onChange={e => setTeamB(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:border-cyan-400/50 focus:outline-none transition-all"
                  placeholder="Enter team B name"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Tournament</label>
                <select
                  value={tournamentId}
                  onChange={e => setTournamentId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                >
                  <option value="">Select tournament...</option>
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:border-cyan-400/50 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/50 rounded-lg text-cyan-400 font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Match"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
                className="px-6 py-3 bg-slate-800 border border-white/10 rounded-lg text-slate-400 font-bold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matches List */}
      {matches.map(match => (
        <AdminMatchRow
          key={match.id}
          match={match}
          onSetInPlay={handleSetInPlay}
          onSettle={() => setSettlingMatchId(match.id)}
          isProcessing={processing === match.id}
        />
      ))}

      {/* Settle Modal */}
      {settlingMatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white uppercase italic mb-2">
              Settle Match
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Select the match outcome:
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSettle(settlingMatchId, 'team_a')}
                disabled={processing === settlingMatchId}
                className="py-4 px-3 bg-emerald-500/10 border border-emerald-400/50 rounded-lg text-emerald-400 font-bold text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                Team A Wins
              </button>
              <button
                onClick={() => handleSettle(settlingMatchId, 'team_b')}
                disabled={processing === settlingMatchId}
                className="py-4 px-3 bg-rose-500/10 border border-rose-400/50 rounded-lg text-rose-400 font-bold text-xs uppercase tracking-wider hover:bg-rose-500/20 transition-all disabled:opacity-50"
              >
                Team B Wins
              </button>
              <button
                onClick={() => handleSettle(settlingMatchId, 'draw')}
                disabled={processing === settlingMatchId}
                className="py-4 px-3 bg-amber-500/10 border border-amber-400/50 rounded-lg text-amber-400 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/20 transition-all disabled:opacity-50"
              >
                Draw
              </button>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setSettlingMatchId(null)}
                className="text-slate-500 text-sm hover:text-white transition-colors"
              >
                Cancel
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
        <p className="text-slate-500 text-sm">No pending deposits.</p>
      ) : (
        deposits.map(dep => (
          <DepositRequestRow
            key={dep.id}
            deposit={dep}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={processing === dep.id}
          />
        ))
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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black text-slate-500 uppercase border-b border-white/10">
            <th className="py-2">Username</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Balance</th>
            <th className="py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-white/5 text-sm">
              <td className="py-3 text-white font-bold">{u.username}</td>
              <td className="py-3 text-slate-400">{u.email}</td>
              <td className="py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>{u.role}</span></td>
              <td className="py-3 text-emerald-400">₹{parseFloat(u.balance || '0').toLocaleString()}</td>
              <td className="py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
