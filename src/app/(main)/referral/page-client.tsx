"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import type { Commission, Profile, ReferralTreeNode } from "@/types/database";

interface ReferralPageProps {
  tree: ReferralTreeNode | null;
  sessionUserId: string;
  appUrl: string;
}

export function ReferralPageClient({ tree, sessionUserId: _sessionUserId, appUrl }: ReferralPageProps) {
  const [copied, setCopied] = useState(false);
  const referralCode = tree?.profile.referral_code ?? "LOCKED";
  const shareLink = `${appUrl}/register?ref=${referralCode}`;

  function copyCode() {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    toast.success("Share link copied!");
  }

  const totalCommission = tree?.commissions.reduce(
    (sum, c) => sum + Number(c.amount ?? 0), 0
  ) ?? 0;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Referral"
        title="Two-level commission tree"
        subtitle="Share your code, earn commissions on every deposit your referrals make."
      />

      {/* Referral Code Card */}
      <Card className="p-4 space-y-4">
        <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Your Referral Code</p>
        <div className="flex items-center justify-between">
          <p
            className="text-[28px] font-semibold text-[#2997ff] tracking-widest"
            style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
          >
            {referralCode}
          </p>
          <button
            onClick={copyCode}
            className={`rounded-[980px] px-4 py-2 text-[14px] font-medium transition-colors ${
              copied
                ? "bg-[#30d158] text-white"
                : "bg-[#0071e3] text-white hover:bg-[#0077ed]"
            }`}
          >
            {copied ? "✓ Copied" : "Copy Code"}
          </button>
        </div>
        <div className="rounded-[10px] bg-[rgba(255,255,255,0.06)] p-3">
          <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Share this link</p>
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-[#2997ff] truncate flex-1 font-mono">{shareLink}</p>
            <button
              onClick={copyLink}
              className="text-[12px] text-[#2997ff] hover:underline font-medium whitespace-nowrap"
            >
              Copy Link
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Direct referrals</p>
          <p className="mt-2 text-[28px] font-semibold text-white">
            {tree?.directReferrals.length ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Second-level</p>
          <p className="mt-2 text-[28px] font-semibold text-white">
            {tree?.secondLevelReferrals.length ?? 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Commission earned</p>
          <p className="mt-2 text-[28px] font-semibold text-[#30d158]">
            {formatCurrency(totalCommission)}
          </p>
        </Card>
      </div>

      {/* Commission Tiers */}
      <Card className="p-4 space-y-4">
        <p className="text-[14px] font-semibold text-white">Commission Tiers</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[18px] bg-[rgba(48,209,88,0.08)] p-4">
            <p className="text-[12px] text-[#30d158] mb-1">Direct Referral</p>
            <p className="text-[21px] font-bold text-white">5%</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.48)]">of their deposit</p>
          </div>
          <div className="rounded-[18px] bg-[rgba(0,113,227,0.08)] p-4">
            <p className="text-[12px] text-[#2997ff] mb-1">Second Level</p>
            <p className="text-[21px] font-bold text-white">2%</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.48)]">of their deposit</p>
          </div>
        </div>
      </Card>

      {/* Direct Referrals List */}
      <Card className="p-4 space-y-4">
        <p className="text-[14px] font-semibold text-white">Direct referrals</p>
        {tree?.directReferrals.length === 0 ? (
          <p className="text-center text-[rgba(255,255,255,0.3)] py-6 text-[14px]">
            No referrals yet. Share your code to start earning!
          </p>
        ) : (
          <div className="space-y-2">
            {(tree?.directReferrals ?? []).map((profile: Profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-[18px] bg-[rgba(255,255,255,0.04)] px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-semibold text-white">{profile.full_name ?? profile.email}</p>
                  <p className="text-[12px] text-[rgba(255,255,255,0.48)]">{profile.email}</p>
                </div>
                <p className="text-[14px] text-[#30d158] font-medium">
                  {formatCurrency(
                    (tree?.commissions ?? [])
                      .filter((c: Commission) => c.player_id === profile.id)
                      .reduce((sum: number, c: Commission) => sum + Number(c.amount ?? 0), 0)
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Second Level */}
      {tree && tree.secondLevelReferrals.length > 0 && (
        <Card className="p-4 space-y-4">
          <p className="text-[14px] font-semibold text-white">Second-level referrals</p>
          <div className="space-y-2">
            {tree.secondLevelReferrals.map((profile: Profile) => (
              <div
                key={profile.id}
                className="rounded-[18px] bg-[rgba(255,255,255,0.04)] px-4 py-3"
              >
                <p className="text-[14px] font-semibold text-white">{profile.full_name ?? profile.email}</p>
                <p className="text-[12px] text-[rgba(255,255,255,0.48)]">{profile.email}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
