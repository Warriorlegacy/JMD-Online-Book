"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Loader2, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";


export default function RegisterPage() {
  const t = useTranslations("Common");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("errors.passwords_do_not_match"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(username, email, password);
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
           <div className="text-center space-y-2">
             <h1 className="text-3xl font-black tracking-tighter bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent">
               {t("auth.create_account")}
             </h1>
             <p className="text-sm text-slate-500 font-medium">
               {t("auth.join_desc")}
             </p>
           </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t("profile.username")}</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input
                   type="text"
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium"
                   placeholder={t("auth.placeholder_register_username")}
                   required
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t("profile.email")}</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium"
                   placeholder={t("auth.placeholder_register_email")}
                   required
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t("profile.password")}</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium"
                     placeholder={t("auth.placeholder_password")}
                     required
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t("buttons.confirm")}</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium"
                     placeholder={t("auth.placeholder_password")}
                     required
                   />
                 </div>
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
                   {t("auth.create_account")} <ArrowRight className="w-4 h-4" />
                 </>
               )}
             </button>
           </form>
 
           <div className="text-center pt-4">
             <p className="text-xs text-slate-500">
               {t("auth.already_have_account")} {" "}
               <Link href="/login" className="text-cyan-400 font-bold hover:underline">
                 {t("auth.sign_in")}
               </Link>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
