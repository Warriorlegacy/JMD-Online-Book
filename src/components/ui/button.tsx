"use client";

import * as React from "react";
import { type HTMLMotionProps, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  type = "button",
  children,
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(event);
  };

  return (
    <motion.button
      type={type}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[var(--color-gold)] text-slate-950 shadow-[0_18px_48px_rgba(245,158,11,0.22)] hover:shadow-[0_24px_64px_rgba(245,158,11,0.32)] hover:scale-[1.02] active:scale-[0.98]",
        variant === "secondary" &&
          "border border-white/10 bg-white/6 text-white backdrop-blur-xl hover:bg-white/10 hover:border-white/20 active:scale-[0.98]",
        variant === "ghost" && "text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 active:scale-[0.98]",
        variant === "danger" && "bg-[var(--color-danger)] text-white hover:bg-red-500 active:scale-[0.98]",
        className,
      )}
      whileHover={{ scale: variant === "primary" ? 1.02 : 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      {...props}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          initial={{
            width: 0,
            height: 0,
            left: ripple.x,
            top: ripple.y,
            opacity: 0.6,
          }}
          animate={{
            width: 200,
            height: 200,
            left: ripple.x - 100,
            top: ripple.y - 100,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            pointerEvents: "none",
          }}
        />
      ))}
    </motion.button>
  );
}
