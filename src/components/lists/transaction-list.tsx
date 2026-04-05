"use client";

import { useState, useCallback, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionSkeleton } from "@/components/skeletons/transaction-skeleton";
import type { Transaction } from "@/types/database";

interface TransactionListProps {
  initialTransactions: Transaction[];
  userId: string;
}

export const TransactionList = memo(function TransactionList({
  initialTransactions,
  userId,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTransactions.length >= 10);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/transactions?userId=${userId}&offset=${transactions.length}&limit=10`,
      );
      const data = await res.json();
      if (data.transactions?.length) {
        setTransactions((prev) => [...prev, ...data.transactions]);
        setHasMore(data.transactions.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch {
      // Error loading more transactions
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, transactions.length, userId]);

  if (transactions.length === 0 && !loading) {
    return (
      <p className="py-8 text-center text-slate-400">No transactions yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold capitalize text-white">{transaction.type}</p>
              <p className="text-sm text-slate-400">{formatDate(transaction.created_at)}</p>
            </div>
            <Badge
              tone={
                transaction.status === "approved"
                  ? "success"
                  : transaction.status === "rejected"
                    ? "danger"
                    : "warning"
              }
            >
              {transaction.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Amount</span>
            <span className="font-semibold text-white">
              {formatCurrency(Number(transaction.amount))}
            </span>
          </div>
          {transaction.payment_reference && (
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Reference</span>
              <span>{transaction.payment_reference}</span>
            </div>
          )}
        </Card>
      ))}

      {loading && <TransactionSkeleton />}

      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-slate-300 hover:bg-white/10"
        >
          Load more
        </button>
      )}
    </div>
  );
});