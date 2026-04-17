"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  type?: "daily" | "login" | "win";
  className?: string;
}

export function StreakIndicator({ streak, type = "daily", className }: StreakIndicatorProps) {
  const getColor = () => {
    if (streak >= 30) return "text-orange-400";
    if (streak >= 7) return "text-yellow-400";
    if (streak >= 3) return "text-amber-400";
    return "text-gray-400";
  };

  const renderIcon = () => {
    const className = cn("h-4 w-4", getColor());
    switch (type) {
      case "daily":
        return <Flame className={className} />;
      case "login":
        return <Zap className={className} />;
      case "win":
        return <Trophy className={className} />;
      default:
        return <Flame className={className} />;
    }
  };

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={{
          scale: streak > 0 ? [1, 1.2, 1] : 1,
          rotate: streak > 0 ? [0, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }}
      >
        {renderIcon()}
      </motion.div>
      <span className="text-sm font-medium text-white">{streak}</span>
      <span className="text-xs text-gray-400">day streak</span>
    </motion.div>
  );
}