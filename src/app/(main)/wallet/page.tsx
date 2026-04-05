import { motion } from "framer-motion";
import { Landmark, Wallet2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { AnimatedBalance } from "@/components/ui/animated-balance";
import { StreakIndicator } from "@/components/ui/streak-indicator";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMainDashboardData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function WalletPage() {
  const data = await getMainDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Wallet"
        title="Balance and settlement view"
        subtitle="Track total deposits, withdrawals, and current spendable balance."
      />
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-3 relative overflow-hidden">
            <motion.div
              className="absolute top-4 right-4 h-20 w-20 rounded-full bg-amber-400/10 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Wallet2 className="h-5 w-5 text-amber-300" />
            </motion.div>
            <p className="text-sm text-[var(--color-text-muted)]">Available balance</p>
            <AnimatedBalance
              balance={Number(data.profile?.balance ?? 0)}
              size="lg"
              showSymbol={false}
            />
            <div className="pt-2">
              <StreakIndicator streak={12} type="daily" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Landmark className="h-5 w-5 text-emerald-300" />
            </motion.div>
            <p className="text-sm text-[var(--color-text-muted)]">Total deposited</p>
            <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-emerald-200">
              {formatCurrency(Number(data.profile?.total_deposited ?? 0))}
            </p>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="space-y-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Landmark className="h-5 w-5 text-rose-300" />
            </motion.div>
            <p className="text-sm text-[var(--color-text-muted)]">Total withdrawn</p>
            <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-rose-200">
              {formatCurrency(Number(data.profile?.total_withdrawn ?? 0))}
            </p>
          </Card>
        </motion.div>
      </motion.div>
      <Card className="space-y-4">
        <SectionHeading
          title="Recent wallet ledger"
          subtitle="Approved and pending entries are visible here in real time."
        />
        <div className="space-y-3">
          {data.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-3xl border border-white/6 bg-white/4 px-4 py-3"
            >
              <div>
                <p className="font-semibold capitalize text-white">{transaction.type}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{transaction.status}</p>
              </div>
              <p className="font-semibold text-white">
                {formatCurrency(Number(transaction.amount))}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
