"use client";
import { useState } from "react";
import Link from "next/link";

const PLATFORM_UPI = "6202442690@ptyes";
const PLATFORM_NAME = "SBE Exchange";
const MIN_DEPOSIT = 100;
const MIN_WITHDRAW = 200;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${copied ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function WalletPage() {
  const [tab, setTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const upiDeepLink = `upi://pay?pa=${PLATFORM_UPI}&pn=${encodeURIComponent(PLATFORM_NAME)}&am=${amountNum}&cu=INR&tn=${encodeURIComponent("SBE Deposit")}`;

  const handleDepositStep1 = () => {
    if (amountNum < MIN_DEPOSIT) return;
    setStep(2);
  };

  const handleDepositSubmit = async () => {
    if (!utrNumber || utrNumber.length < 10 || !upiId) return;
    setLoading(true);
    // In production: POST to /api/deposit with { amount, upiId, utrNumber }
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const handleWithdrawSubmit = async () => {
    if (amountNum < MIN_WITHDRAW || !upiId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const reset = () => { setStep(1); setAmount(""); setUpiId(""); setUtrNumber(""); setSubmitted(false); };

  return (
    <div className="max-w-lg mx-auto space-y-5 py-4 px-1">
      {/* Balance Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 p-6">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Available Balance</p>
        <p className="text-4xl font-black text-white">₹ 0.00</p>
        <p className="text-xs text-slate-500 mt-1">Login to see your real balance</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setTab("deposit"); reset(); }} className="flex-1 h-9 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-black text-white uppercase tracking-wider transition-all">+ Deposit</button>
          <button onClick={() => { setTab("withdraw"); reset(); }} className="flex-1 h-9 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-black text-slate-300 uppercase tracking-wider transition-all">Withdraw</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-slate-800 bg-slate-900/50 p-1 gap-1">
        {(["deposit", "withdraw", "history"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); reset(); }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${tab === t ? "bg-cyan-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* DEPOSIT */}
      {tab === "deposit" && !submitted && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          {step === 1 ? (
            <>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Deposit via UPI</h2>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder={`Min ₹${MIN_DEPOSIT}`} min={MIN_DEPOSIT}
                  className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-base font-black text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                <div className="flex gap-2 mt-2">
                  {[500, 1000, 2000, 5000].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-slate-300 transition-all">
                      ₹{v}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleDepositStep1} disabled={amountNum < MIN_DEPOSIT}
                className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${amountNum >= MIN_DEPOSIT ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}>
                Proceed to Pay ₹{amountNum > 0 ? amountNum.toLocaleString() : ""}
              </button>
              <p className="text-[10px] text-center text-slate-600">Minimum deposit: ₹{MIN_DEPOSIT}</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Pay ₹{amountNum.toLocaleString()}</h2>
              </div>

              {/* UPI Payment Box */}
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Send to UPI ID</p>
                    <p className="text-base font-black text-cyan-400 mt-0.5">{PLATFORM_UPI}</p>
                  </div>
                  <CopyButton text={PLATFORM_UPI} />
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Amount</p>
                    <p className="text-base font-black text-white">₹{amountNum.toLocaleString()}</p>
                  </div>
                  <CopyButton text={String(amountNum)} />
                </div>
                <a href={upiDeepLink}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-black text-white uppercase tracking-wider hover:opacity-90 transition-all">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  Open UPI App
                </a>
                <p className="text-[9px] text-center text-slate-500">Works with PhonePe, GPay, Paytm, BHIM & all UPI apps</p>
              </div>

              {/* UTR Verification */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase">After payment, enter details below:</p>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">UTR / Transaction ID</label>
                  <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                    placeholder="12-digit UTR number"
                    className="w-full h-11 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                  <p className="text-[9px] text-slate-600">Find UTR in your UPI app payment history</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Your UPI ID</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full h-11 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors" />
                </div>
                <button onClick={handleDepositSubmit} disabled={loading || utrNumber.length < 10 || !upiId}
                  className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${loading || utrNumber.length < 10 || !upiId ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 text-white"}`}>
                  {loading ? "Submitting..." : "Confirm Deposit"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "deposit" && submitted && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <p className="font-black text-white">Deposit Request Submitted!</p>
          <p className="text-sm text-slate-400">Your deposit of <span className="text-white font-bold">₹{amountNum.toLocaleString()}</span> is under review.</p>
          <p className="text-xs text-slate-500">UTR: <span className="text-slate-300 font-mono">{utrNumber}</span></p>
          <p className="text-xs text-slate-500">Balance will be credited within <span className="text-white">30 minutes</span> after verification.</p>
          <button onClick={reset} className="mt-2 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-white uppercase tracking-wider transition-all">
            New Deposit
          </button>
        </div>
      )}

      {/* WITHDRAW */}
      {tab === "withdraw" && !submitted && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Withdraw Funds</h2>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-[10px] font-bold text-amber-400">⚠️ Withdrawals are processed within 24 hours. Minimum ₹{MIN_WITHDRAW}.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase">Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder={`Min ₹${MIN_WITHDRAW}`} min={MIN_WITHDRAW}
                className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-base font-black text-white focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase">Your UPI ID</label>
              <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full h-11 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 transition-colors" />
            </div>
            <button onClick={handleWithdrawSubmit} disabled={loading || amountNum < MIN_WITHDRAW || !upiId}
              className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${loading || amountNum < MIN_WITHDRAW || !upiId ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-500 text-white"}`}>
              {loading ? "Submitting..." : `Withdraw ₹${amountNum > 0 ? amountNum.toLocaleString() : ""}`}
            </button>
          </div>
        </div>
      )}

      {tab === "withdraw" && submitted && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <p className="font-black text-white">Withdrawal Request Submitted!</p>
          <p className="text-sm text-slate-400">₹{amountNum.toLocaleString()} will be sent to <span className="text-white font-bold">{upiId}</span></p>
          <p className="text-xs text-slate-500">Processing within 24 hours.</p>
          <button onClick={reset} className="mt-2 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-white uppercase tracking-wider transition-all">
            New Request
          </button>
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Transaction History</h2>
          <div className="text-center py-10 space-y-2">
            <p className="text-3xl">📋</p>
            <p className="text-sm text-slate-400">No transactions yet</p>
            <p className="text-xs text-slate-600">Your deposits and withdrawals will appear here</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-4 space-y-2">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Payment Info</p>
        <div className="space-y-1 text-[10px] text-slate-500">
          <p>• Deposits credited within 30 minutes after UTR verification</p>
          <p>• Withdrawals processed within 24 hours</p>
          <p>• Minimum deposit: ₹{MIN_DEPOSIT} | Minimum withdrawal: ₹{MIN_WITHDRAW}</p>
          <p>• For support: <Link href="/" className="text-cyan-400 hover:underline">Contact Admin</Link></p>
        </div>
      </div>
    </div>
  );
}
