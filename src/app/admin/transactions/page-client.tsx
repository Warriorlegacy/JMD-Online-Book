"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/database";

export function AdminTransactionsClient({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function act(transactionId: string, action: "approve" | "reject") {
    startTransition(async () => {
      const response = await fetch("/api/admin/transactions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Unable to process transaction");
        return;
      }
      toast.success(`Transaction ${action}d`);
      router.refresh();
    });
  }

  function getStatusTone(status: string | null) {
    if (status === "approved") return "success";
    if (status === "rejected") return "danger";
    if (status === "pending" || status === "processing") return "warning";
    return "neutral";
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin transactions"
        title="Approval queue"
        subtitle="Approve deposits and withdrawals from one list."
      />
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold capitalize text-white">{transaction.type}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={getStatusTone(transaction.status)}>{transaction.status ?? "unknown"}</Badge>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
              </div>
              <p className="font-semibold text-white">
                {formatCurrency(Number(transaction.amount))}
              </p>
            </div>
            <div className="grid gap-3 text-sm text-[var(--color-text-muted)] md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">User ID</p>
                <p className="mt-1 break-all text-white">{transaction.user_id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Method</p>
                <p className="mt-1 text-white">{transaction.payment_method ?? "Manual"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Reference</p>
                <p className="mt-1 break-all text-white">{transaction.payment_reference ?? "NA"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Balance Impact</p>
                <p className="mt-1 text-white">
                  {transaction.balance_before != null && transaction.balance_after != null
                    ? `${formatCurrency(Number(transaction.balance_before))} -> ${formatCurrency(Number(transaction.balance_after))}`
                    : "Pending update"}
                </p>
              </div>
            </div>
            {transaction.admin_note ? (
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-[var(--color-text-muted)]">
                <span className="font-semibold text-white">Admin note:</span> {transaction.admin_note}
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button
                disabled={isPending || transaction.status === "approved"}
                onClick={() => act(transaction.id, "approve")}
              >
                Approve
              </Button>
              <Button
                disabled={isPending || transaction.status === "rejected"}
                onClick={() => act(transaction.id, "reject")}
                variant="danger"
              >
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
