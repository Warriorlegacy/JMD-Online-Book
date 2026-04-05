"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedBalance } from "@/components/ui/animated-balance";
import { StreakIndicator } from "@/components/ui/streak-indicator";

interface HomeHeroProps {
  balance: number;
}

export function HomeHero({ balance }: HomeHeroProps) {
  const quickLinks = [
    {
      href: "/deposit",
      icon: ArrowDownToLine,
      label: "Deposit",
      color: "emerald",
      gradient: "from-emerald-400/20 to-emerald-500/10",
    },
    {
      href: "/withdraw",
      icon: ArrowUpFromLine,
      label: "Withdraw",
      color: "rose",
      gradient: "from-rose-400/20 to-rose-500/10",
    },
    {
      href: "/referral",
      icon: Users2,
      label: "Referral",
      color: "sky",
      gradient: "from-sky-400/20 to-sky-500/10",
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Alerts",
      color: "amber",
      gradient: "from-amber-400/20 to-amber-500/10",
    },
  ];

  return (
    <Card className="relative overflow-hidden">
      <motion.div
        className="absolute right-0 top-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-amber-400/18 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300/60">Live Wallet</p>
              <StreakIndicator streak={7} type="daily" />
            </div>
            <AnimatedBalance balance={balance} size="xl" className="mb-2" />
            <motion.p
              className="text-sm text-[var(--color-text-muted)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Every deposit approval, withdrawal action, and referral commission lands directly in
              your balance stream.
            </motion.p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge tone="success" className="ml-4">
              Realtime
            </Badge>
          </motion.div>
        </div>
        <p className="max-w-md text-sm text-[var(--color-text-muted)]">
          Every deposit approval, withdrawal action, and referral commission lands directly in your
          balance stream.
        </p>
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {quickLinks.map((item) => (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={item.href}
                className={`group relative overflow-hidden rounded-3xl border border-${item.color}-400/18 bg-gradient-to-br ${item.gradient} p-4 transition-all duration-300 hover:border-${item.color}-400/30 hover:shadow-lg hover:shadow-${item.color}-400/20`}
              >
                <motion.div
                  className={`text-${item.color}-300 transition-transform duration-300 group-hover:scale-110`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <p className="mt-4 font-semibold text-white transition-colors group-hover:text-white">
                  {item.label}
                </p>
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-${item.color}-400/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  initial={false}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  );
}
