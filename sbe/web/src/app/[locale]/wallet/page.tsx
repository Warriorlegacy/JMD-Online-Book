"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { useTranslations } from "next-intl";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  Coins,
  Bitcoin,
    Upload,
      Lock
} from "lucide-react";

const PLATFORM_UPI = "6202442690@ptyes";
const MIN_DEPOSIT = 100;
const MIN_WITHDRAW = 200;

function CurrencyCard({ name, code, balance, value, color, icon }: { name: string, code: string, balance: string, value: string, color: string, icon: React.ReactNode }) {
  return (
    <div className={`p-5 rounded-2xl bg-white/5 border border-white/5 border-l-4 ${color} space-y-4 group hover:bg-white/10 transition-all`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{name}</h4>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{code}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-white/20 uppercase font-bold">Value (USD)</p>
          <p className="text-xs font-bold text-white">{value}</p>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[8px] text-white/20 uppercase font-bold">Balance</p>
          <p className="text-sm font-black text-white">{balance}</p>
        </div>
        <div className="w-16 h-6 bg-white/2 rounded-md overflow-hidden flex items-end gap-0.5 px-1 pb-0.5 opacity-30">
          {[40, 60, 50, 90, 70, 80].map((h, i) => (
            <div key={i} className={`flex-1 rounded-t-[1px] ${color.replace('border-l-', 'bg-')}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KYCChecklist() {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
          <span className="w-2 h-2 bg-[#0071e3] rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-[#0071e3] uppercase tracking-widest">Level 1 ACTIVE</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="w-10 h-10 bg-[#0071e3]/10 rounded-xl flex items-center justify-center text-[#0071e3] mb-4">
          <Shield className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tight">Identity Verification</h3>
        <p className="text-[10px] text-white/40 font-medium leading-relaxed">Upgrade to Level 2 to unlock higher withdrawal limits and premium features.</p>
      </div>

      <div className="space-y-3">
        {[
          { label: "Email Verification", status: "Verified", icon: <CheckCircle2 className="w-3 h-3" />, active: true },
          { label: "Government ID", status: "Pending", icon: <Upload className="w-3 h-3" />, active: false, current: true },
          { label: "Proof of Address", status: "Locked", icon: <Lock className="w-3 h-3" />, active: false, locked: true },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${item.current ? "bg-[#0071e3]/5 border-[#0071e3]/30 ring-1 ring-[#0071e3]/30" : "bg-white/2 border-white/5 opacity-60"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.active ? "bg-emerald-500/20 text-emerald-400" : item.current ? "bg-[#0071e3]/20 text-[#0071e3]" : "bg-white/5 text-white/20"}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white">{item.label}</p>
              <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">{item.status}</p>
            </div>
            {item.current && (
              <button className="text-[9px] font-black uppercase tracking-widest text-[#0071e3] hover:underline">Start</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
      className={`p-2 rounded-lg transition-all ${copied ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
    >
      {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function WalletPage() {
  const t = useTranslations("Common");
  const walletT = useTranslations("Common.wallet");
  const bettingT = useTranslations("Common.betting");
  const errorsT = useTranslations("Common.errors");
  const { user, loading: authLoading } = useAuth();
  const { connected, on } = useSocket();
  const [tab, setTab] = useState<"deposit" | "withdraw" | "history" | "bets">("deposit");
  const [balance, setBalance] = useState<{ available: number; locked: number }>({ available: 0, locked: 0 });
  const [history, setHistory] = useState<{ deposits: any[]; withdrawals: any[] }>({ deposits: [], withdrawals: [] });
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const [cashOutValues, setCashOutValues] = useState<Record<string, string>>({});

  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [provider, setProvider] = useState<"stripe" | "simulation" | "manual">("simulation");

  const fetchData = async () => {
    try {
      const [balRes, histRes] = await Promise.all([
        fetch("/api/wallet/balance"),
        fetch("/api/wallet/transactions")
      ]);
      if (balRes.ok) {
        const balData = await balRes.json();
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

  const fetchBets = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/bets/active/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveBets(data);
        
        const values: Record<string, string> = {};
        await Promise.all(data.map(async (bet: any) => {
          const valRes = await fetch(`/api/bets/cashout-value/${bet.id}`);
          if (valRes.ok) {
            const valData = await valRes.json();
            values[bet.id] = valData.cashOutValue;
          }
        }));
        setCashOutValues(values);
      }
    } catch (err) {
      console.error("Failed to fetch active bets", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (tab === "bets") {
        fetchBets();
      }
    }
  }, [user, tab, fetchBets]);

  useEffect(() => {
    if (!connected || !user) return;
    const unsubscribe = on<{ userId: string; available: number; locked: number }>("balance_update", (data) => {
      if (data.userId === user.id) {
        setBalance({ available: data.available, locked: data.locked });
      }
    });
    const unsubscribeUpdate = on<{ message: string }>("wallet_update", (data) => {
      setSuccessMessage(data.message);
      fetchData();
    });
    return () => {
      unsubscribe();
      unsubscribeUpdate();
    };
  }, [connected, user, on]);

  const handleFastPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/wallet/deposit/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.confirmation) {
        setSuccessMessage(data.confirmation);
        setAmount("");
        setStep(1);
        fetchData();
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
    } catch (err: any) {
      setErrorMessage(err.message);
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
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashOut = async (betId: string) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/bets/cashout/${betId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cash out failed");
      setSuccessMessage(`Successfully cashed out bet! Received ₹${data.cashOutValue}`);
      fetchBets();
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Balance & Assets ─────────────────────────── */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Main Balance Hero */}
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0071e3] to-[#005eb2] p-8 shadow-2xl shadow-[#0071e3]/20">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-3.5 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">{walletT("currency")}</span>
                  <p className="text-sm font-black text-white">INR</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{walletT("balance")}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter text-white">
                    ₹ {balance.available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-6 pt-6 border-t border-white/10">
                <div className="flex-1">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">{walletT("locked_balance")}</p>
                  <p className="text-sm font-bold text-white">₹ {balance.locked.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">{walletT("status")}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#AFFF00] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-[#AFFF00] uppercase tracking-widest">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setTab("deposit")}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all ${tab === "deposit" ? "bg-[#0071e3] border-[#0071e3] text-white shadow-xl shadow-[#0071e3]/20" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{walletT("deposit")}</span>
            </button>
            <button 
              onClick={() => setTab("withdraw")}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all ${tab === "withdraw" ? "bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{walletT("withdraw")}</span>
            </button>
          </div>

          {/* Asset Grid (BTC/ETH) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Crypto Assets</h3>
              <button className="text-[9px] font-black text-[#0071e3] uppercase hover:underline">Manage</button>
            </div>
            <CurrencyCard 
              name="Bitcoin" code="BTC" balance="0.042 BTC" value="$2,840.12" color="border-l-[#F7931A]" 
              icon={<Bitcoin className="w-4 h-4 text-[#F7931A]" />} 
            />
            <CurrencyCard 
              name="Ethereum" code="ETH" balance="1.24 ETH" value="$3,150.45" color="border-l-[#627EEA]" 
              icon={<Coins className="w-4 h-4 text-[#627EEA]" />} 
            />
          </div>

          {/* History / Bets Links */}
          <div className="space-y-2">
            <button 
              onClick={() => setTab("bets")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 transition-all hover:bg-white/5 ${tab === "bets" ? "border-[#0071e3]/30" : ""}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-4 h-4 ${tab === "bets" ? "text-[#0071e3]" : "text-white/20"}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{bettingT("bet_history")}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/10" />
            </button>
            <button 
              onClick={() => setTab("history")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 transition-all hover:bg-white/5 ${tab === "history" ? "border-[#0071e3]/30" : ""}`}
            >
              <div className="flex items-center gap-3">
                <History className={`w-4 h-4 ${tab === "history" ? "text-[#0071e3]" : "text-white/20"}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{walletT("transaction_history")}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/10" />
            </button>
          </div>
        </div>

        {/* ── Middle Column: Forms & Content ────────────────────────── */}
        <div className="xl:col-span-5">
          <div className="glass-card rounded-[2.5rem] border border-white/5 p-10 min-h-[600px] relative overflow-hidden">
            {/* ... rest of the forms ... */}
            
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold">{successMessage}</p>
                <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-200">✕</button>
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
                  <h2 className="text-2xl font-bold tracking-tight text-white">{walletT("deposit_funds")}</h2>
                  <p className="text-sm text-slate-400 font-medium">{walletT("deposit_desc")}</p>
                </div>
                
                {step === 1 ? (
                  <form onSubmit={(e) => { e.preventDefault(); if (parseFloat(amount) >= MIN_DEPOSIT) setStep(2); }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{walletT("recharge_amount")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                        <input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          placeholder={`${MIN_DEPOSIT}+`}
                          className="w-full h-16 bg-white/10 border border-white/10 rounded-2xl pl-10 pr-6 text-2xl font-bold text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500/50"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        {[500, 1000, 5000, 10000].map(v => (
                          <button 
                            key={v} 
                            type="button" 
                            onClick={() => setAmount(String(v))}
                            className="flex-1 h-10 rounded-xl bg-white/10 border border-white/10 text-[10px] font-bold text-slate-400 hover:bg-white/20 hover:text-white transition-all"
                          >
                            ₹{v.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={parseFloat(amount) < MIN_DEPOSIT}
                      className="w-full h-14 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      {t("buttons.confirm")} <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-2">
                      <ChevronLeft className="w-4 h-4" /> {t("buttons.back")}
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => setProvider("simulation")}
                        className={`p-4 rounded-2xl border text-left transition-all ${provider === "simulation" ? "bg-cyan-500/20 border-cyan-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-white">{walletT("fast_pay_sim")}</span>
                          <div className={`w-4 h-4 rounded-full border-2 ${provider === "simulation" ? "border-cyan-500 bg-cyan-500" : "border-slate-500"}`} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{walletT("fast_pay_sim_desc")}</p>
                      </button>
                      <button 
                        onClick={() => setProvider("stripe")}
                        className={`p-4 rounded-2xl border text-left transition-all ${provider === "stripe" ? "bg-indigo-500/20 border-indigo-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-white">{walletT("fast_pay_stripe")}</span>
                          <div className={`w-4 h-4 rounded-full border-2 ${provider === "stripe" ? "border-indigo-500 bg-indigo-500" : "border-slate-500"}`} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{walletT("fast_pay_stripe_desc")}</p>
                      </button>
                      <button 
                        onClick={() => setProvider("manual")}
                        className={`p-4 rounded-2xl border text-left transition-all ${provider === "manual" ? "bg-white border-cyan-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-white">{walletT("bank_transfer")}</span>
                          <div className={`w-4 h-4 rounded-full border-2 ${provider === "manual" ? "border-cyan-500 bg-cyan-500" : "border-slate-500"}`} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{walletT("bank_transfer_desc")}</p>
                      </button>
                    </div>
                    
                    {provider !== "manual" ? (
                      <button 
                        onClick={handleFastPay}
                        disabled={isSubmitting}
                        className="w-full h-14 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("buttons.submit")}
                      </button>
                    ) : (
                      <form onSubmit={handleDepositSubmit} className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                          <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{walletT("transfer_target")}</p>
                              <p className="text-lg font-bold text-cyan-400">{PLATFORM_UPI}</p>
                            </div>
                            <CopyButton text={PLATFORM_UPI} />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{walletT("required_amount")}</p>
                              <p className="text-lg font-bold text-white">₹{parseFloat(amount).toLocaleString()}</p>
                            </div>
                            <CopyButton text={amount} />
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{walletT("utr_label")}</label>
                            <input 
                              type="text" 
                              value={utrNumber} 
                              onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                              placeholder={walletT("placeholder_utr")}
                              className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-all font-mono tracking-[0.2em]"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{walletT("sender_upi_label")}</label>
                            <input 
                              type="text" 
                              value={upiId} 
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder={walletT("placeholder_upi")}
                              className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-all"
                              required
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={isSubmitting || utrNumber.length < 12}
                          className="w-full h-14 bg-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t("buttons.confirm")}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === "withdraw" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">{walletT("withdraw_funds")}</h2>
                  <p className="text-sm text-slate-400 font-medium">{walletT("withdraw_desc")}</p>
                </div>
                
                <form onSubmit={handleWithdrawSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{walletT("withdraw_amount")}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder={`${MIN_WITHDRAW}+`}
                        className="w-full h-16 bg-white/10 border border-white/10 rounded-2xl pl-10 pr-6 text-2xl font-bold text-white focus:outline-none focus:border-red-500 transition-all placeholder:text-slate-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{walletT("receiver_upi_label")}</label>
                    <input 
                      type="text" 
                      value={upiId} 
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full h-14 bg-white/10 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-red-500 transition-all"
                      required
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-amber-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-[10px] font-semibold leading-relaxed uppercase">
                      {walletT("withdraw_warning")}
                    </p>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || parseFloat(amount) < MIN_WITHDRAW || !upiId}
                    className="w-full h-14 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : walletT("withdraw_btn", { amount: parseFloat(amount || "0").toLocaleString() })}
                  </button>
                </form>
              </div>
            )}

            {tab === "history" && (
              <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">{walletT("transaction_history")}</h2>
                  <p className="text-sm text-slate-400 font-medium">{walletT("history_desc")}</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {[...history.deposits, ...history.withdrawals]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((item, idx) => {
                      const isDeposit = 'utrNumber' in item;
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isDeposit ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                              {isDeposit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white uppercase tracking-wider">{isDeposit ? walletT("deposit") : walletT("withdraw")}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${isDeposit ? "text-emerald-400" : "text-red-400"}`}>
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
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                      <History className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase tracking-[0.2em]">{errorsT("no_transactions")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "bets" && (
              <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">{bettingT("active_bets")}</h2>
                  <p className="text-sm text-slate-400 font-medium">{bettingT("active_bets_desc")}</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {activeBets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                      <CheckCircle2 className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase tracking-[0.2em]">{errorsT("no_active_bets")}</p>
                    </div>
                  ) : (
                    activeBets.map((bet: any) => (
                      <div key={bet.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 group hover:border-cyan-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{bettingT("bet_id", { id: bet.id.slice(0, 8) })}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{bettingT("accumulator")}</span>
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] font-bold uppercase tracking-widest">{bettingT("status_open")}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{bettingT("potential_payout")}</p>
                            <p className="text-lg font-bold text-emerald-400">₹{parseFloat(bet.potentialPayout).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 py-4 border-y border-white/10">
                          {bet.selections.map((sel: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-medium text-slate-400">
                              <span className="truncate max-w-[200px]">{sel.selectionId}</span>
                              <span className="text-white font-bold">@{sel.odds}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{bettingT("cashout_offer")}</p>
                            <p className="text-xl font-bold text-white">
                              ₹ {cashOutValues[bet.id] || bettingT("calculating")}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleCashOut(bet.id)}
                            disabled={isSubmitting || !cashOutValues[bet.id]}
                            className="h-12 px-6 bg-cyan-500 text-white font-bold rounded-2xl hover:bg-cyan-400 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : bettingT("cashout_now")}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: KYC & Limits ─────────────────────────── */}
        <div className="xl:col-span-3 space-y-6 lg:sticky lg:top-24">
          <KYCChecklist />
          
          {/* Limit Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Current Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Daily Withdrawal</p>
                <p className="text-base font-black text-white">₹ 50,000</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Monthly Cap</p>
                <p className="text-base font-black text-white">₹ 500,000</p>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-[#0071e3] hover:bg-white/10 transition-all">
              Manage Limits
            </button>
          </div>

          {/* Secure Messaging */}
          <div className="p-4 rounded-2xl bg-[#abd45e]/5 border border-[#abd45e]/10 flex gap-3 items-start">
            <Shield className="w-4 h-4 text-[#abd45e] shrink-0 mt-0.5" />
            <p className="text-[9px] text-[#abd45e]/60 font-medium leading-relaxed">
              Your assets are protected by 256-bit military-grade encryption and stored in segregated multi-sig wallets.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

function TransactionStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "text-amber-400 bg-amber-500/10",
    approved: "text-emerald-400 bg-emerald-500/10",
    completed: "text-emerald-400 bg-emerald-500/10",
    rejected: "text-red-400 bg-red-500/10",
  };
  
  return (
    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[status] || "text-slate-400 bg-slate-500/10"}`}>
      {status}
    </span>
  );
}
