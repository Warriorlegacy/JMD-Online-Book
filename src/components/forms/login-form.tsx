"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowRight, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validators";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onPasswordLogin = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.error ?? "Unable to login");
        return;
      }
      toast.success("Welcome back! 🎉");
      router.push(payload.data?.role === "admin" ? "/admin/dashboard" : "/home");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onPasswordLogin} className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            placeholder="your@email.com" 
            className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            {...form.register("email")} 
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            type="password" 
            placeholder="••••••••" 
            className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            {...form.register("password")} 
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/20" />
          <span className="text-sm text-slate-400">Remember me</span>
        </label>
        <button type="button" className="text-sm font-medium text-amber-400 hover:text-amber-300">
          Forgot password?
        </button>
      </div>

      <Button 
        className="h-12 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-base font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20" 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Sign In
            <ArrowRight className="h-5 w-5" />
          </span>
        )}
      </Button>
    </form>
  );
}
