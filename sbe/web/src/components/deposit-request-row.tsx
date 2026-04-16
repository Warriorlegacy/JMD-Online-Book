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
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-900/40 gap-4">
      {/* Info grid */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
          <div className="text-sm font-bold text-white">{deposit.username || "N/A"}</div>
          <div className="text-[10px] text-slate-500 uppercase">User</div>
        </div>
        <div>
          <div className="text-sm font-bold text-emerald-400">₹{deposit.amount.toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-slate-500 uppercase">Amount</div>
        </div>
        <div className="hidden md:block">
          <div className="text-sm text-slate-400 font-mono">{maskUTR(deposit.utrNumber)}</div>
          <div className="text-[10px] text-slate-500 uppercase">UTR</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">{formatTime(deposit.createdAt)}</div>
          <div className="text-[10px] font-bold text-amber-400 uppercase mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 inline-block">Pending</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 md:ml-4">
        <button
          onClick={() => onApprove(deposit.id)}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Approve"}
        </button>
        <button
          onClick={() => onReject(deposit.id)}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
