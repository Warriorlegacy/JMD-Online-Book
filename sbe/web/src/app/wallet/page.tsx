"use client";
import { useState } from "react";
import { useSocket } from "@/lib/socket";

export default function WalletPage() {
  const { connected } = useSocket();
  const [tab, setTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-2">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Available Balance</p>
        <p className="text-4xl font-black text-white">₹ 0.00</p>
        <p className="text-xs text-slate-500">Connect your account to see real balance</p>
      </div>

      <div className="flex rounded-xl border border-slate-800 bg-slate-900/50 p-1 gap-1">
        {(["deposit", "withdraw", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "deposit" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Deposit via UPI</h2>
          <div className="rounded-xl bg-slate-800 p-4 text-center space-y-1">
            <p className="text-xs text-slate-400">Send payment to</p>
            <p className="text-lg font-black text-cyan-400">sbe@upi</p>
            <p className="text-xs text-slate-500">Then fill the form below</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Your UPI ID</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
            <button onClick={handleSubmit}
              className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${submitted ? "bg-green-600 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"}`}>
              {submitted ? "Request Submitted ✓" : "Submit Deposit Request"}
            </button>
            {submitted && <p className="text-[10px] text-center text-slate-400">Admin will verify and credit your balance within 30 minutes.</p>}
          </div>
        </div>
      )}

      {tab === "withdraw" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Withdraw Funds</h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">UPI ID / Bank Account</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi or account number"
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
            <button onClick={handleSubmit}
              className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${submitted ? "bg-green-600 text-white" : "bg-pink-600 hover:bg-pink-500 text-white"}`}>
              {submitted ? "Request Submitted ✓" : "Submit Withdrawal Request"}
            </button>
            {submitted && <p className="text-[10px] text-center text-slate-400">Admin will process within 24 hours.</p>}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Transaction History</h2>
          <div className="text-center py-8 space-y-2">
            <p className="text-2xl">📋</p>
            <p className="text-sm text-slate-400">No transactions yet</p>
            <p className="text-xs text-slate-600">Your deposit and withdrawal history will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
