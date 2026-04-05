"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowRight, User, Mail, Phone, Lock, Gift } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerPayloadSchema } from "@/lib/validators";

type RegisterValues = z.infer<typeof registerPayloadSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerPayloadSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      phone: "",
      referralCode: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const payload = await response.json().catch(() => ({ error: "Unexpected server error" }));
        if (!response.ok) {
          toast.error(payload.error ?? "Unable to create account");
          return;
        }
        toast.success("Account created! Welcome aboard! 🎉");
        router.push(payload.data?.role === "admin" ? "/admin/dashboard" : "/home");
        router.refresh();
      } catch {
        toast.error("Network error. Please check your connection and try again.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Full Name</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            placeholder="Your full name" 
            className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            {...form.register("fullName")} 
          />
        </div>
      </div>

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
        <label className="text-sm font-medium text-slate-300">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            placeholder="9876543210" 
            className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            {...form.register("phone")} 
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            type="password" 
            placeholder="Create a strong password" 
            className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            {...form.register("password")} 
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Referral Code <span className="text-slate-500">(optional)</span></label>
        <div className="relative">
          <Gift className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input 
            placeholder="Enter referral code" 
            className="h-12 border-white/10 bg-white/5 pl-12 text-white placeholder:text-slate-600 focus:border-amber-500/50 focus:ring-amber-500/20"
            {...form.register("referralCode")} 
          />
        </div>
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
            Creating account...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Create Account
            <ArrowRight className="h-5 w-5" />
          </span>
        )}
      </Button>
    </form>
  );
}
