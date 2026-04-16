"use client";

import { useState, useEffect, useTransition } from "react";
import toast from "react-hot-toast";
import { Gift, Loader2 } from "lucide-react";

export function DailyRewardClaim() {
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/rewards/daily")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCanClaim(data.data.canClaim);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function claimReward() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/rewards/daily", { method: "POST" });
        const data = await res.json().catch(() => ({ error: "Server error" }));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to claim reward");
          return;
        }
        toast.success(`₹${data.data?.reward ?? 10} daily reward claimed!`);
        setCanClaim(false);
      } catch {
        toast.error("Network error");
      }
    });
  }

  if (loading) return null;

  return (
    <div className="rounded-[18px] bg-[#1c1c1e] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(0,113,227,0.15)]">
            <Gift className="h-5 w-5 text-[#2997ff]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">Daily Reward</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.48)]">
              {canClaim ? "Claim your ₹10 bonus!" : "Come back tomorrow"}
            </p>
          </div>
        </div>
        {canClaim && (
          <button
            onClick={claimReward}
            disabled={claiming}
            className="rounded-[980px] bg-[#0071e3] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#0077ed] active:scale-95 disabled:opacity-50"
          >
            {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim ₹10"}
          </button>
        )}
      </div>
    </div>
  );
}
