"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { Ban, Wallet, Search, ChevronDown, ChevronUp } from "lucide-react";

interface AdminUsersClientProps {
  users: Profile[];
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  function adjustBalance(userId: string, amount: number) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action: "adjust_balance", amount }),
        });
        const data = await res.json().catch(() => ({ error: "Server error" }));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to adjust balance");
          return;
        }
        toast.success(`₹${amount > 0 ? "+" : ""}${amount} adjusted`);
        setAdjustAmount("");
      } catch {
        toast.error("Network error");
      }
    });
  }

  function banUser(userId: string, banned: boolean) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action: banned ? "ban" : "unban" }),
        });
        const data = await res.json().catch(() => ({ error: "Server error" }));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to update user");
          return;
        }
        toast.success(banned ? "User banned" : "User unbanned");
      } catch {
        toast.error("Network error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin users"
        title="Player directory"
        subtitle="Manage players, adjust balances, and control access."
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, or referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#0071e3]"
        />
      </div>

      {/* Users */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No users found</p>
        ) : (
          filtered.map((user) => {
            const isExpanded = expandedId === user.id;
            return (
              <Card key={user.id} className="overflow-hidden" hover={false} animated={false}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  className="w-full grid gap-3 md:grid-cols-5 p-4 text-left"
                >
                  <div>
                    <p className="text-xs text-gray-500">Player</p>
                    <p className="font-semibold text-white truncate">{user.full_name ?? user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <Badge tone={user.role === "admin" ? "warning" : "neutral"}>{user.role}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Referral</p>
                    <p className="font-mono text-sm text-[#2997ff]">{user.referral_code ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="font-semibold text-emerald-400">{formatCurrency(Number(user.balance ?? 0))}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Badge tone={user.is_active !== false ? "success" : "danger"}>
                      {user.is_active !== false ? "Active" : "Banned"}
                    </Badge>
                    {isExpanded ? <ChevronUp className="h-4 w-4 ml-2 text-gray-500" /> : <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/6 px-4 py-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-white">{user.email ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm text-white">{user.phone ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Deposited</p>
                        <p className="text-sm text-emerald-400">{formatCurrency(Number(user.total_deposited ?? 0))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Withdrawn</p>
                        <p className="text-sm text-rose-400">{formatCurrency(Number(user.total_withdrawn ?? 0))}</p>
                      </div>
                    </div>

                    {/* Adjust Balance */}
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-gray-500" />
                      <input
                        type="number"
                        placeholder="Amount (+/-)"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
                      />
                      <button
                        onClick={() => adjustBalance(user.id, Number(adjustAmount))}
                        disabled={isPending || !adjustAmount}
                        className="rounded-[980px] bg-[#0071e3] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 active:scale-95 transition-transform"
                      >
                        Adjust
                      </button>
                    </div>

                    {/* Ban/Unban */}
                    <button
                      onClick={() => banUser(user.id, user.is_active !== false)}
                      disabled={isPending}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold active:scale-95 transition-transform ${
                        user.is_active !== false
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      }`}
                    >
                      <Ban className="h-4 w-4" />
                      {user.is_active !== false ? "Ban User" : "Unban User"}
                    </button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}


