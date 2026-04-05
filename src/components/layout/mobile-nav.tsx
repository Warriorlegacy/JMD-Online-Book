"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CircleUserRound,
  Gamepad2,
  House,
  IndianRupee,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: House },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/transactions", label: "Ledger", icon: IndianRupee },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
];

export const MobileNav = memo(function MobileNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-[#0a0f18]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-1">
        {navItems.map(({ href, label, icon: Icon }, index) => {
          const active = pathname.startsWith(href);
          return (
            <motion.div
              key={href}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-[10px] font-medium transition-all duration-300",
                  active
                    ? "text-amber-300 bg-gradient-to-t from-amber-500/20 to-amber-500/5"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                >
                  <Icon className="h-4 w-4" />
                  {active && (
                    <motion.div
                      className="absolute -inset-1 rounded-full bg-amber-400/20 blur-sm"
                      layoutId="activeTab"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
                <span className="relative z-10">{label}</span>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    className="absolute -top-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
});
