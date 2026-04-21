"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Eye, FileText, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminKYCPage() {
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
      const res = await fetch("/api/admin/kyc/queue");
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
      const res = await fetch("/api/admin/kyc/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">KYC Approval Queue</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Review and verify user identities</p>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Pending: {queue.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Queue List */}
        <div className="lg:col-span-7 space-y-4">
          {queue.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-20 text-center space-y-4 backdrop-blur-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No pending requests</p>
            </div>
          ) : (
            queue.map((user) => (
              <div 
                key={user.id}
                onClick={() => handleViewDocuments(user)}
                className={cn(
                  "p-6 rounded-3xl border transition-all cursor-pointer group",
                  selectedUser?.id === user.id ? "bg-white text-slate-950 border-white shadow-xl" : "bg-slate-900/40 border-white/5 text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      selectedUser?.id === user.id ? "bg-slate-950 text-white" : "bg-white/5 text-slate-400"
                    )}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase italic tracking-tight">{user.username}</p>
                      <p className="text-[10px] font-medium opacity-60">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Pending</span>
                    </div>
                    <Eye className={cn("w-5 h-5 transition-opacity", selectedUser?.id === user.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-5">
          {selectedUser ? (
            <div className="rounded-[3rem] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl shadow-2xl sticky top-12 space-y-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Review Application</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">User: {selectedUser.username}</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Personal Details</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">DOB</p>
                        <p className="text-xs font-bold text-white">{selectedUser.documents?.dob || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Address</p>
                        <p className="text-xs font-bold text-white line-clamp-2">{selectedUser.documents?.address || "N/A"}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Documents</span>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                      {Object.entries(selectedUser.documents || {}).map(([key]) => {
                        if (key === 'dob' || key === 'address') return null;
                        return (
                          <a 
                            key={key} 
                            href={docUrls[key]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">{key}</span>
                            </div>
                            <Eye className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                          </a>
                        );
                      })}
                   </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Reviewer Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 transition-all"
                    rows={3}
                    placeholder="Reason for rejection or internal notes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => { setDecision("rejected"); }}
                    className={cn(
                      "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                      decision === "rejected" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <XCircle className="mr-2 w-4 h-4" /> Reject
                  </Button>
                  <Button 
                    onClick={() => { setDecision("verified"); }}
                    className={cn(
                      "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                      decision === "verified" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" /> Approve
                  </Button>
                </div>

                <Button 
                  onClick={handleReview}
                  disabled={loading}
                  className="w-full h-14 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                >
                  {loading ? "Processing..." : "Submit Decision"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-[3rem] border border-white/5 bg-slate-900/40 p-20 text-center space-y-4 backdrop-blur-3xl">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Select a user to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
