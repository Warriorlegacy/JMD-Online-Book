"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { User, Wallet, Loader2, LogOut, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function HeaderActions() {
  const { user, loading, logout } = useAuth();
  const { connected, on } = useSocket();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [balance, setBalance] = React.useState<number | null>(null);
  
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
  ];

  React.useEffect(() => {
    if (!user) {
      setBalance(null);
      return;
    }
    fetch('/api/wallet/balance')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed');
      })
      .then(data => {
        setBalance(data.available || 0);
      })
      .catch(() => setBalance(null));
   }, [user]);

  React.useEffect(() => {
    if (!connected || !user) return;
    const unsubscribe = on<{ userId: string; available: number; locked: number }>("balance_update", (data) => {
      if (data.userId === user.id) {
        setBalance(data.available);
      }
    });
    return () => unsubscribe();
  }, [connected, user, on]);


  if (loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-slate-500" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link 
          href={`/${locale}/login`} 
          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center"
        >
          {t("buttons.submit")}
        </Link>
        <Link 
          href={`/${locale}/register`} 
          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-lg active:scale-95 flex items-center"
        >
          {t("buttons.confirm")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 relative">
      <div className="relative">
        <button 
          onClick={() => setLangOpen(!langOpen)}
          className="h-10 px-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 group"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="uppercase text-[10px] font-black tracking-widest text-slate-400 group-hover:text-white transition-colors">
            {locale}
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-all", langOpen && "rotate-180")} />
        </button>

        {langOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)}></div>
            <div className="absolute right-0 mt-3 w-40 rounded-3xl bg-slate-900 border border-white/10 p-2 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    router.replace(pathname, { locale: lang.code });
                    setLangOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    locale === lang.code ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {lang.name}
                  {locale === lang.code && <div className="w-1 h-1 rounded-full bg-cyan-400"></div>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Link 
        href={`/${locale}/wallet`} 
        className="hidden sm:flex flex-col items-end group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t("wallet.balance")}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        {balance !== null ? (
          <span className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-sm font-black text-slate-500">—</span>
        )}
      </Link>

      <div className="h-8 w-px bg-white/5 hidden sm:block"></div>

      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-10 px-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 group"
        >
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-black italic">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
            {user.username}
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-all", dropdownOpen && "rotate-180")} />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
            <div className="absolute right-0 mt-3 w-56 rounded-3xl bg-slate-900 border border-white/10 p-2 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200">
              <Link 
                href={`/${locale}/profile`} 
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t("profile.username")}</span>
                </div>
                <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100" />
              </Link>
              <Link 
                href={`/${locale}/wallet`} 
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t("wallet.transaction_history")}</span>
                </div>
                <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100" />
              </Link>
              <div className="my-2 border-t border-white/5"></div>
              <button 
                onClick={() => { logout(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t("navigation.logout")}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

