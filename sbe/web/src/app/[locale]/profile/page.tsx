"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/auth-context";
import { 
  User, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  Camera,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const t = useTranslations("Common");
  const { user, logout } = useAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");
  const [setupStatus, setSetupStatus] = useState<"idle" | "setting_up" | "verifying" | "done">("idle");
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const SETTINGS_TABS = [
    { id: "general", label: t("profile.general_info"), icon: User },
    { id: "verification", label: t("profile.verification"), icon: ShieldCheck },
    { id: "security", label: t("profile.security"), icon: ShieldCheck },
    { id: "payments", label: t("profile.settlements"), icon: CreditCard },
    { id: "notifications", label: t("profile.alerts"), icon: Bell },
  ];

  const handleSetup2FA = async () => {
    setSetupStatus("setting_up");
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      if (!res.ok) throw new Error("Failed to setup 2FA");
      const data = await res.json();
      setQrCodeUri(data.otpauth);
      setSetupStatus("verifying");
    } catch (err: any) {
      alert(err.message);
      setSetupStatus("idle");
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      if (!res.ok) throw new Error("Invalid verification code");
      setSetupStatus("done");
      alert("2FA enabled successfully!");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{t("auth.verifying_identity")}</p>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=200`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-white p-10 text-center relative overflow-hidden apple-card-shadow">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary"></div>
            <div className="relative pt-8 space-y-6">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-secondary overflow-hidden relative">
                  <Image
                    src={avatarUrl}
                    alt={user.username}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-1 right-1 p-2.5 bg-white text-foreground rounded-full shadow-lg border border-border hover:bg-secondary transition-all scale-0 group-hover:scale-100 origin-bottom-left">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{user.username}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t("profile.membership_level")}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl border border-border">
                <div className="text-left space-y-0.5">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{t("wallet.balance")}</p>
                  <p className="text-lg font-bold text-foreground">₹ {parseFloat(user.balance || "0").toLocaleString()}</p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full h-14 flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-[10px]"
              >
                <LogOut className="w-4 h-4" /> {t("navigation.logout")}
              </button>
            </div>
          </div>
          
          <div className="rounded-3xl border border-border bg-white p-6 space-y-3 apple-card-shadow">
            <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">{t("profile.account_navigator")}</h4>
            {SETTINGS_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSettingsTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                    isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "opacity-0 group-hover:opacity-100")} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-border bg-white p-10 apple-card-shadow min-h-[600px]">
            {activeSettingsTab === "general" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("profile.account_info")}</h1>
                  <p className="text-sm text-muted-foreground font-medium">{t("profile.account_info_desc")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("profile.username")}</label>
                    <div className="h-14 bg-secondary border border-border rounded-2xl px-6 flex items-center text-sm font-bold text-foreground">
                      @{user.username}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("profile.email")}</label>
                    <div className="h-14 bg-secondary border border-border rounded-2xl px-6 flex items-center text-sm font-bold text-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("profile.phone")}</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="+91 00000 00000"
                        className="w-full h-14 bg-secondary border border-border rounded-2xl pl-12 pr-6 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-border">
                  <button className="px-8 h-14 bg-primary text-primary-foreground font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95">
                    {t("buttons.save")}
                  </button>
                </div>
              </div>
            )}

            {activeSettingsTab === "security" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("profile.security_shield")}</h1>
                  <p className="text-sm text-muted-foreground font-medium">{t("profile.security_desc")}</p>
                </div>
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-secondary border border-border flex items-center justify-between group hover:bg-secondary/80 transition-all">
                    <div className="flex gap-5">
                      <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground uppercase tracking-wider">{t("profile.password")}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{t("profile.password_last_changed")}</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-bold uppercase text-primary hover:text-foreground transition-colors tracking-widest bg-primary/10 px-4 py-2 rounded-xl">{t("buttons.submit")}</button>
                  </div>
                  <div className="p-6 rounded-3xl bg-secondary border border-border flex items-center justify-between group hover:bg-secondary/80 transition-all">
                    <div className="flex gap-5">
                      <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground uppercase tracking-wider">{t("profile.two_factor")}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{t("profile.two_factor_desc")}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSetup2FA}
                      disabled={user.twoFactorEnabled === 1}
                      className="text-[10px] font-bold uppercase text-primary hover:text-foreground transition-colors tracking-widest bg-primary/10 px-4 py-2 rounded-xl"
                    >
                      {user.twoFactorEnabled === 1 ? t("profile.enabled") : t("buttons.setup")}
                    </button>
                  </div>
                  <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                    <div className="flex items-center gap-3 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">{t("profile.active_sessions")}</span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase">
                      {t("profile.active_sessions_desc")}
                    </p>
                    <button className="text-[9px] font-bold uppercase text-red-600 hover:underline">{t("profile.revoke_sessions")}</button>
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === "payments" && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 italic">
                <CreditCard className="w-16 h-16 text-slate-700" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-700">{t("profile.settlements_loading")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Overlay */}
      {setupStatus !== "idle" && setupStatus !== "done" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
          <div className="max-w-md w-full rounded-3xl bg-white border border-border p-10 shadow-2xl space-y-8 text-center relative">
            <button 
              onClick={() => setSetupStatus("idle")}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5 rotate-180" />
            </button>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{t("profile.enable_2fa")}</h3>
              <p className="text-xs text-muted-foreground font-medium">{t("profile.enable_2fa_desc")}</p>
            </div>
            {setupStatus === "verifying" && (
              <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-center p-4 bg-secondary rounded-3xl inline-block mx-auto">
                  <QRCodeSVG value={qrCodeUri} size={200} />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("auth.mfa_desc")}</p>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-center text-2xl font-bold text-foreground focus:outline-none focus:border-primary transition-all tracking-[0.5em]"
                  />
                </div>
                <button 
                  onClick={handleEnable2FA}
                  className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                >
                  {t("buttons.confirm")}
                </button>
              </div>
            )}
            {setupStatus === "setting_up" && (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}