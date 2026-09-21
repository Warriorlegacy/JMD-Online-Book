"use client";

import React, { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English", label: "English" },
  { code: "es", name: "Español", label: "Spanish" },
  { code: "fr", name: "Français", label: "French" },
  { code: "de", name: "Deutsch", label: "German" },
  { code: "pt", name: "Português", label: "Portuguese" },
  { code: "ru", name: "Русский", label: "Russian" },
  { code: "zh", name: "中文", label: "Chinese" },
];

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages?.[0];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-slate-300 hover:text-white group",
          "text-[10px] font-bold uppercase tracking-wider"
        )}
      >
        <Globe className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span>{currentLanguage.name}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1.5 flex flex-col gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200",
                    locale === lang.code 
                      ? "bg-cyan-500/20 text-cyan-400" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="text-xs font-medium">{lang.name}</span>
                  {locale === lang.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
