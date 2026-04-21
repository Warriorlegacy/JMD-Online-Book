"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Loader2, User, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("Common");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(identifier, password);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, code: mfaCode }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "MFA verification failed");
      }
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-500 to-blue-600"></div>
        
        <div className="space-y-6">
          {!mfaToken ? (
            <>
               <div className="text-center space-y-2">
                 <h1 className="text-3xl font-black tracking-tighter bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent">
                   {t("auth.welcome_back")}
                 </h1>
                 <p className="text-sm text-slate-500 font-medium">
                   {t("auth.login_desc")}
                 </p>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t("profile.username")}</label>
                   <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder={t("auth.placeholder_username")}
                      required
                    />
                  </div>
                </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t("profile.password")}</label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                       placeholder={t("auth.placeholder_password")}
                       required
                     />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-white text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                     <>
                       {t("buttons.submit")} <ArrowRight className="w-4 h-4" />
                     </>
                   )}
                </button>
              </form>

               <div className="text-center pt-4">
                 <p className="text-xs text-slate-500">
                   {t("auth.no_account")} {" "}
                   <Link href="/register" className="text-cyan-400 font-bold hover:underline">
                     {t("buttons.confirm")}
                   </Link>
                 </p>
               </div>
            </>
          ) : (
            <>
               <div className="text-center space-y-2">
                 <div className="flex justify-center mb-4">
                   <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500">
                     <ShieldCheck className="w-8 h-8" />
                   </div>
                 </div>
                 <h1 className="text-3xl font-black tracking-tighter bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent">
                   {t("auth.mfa_title")}
                 </h1>
                 <p className="text-sm text-slate-500 font-medium">
                   {t("auth.mfa_desc")}
                 </p>
               </div>

              <form onSubmit={handleMfaVerify} className="space-y-4">
                <div className="space-y-2">
                   <input
                     type="text"
                     maxLength={6}
                     value={mfaCode}
                     onChange={(e) => setMfaCode(e.target.value)}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-6 text-center text-2xl font-black text-white focus:outline-none focus:border-cyan-500 transition-all tracking-[0.5em]"
                     placeholder={t("auth.placeholder_mfa")}
                     required
                   />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-lg">
                    {error}
                  </div>
                )}

                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full h-12 bg-white text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("buttons.confirm")}
                 </button>
                 
                 <button 
                   type="button"
                   onClick={() => setMfaToken(null)}
                   className="w-full text-xs text-slate-500 font-medium hover:text-slate-300 transition-colors"
                 >
                   {t("buttons.back")}
                 </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
