"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";

export function WithdrawPageClient({
  paymentMethods,
  minWithdraw,
  currentBalance,
}: {
  paymentMethods: PaymentMethod[];
  minWithdraw: number;
  currentBalance: number;
}) {
  const [amount, setAmount] = useState(String(minWithdraw));
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.name ?? "PhonePe");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submitWithdraw() {
    startTransition(async () => {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payment_method: paymentMethod,
          upi_id: upiId,
          bank_account: bankAccount,
          ifsc_code: ifscCode,
          account_holder: accountHolder,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Withdrawal request failed");
        return;
      }
      toast.success("Withdrawal request submitted");
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Withdraw"
        title="Payout request"
        subtitle={`Available balance: ${formatCurrency(currentBalance)}`}
      />
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Amount</label>
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Method</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.name}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">UPI ID</label>
            <Input value={upiId} onChange={(event) => setUpiId(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Bank account</label>
            <Input value={bankAccount} onChange={(event) => setBankAccount(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">IFSC code</label>
            <Input value={ifscCode} onChange={(event) => setIfscCode(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Account holder</label>
            <Input
              value={accountHolder}
              onChange={(event) => setAccountHolder(event.target.value)}
            />
          </div>
        </div>
        <Button className="w-full md:w-auto" disabled={isPending} onClick={submitWithdraw}>
          Submit withdrawal request
        </Button>
      </Card>
    </div>
  );
}
