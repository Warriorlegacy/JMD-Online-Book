"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface ProfilePageClientProps {
  profile: Profile | null;
}

export function ProfilePageClient({ profile: initialProfile }: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState({
    full_name: initialProfile?.full_name ?? "",
    upi_id: initialProfile?.upi_id ?? "",
    bank_account: initialProfile?.bank_account ?? "",
    ifsc_code: initialProfile?.ifsc_code ?? "",
    account_holder: initialProfile?.account_holder ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "invalid_upi_id") toast.error("Invalid UPI ID format");
        else if (data.error === "invalid_ifsc") toast.error("Invalid IFSC code");
        else toast.error(data.error ?? "Failed to save");
        return;
      }
      setProfile((prev) => ({ ...prev!, ...data.data }));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File size must be under 2MB"); return; }

    setAvatarLoading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      setProfile((prev) => prev ? { ...prev, avatar_url: data.data?.avatar_url } : prev);
      toast.success("Avatar updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setAvatarLoading(false);
    }
  }

  function copyReferral() {
    const link = `${window.location.origin}/register?ref=${profile?.referral_code}`;
    navigator.clipboard.writeText(link).then(() => toast.success("Referral link copied!"));
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Profile" title="Account Settings" subtitle="Manage your personal and payment details." />

      {/* Avatar */}
      <Card className="p-4 flex items-center gap-4">
        <div
          className="relative w-16 h-16 rounded-full bg-[#0071e3] flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => fileRef.current?.click()}
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[21px] font-bold text-white">
              {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
            </span>
          )}
          {avatarLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-[12px] text-white">...</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-[17px] font-semibold text-white">{profile?.full_name ?? "User"}</p>
          <p className="text-[14px] text-[rgba(255,255,255,0.48)]">{profile?.email ?? profile?.phone ?? ""}</p>
          <p className="text-[12px] text-[rgba(255,255,255,0.3)] mt-0.5">Joined {formatDate(profile?.created_at)}</p>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={uploadAvatar} />
      </Card>

      {/* Edit form */}
      <Card className="p-4">
        <form onSubmit={saveProfile} className="space-y-4">
          <p className="text-[14px] font-semibold text-white">Personal Details</p>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { key: "full_name", label: "Full Name", placeholder: "Your full name" },
              { key: "upi_id", label: "UPI ID", placeholder: "yourname@upi" },
              { key: "bank_account", label: "Bank Account", placeholder: "Account number" },
              { key: "ifsc_code", label: "IFSC Code", placeholder: "HDFC0001234" },
              { key: "account_holder", label: "Account Holder", placeholder: "Name on account" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[12px] text-[rgba(255,255,255,0.48)]">{label}</label>
                <Input
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[12px] text-[rgba(255,255,255,0.48)]">Phone</label>
              <p className="rounded-[10px] bg-[rgba(255,255,255,0.04)] px-4 py-[10px] text-[17px] text-[rgba(255,255,255,0.3)]">
                {profile?.phone ?? "Not set"}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-[rgba(255,255,255,0.48)]">Email</label>
              <p className="rounded-[10px] bg-[rgba(255,255,255,0.04)] px-4 py-[10px] text-[17px] text-[rgba(255,255,255,0.3)]">
                {profile?.email ?? "Not set"}
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      {/* Referral */}
      <Card className="p-4 space-y-3">
        <p className="text-[14px] font-semibold text-white">Referral Link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-[10px] bg-[rgba(255,255,255,0.06)] px-3 py-2 text-[12px] text-[#2997ff] truncate font-mono">
            {typeof window !== "undefined"
              ? `${window.location.origin}/register?ref=${profile?.referral_code}`
              : `/register?ref=${profile?.referral_code}`}
          </code>
          <button
            onClick={copyReferral}
            className="rounded-[980px] bg-[#0071e3] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#0077ed] transition-colors"
          >
            Copy
          </button>
        </div>
        <p className="text-[12px] text-[rgba(255,255,255,0.3)]">
          Your referral code:{" "}
          <span className="text-[#2997ff] font-mono">{profile?.referral_code}</span>
        </p>
      </Card>
    </div>
  );
}
