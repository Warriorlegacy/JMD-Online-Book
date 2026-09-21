"use client";

import { DepositRequest } from "@/types";

interface DepositRequestRowProps {
  deposit: DepositRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

const maskUTR = (utr: string) => {
  if (utr.length <= 8) return utr;
  return `${utr.slice(0, 4)}****${utr.slice(-4)}`;
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function DepositRequestRow({ deposit, onApprove, onReject, isProcessing = false }: DepositRequestRowProps) {
  return (
    <div className="glass border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="text-xl font-black">{deposit?.username?.[0].toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Entity Operator</p>
              <p className="text-sm font-bold text-white tracking-tight">{deposit.username}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Inflow Volume</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">₹{deposit.amount.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Transaction ID</p>
              <p className="text-sm font-bold text-white/40 font-mono italic">{maskUTR(deposit.utrNumber)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
             <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Execution Timestamp</p>
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{formatTime(deposit.createdAt)}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(deposit.id)}
              disabled={isProcessing}
              className="px-6 py-4 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? "LOCKED" : "AUTHORIZE"}
            </button>
            <button
              onClick={() => onReject(deposit.id)}
              disabled={isProcessing}
              className="px-6 py-4 rounded-xl bg-white/5 text-red-400 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? "LOCKED" : "TERMINATE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
