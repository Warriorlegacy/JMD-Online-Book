"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export const Card = React.memo(function Card({
  className,
  children,
  hover = true,
  animated = true,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  animated?: boolean;
}) {
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    hover: hover ? {
      y: -4,
      scale: 1.02,
      boxShadow: "0 32px 96px rgba(245, 158, 11, 0.12), 0 0 0 1px rgba(245, 158, 11, 0.08)"
    } : {},
  };

  const Component = animated ? motion.div : "div";

  return (
    <Component
      className={cn(
        "glass-panel rounded-[28px] p-5 transition-shadow duration-300",
        hover && "cursor-pointer",
        className
      )}
      variants={animated ? cardVariants : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? "animate" : undefined}
      whileHover={animated ? "hover" : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </Component>
  );
});
