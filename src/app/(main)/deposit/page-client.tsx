"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import type { PaymentMethod } from "@/types/database";

export function DepositPageClient({
  paymentMethods,
  minDeposit,
}: {
  paymentMethods: PaymentMethod[];
  minDeposit: number;
}) {
  const [amount, setAmount] = useState(String(minDeposit));
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.name ?? "UPI");
  const [reference, setReference] = useState("");
  const [upiId, setUpiId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submitDeposit() {
    startTransition(async () => {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          payment_method: paymentMethod,
          upi_id: upiId,
          screenshot_url: screenshotUrl,
          reference,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Deposit request failed");
        return;
      }
      toast.success("Deposit request sent for approval");
      setReference("");
      setScreenshotUrl("");
    });
  }

  async function uploadScreenshot(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/wallet/upload-screenshot", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Upload failed");
      return;
    }
    setScreenshotUrl(payload.data.url);
    toast.success("Screenshot uploaded");
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Deposit"
        title="Manual funding request"
        subtitle="Submit proof of payment, then wait for an admin approval to credit the wallet."
      />
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Amount</label>
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Payment method</label>
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
            <label className="text-sm text-[var(--color-text-muted)]">Reference</label>
            <Input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="UTR / payment reference"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">UPI ID</label>
            <Input
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="yourname@upi"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--color-text-muted)]">Payment screenshot</label>
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadScreenshot(file);
              }
            }}
          />
          {screenshotUrl ? (
            <p className="text-xs text-emerald-300">Uploaded proof attached</p>
          ) : null}
        </div>
        <Button className="w-full md:w-auto" disabled={isPending} onClick={submitDeposit}>
          Submit deposit request
        </Button>
      </Card>
    </div>
  );
}
