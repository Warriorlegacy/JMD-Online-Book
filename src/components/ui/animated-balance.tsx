"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

interface AnimatedBalanceProps {
  balance: number;
  className?: string;
  showSymbol?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AnimatedBalance({
  balance,
  className,
  showSymbol = true,
  size = "lg"
}: AnimatedBalanceProps) {
  const [prevBalance, setPrevBalance] = React.useState(balance);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const motionValue = useMotionValue(balance);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 0.8
  });

  React.useEffect(() => {
    if (balance !== prevBalance) {
      setIsAnimating(true);
      motionValue.set(balance);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevBalance(balance);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [balance, prevBalance, motionValue]);

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
    xl: "text-5xl"
  };

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 font-bold font-[family-name:var(--font-space-grotesk)]",
        sizeClasses[size],
        className
      )}
      animate={isAnimating ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {showSymbol && (
        <motion.span
          className="text-gradient text-3xl font-black"
          animate={isAnimating ? {
            rotate: [0, -5, 5, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          ₹
        </motion.span>
      )}
      <motion.span
        className="text-white"
        style={{
          textShadow: isAnimating
            ? "0 0 20px rgba(245, 158, 11, 0.5)"
            : "none"
        }}
      >
        {formatBalance(springValue.get())}
      </motion.span>

      {isAnimating && balance > prevBalance && (
        <motion.div
          className="absolute -top-2 -right-2 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          +{formatBalance(balance - prevBalance)}
        </motion.div>
      )}
    </motion.div>
  );
}