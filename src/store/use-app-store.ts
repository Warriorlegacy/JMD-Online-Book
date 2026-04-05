"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PaymentMethod, SiteSetting } from "@/types/database";

interface AppState {
  settings: SiteSetting[];
  paymentMethods: PaymentMethod[];
  setBootstrap: (payload: { settings: SiteSetting[]; paymentMethods: PaymentMethod[] }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: [],
      paymentMethods: [],
      setBootstrap: ({ settings, paymentMethods }) =>
        set({ settings, paymentMethods }),
    }),
    {
      name: "jmd-app",
    },
  ),
);
