"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AppSession, Profile } from "@/types/database";

interface AuthState {
  session: AppSession | null;
  profile: Profile | null;
  setAuth: (session: AppSession | null, profile: Profile | null) => void;
  setBalance: (balance: number) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,
      setAuth: (session, profile) => set({ session, profile }),
      setBalance: (balance) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, balance } : state.profile,
        })),
      clear: () => set({ session: null, profile: null }),
    }),
    {
      name: "jmd-auth",
      partialize: (state) => ({
        session: state.session,
        profile: state.profile,
      }),
    },
  ),
);
