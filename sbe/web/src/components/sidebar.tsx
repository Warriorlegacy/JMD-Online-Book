"use client";
 
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { 
  Flag, 
  Gamepad2, 
  Zap, 
  Star, 
  Target, 
  Sword,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
 
const CATEGORIES = [
  { id: "in-play", name: "in_play", icon: Zap, color: "text-amber-500", count: 12 },
  { id: "cricket", name: "cricket", icon: Target, color: "text-emerald-500", count: 8 },
  { id: "football", name: "football", icon: Flag, color: "text-sky-500", count: 15 },
  { id: "tennis", name: "tennis", icon: Star, color: "text-lime-500", count: 4 },
  { id: "e-sports", name: "e_sports", icon: Gamepad2, color: "text-purple-500", count: 20 },
  { id: "kabaddi", name: "kabaddi", icon: Sword, color: "text-orange-500", count: 3 },
];
 
export function Sidebar() {
  const t = useTranslations("Common");
  const searchParams = useSearchParams();
  const activeSport = searchParams.get("sport") || "in-play";

  return (
    <aside className="w-full h-full flex flex-col gap-7 pb-8 glass-panel p-4">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
        <input 
          type="text" 
          placeholder={t("common.placeholder_find_market")}
          className={cn(
            "w-full h-12 glass-input rounded-xl pl-12 pr-4 text-sm font-sans",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none transition-all duration-300",
            "hover:border-border/80"
          )}
        />
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        <div>
          <h3 className="text-xs font-heading uppercase tracking-[0.25em] text-muted-foreground mb-4 px-1">{t("common.categories")}</h3>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeSport === cat.id;
              
              return (
                <Link 
                  key={cat.id} 
                  href={`/?sport=${cat.id}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all duration-300 group",
                    "will-change-transform hover:scale-[1.01] active:scale-[0.995]",
                    isActive 
                      ? "glass bg-primary/10 border-primary/30 text-primary" 
                      : "text-foreground/70 hover:text-foreground hover:glass border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                        : "bg-accent group-hover:bg-accent/80 group-hover:scale-105"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-sans font-medium tracking-tight">{t(`sports.${cat.name}`)}</span>
                  </div>
                  {cat.count > 0 && (
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-200",
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {cat.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-heading uppercase tracking-[0.25em] text-muted-foreground mb-4 px-1">{t("common.popular")}</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl glass-card group hover:scale-[1.01] transition-all duration-300 cursor-pointer">
              <p className="text-xs font-heading uppercase tracking-widest text-indigo-500 mb-1">Premier League</p>
              <p className="text-sm font-sans font-medium text-foreground mb-2">Man City v Arsenal</p>
              <div className="flex justify-between items-center text-xs font-sans text-muted-foreground">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> {t("sports.live")}</span>
                <span className="text-indigo-500 group-hover:translate-x-0.5 transition-transform duration-200">View →</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl glass-card group hover:scale-[1.01] transition-all duration-300 cursor-pointer">
              <p className="text-xs font-heading uppercase tracking-widest text-emerald-500 mb-1">CPL 2026</p>
              <p className="text-sm font-sans font-medium text-foreground mb-2">TKR v GAW</p>
              <div className="flex justify-between items-center text-xs font-sans text-muted-foreground">
                <span>Today 19:30</span>
                <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform duration-200">View →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 px-4 py-5 rounded-2xl glass-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl group-hover:bg-primary/15 transition-all duration-500"></div>
        <p className="text-xs font-heading uppercase tracking-[0.2em] text-primary mb-2">{t("common.pro_version")}</p>
        <p className="text-sm font-sans text-foreground leading-relaxed mb-4">{t("common.pro_desc")}</p>
        <button className={cn(
          "w-full py-3 rounded-xl transition-all duration-300",
          "bg-primary text-primary-foreground text-xs font-heading uppercase tracking-widest",
          "hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99]",
          "shadow-lg shadow-primary/20"
        )}>
          {t("common.upgrade_now")}
        </button>
      </div>
    </aside>
  );
}
