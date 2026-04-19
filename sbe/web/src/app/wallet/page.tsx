"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronLeft
} from "lucide-react";

const PLATFORM_UPI = "6202442690@ptyes";
const MIN_DEPOSIT = 100;
const MIN_WITHDRAW = 200;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all ${copied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
    >
      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function WalletPage() {
      const { user, loading: authLoading } = useAuth();
      const { connected, on } = useSocket();
  const [tab, setTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [balance, setBalance] = useState<{ available: number; locked: number }>({ available: 0, locked: 0 });
  const [history, setHistory] = useState<{ deposits: any[]; withdrawals: any[] }>({ deposits: [], withdrawals: [] });
  
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      const [balRes, histRes] = await Promise.all([
        fetch("/api/wallet/balance"),
        fetch("/api/wallet/transactions")
      ]);
      if (balRes.ok) {
        const balData = await balRes.json();
        // backend returns { balance: string, lockedBalance: string }
        setBalance({
          available: parseFloat(balData.balance || balData.available || "0"),
          locked: parseFloat(balData.lockedBalance || balData.locked || "0")
        });
      }
      if (histRes.ok) {
        setHistory(await histRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch wallet data", err);
    }
  };

   useEffect(() => {
     if (user) {
       fetchData();
     }
   }, [user]);

   useEffect(() => {
     if (!connected || !user) return;
     const unsubscribe = on<{ userId: string; available: number; locked: number }>("balance_update", (data) => {
       if (data.userId === user.id) {
         setBalance({ available: data.available, locked: data.locked });
       }
     });
     return () => unsubscribe();
   }, [connected, user, on]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, upiId, utrNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit deposit");
      setSuccessMessage(data.message);
      setStep(1);
      setAmount("");
      setUpiId("");
      setUtrNumber("");
      fetchData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, upiId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit withdrawal");
      setSuccessMessage(data.message);
      setAmount("");
      setUpiId("");
      fetchData();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Balance & Stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-linear-to-br from-indigo-600 to-blue-700 p-8 shadow-2xl shadow-blue-900/40">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Currency</span>
                  <p className="text-sm font-bold text-white uppercase">INR (₹)</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">Dynamic Balance</span>
                <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black tracking-tighter text-white whitespace-nowrap">
                       ₹ {balance.available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                     </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10 mt-4">
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase text-white/50 mb-1">In-Play Stake</p>
                   <p className="text-sm font-bold text-white">₹ {balance.locked.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[9px] font-bold uppercase text-white/50 mb-1">Status</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-300">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 space-y-4 backdrop-blur-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setTab("deposit")}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${tab === "deposit" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"}`}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Deposit</span>
              </button>
              <button 
                onClick={() => setTab("withdraw")}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${tab === "withdraw" ? "bg-pink-500/10 border-pink-500/30 text-pink-400" : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"}`}
              >
                <ArrowDownLeft className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Withdraw</span>
              </button>
            </div>
            <button 
              onClick={() => setTab("history")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${tab === "history" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
              </div>
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Form */}
        <div className="lg:col-span-7">
          <div className="rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-3xl h-full min-h-[500px]">
            
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold">{successMessage}</p>
                <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-300 hover:text-white">✕</button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold">{errorMessage}</p>
                <button onClick={() => setErrorMessage("")} className="ml-auto text-red-300 hover:text-white">✕</button>
              </div>
            )}

            {tab === "deposit" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Deposit Funds</h2>
                  <p className="text-sm text-slate-500 font-medium">Add balance to start trading with 30-min verification.</p>
                </div>

                {step === 1 ? (
                  <form onSubmit={(e) => { e.preventDefault(); if (parseFloat(amount) >= MIN_DEPOSIT) setStep(2); }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Recharge Amount (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-600">₹</span>
                        <input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          placeholder={`${MIN_DEPOSIT}+`}
                          className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 text-2xl font-black text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder:text-slate-800"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        {[500, 1000, 5000, 10000].map(v => (
                          <button 
                            key={v} 
                            type="button" 
                            onClick={() => setAmount(String(v))}
                            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                          >
                            ₹{v.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={parseFloat(amount) < MIN_DEPOSIT}
                      className="w-full h-14 bg-white text-slate-950 font-black rounded-2xl shadow-xl shadow-white/10 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleDepositSubmit} className="space-y-6">
                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors mb-2">
                      <ChevronLeft className="w-4 h-4" /> Back to amount
                    </button>
                    
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Transfer Target</p>
                          <p className="text-lg font-black text-cyan-400">{PLATFORM_UPI}</p>
                        </div>
                        <CopyButton text={PLATFORM_UPI} />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Required Amount</p>
                          <p className="text-lg font-black text-white">₹{parseFloat(amount).toLocaleString()}</p>
                        </div>
                        <CopyButton text={amount} />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">UTR / Transaction ID (12 Digits)</label>
                        <input 
                          type="text" 
                          value={utrNumber} 
                          onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          placeholder="0000 0000 0000"
                          className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-mono tracking-[0.2em]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Sender UPI ID</label>
                        <input 
                          type="text" 
                          value={upiId} 
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@bank"
                          className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || utrNumber.length < 12}
                      className="w-full h-14 bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/40 hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Payment"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {tab === "withdraw" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Withdraw Funds</h2>
                  <p className="text-sm text-slate-500 font-medium">Funds will reach your UPI ID in 24 hours.</p>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Withdrawal Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-600">₹</span>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder={`${MIN_WITHDRAW}+`}
                        className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl pl-10 pr-6 text-2xl font-black text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all placeholder:text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Your Receiver UPI ID</label>
                    <input 
                      type="text" 
                      value={upiId} 
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                      required
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-amber-500/80">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-[10px] font-semibold leading-relaxed uppercase">
                      Ensure UPI ID is correct. SBE is not responsible for funds sent to incorrect accounts. 24h cooldown applies.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting || parseFloat(amount) < MIN_WITHDRAW || !upiId}
                    className="w-full h-14 bg-pink-600 text-white font-black rounded-2xl shadow-xl shadow-pink-900/40 hover:bg-pink-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Withdraw ₹${parseFloat(amount || "0").toLocaleString()}`}
                  </button>
                </form>
              </div>
            )}

            {tab === "history" && (
              <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Ledger History</h2>
                  <p className="text-sm text-slate-500 font-medium">Recently updated transactions activity logs.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {[...history.deposits, ...history.withdrawals]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((item, idx) => {
                    const isDeposit = 'utrNumber' in item;
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isDeposit ? "bg-emerald-500/10 text-emerald-400" : "bg-pink-500/10 text-pink-400"}`}>
                            {isDeposit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-wider">{isDeposit ? "Deposit" : "Withdrawal"}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{new Date(item.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black ${isDeposit ? "text-emerald-400" : "text-pink-400"}`}>
                            {isDeposit ? "+" : "-"} ₹ {parseFloat(item.amount).toLocaleString()}
                          </p>
                          <div className="flex justify-end pt-1">
                            <TransactionStatus status={item.status} />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {(history.deposits.length + history.withdrawals.length) === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-20">
                      <History className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase tracking-[0.2em]">No Activity Records</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}

function TransactionStatus({ status }: { status: string }) {
  const styles = {
    pending: "text-amber-500 bg-amber-500/10",
    approved: "text-emerald-500 bg-emerald-500/10",
    completed: "text-emerald-500 bg-emerald-500/10",
    rejected: "text-red-500 bg-red-500/10",
  }[status] || "text-slate-500 bg-white/5";

  return (
    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${styles}`}>
      {status}
    </span>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
);
