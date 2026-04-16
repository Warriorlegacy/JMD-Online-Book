"use client";
import { useState } from "react";

export function DepositModal() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("500");
  const [upi, setUpi] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!amount || !upi) return;
    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); }, 3000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-9 rounded-full bg-cyan-600 px-4 text-sm font-medium text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
      >
        Deposit
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl md:rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Deposit Funds</h2>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-xl">✕</button>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-4xl">✅</div>
                <p className="text-green-400 font-bold">Deposit request submitted!</p>
                <p className="text-slate-400 text-sm">Your balance will be updated after admin approval.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Amount (₹)</label>
                  <div className="flex gap-2 flex-wrap">
                    {["100","500","1000","5000"].map(v => (
                      <button key={v} onClick={() => setAmount(v)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${amount === v ? "bg-cyan-600 border-cyan-500 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                        ₹{v}
                      </button>
                    ))}
                  </div>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-4 text-white font-bold focus:outline-none focus:border-cyan-500"
                    placeholder="Enter amount" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Your UPI ID</label>
                  <input type="text" value={upi} onChange={e => setUpi(e.target.value)}
                    className="w-full h-11 bg-slate-800 border border-slate-700 rounded-lg px-4 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="yourname@upi" />
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 space-y-1 text-sm">
                  <p className="text-slate-400">Send ₹{amount} to:</p>
                  <p className="text-cyan-400 font-bold text-lg">sbe@upi</p>
                  <p className="text-slate-500 text-xs">After payment, enter your UPI ID above and submit</p>
                </div>

                <button onClick={handleSubmit}
                  className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all active:scale-[0.98]">
                  Submit Deposit Request
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
