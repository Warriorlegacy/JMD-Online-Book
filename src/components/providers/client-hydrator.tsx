"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store/use-app-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useNotificationStore } from "@/store/use-notification-store";
import type { AppSession, Notification, PaymentMethod, Profile, SiteSetting } from "@/types/database";

export function ClientHydrator({
  session,
  profile,
  notifications,
  settings,
  paymentMethods,
}: {
  session: AppSession | null;
  profile: Profile | null;
  notifications: Notification[];
  settings: SiteSetting[];
  paymentMethods: PaymentMethod[];
}) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setBootstrap = useAppStore((state) => state.setBootstrap);

  useEffect(() => {
    setAuth(session, profile);
    setNotifications(notifications);
    setBootstrap({ settings, paymentMethods });
  }, [
    notifications,
    paymentMethods,
    profile,
    router,
    session,
    setAuth,
    setBootstrap,
    setNotifications,
    settings,
  ]);

  useEffect(() => {
    if (!session) return;

    const interval = window.setInterval(() => {
      router.refresh();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [router, session]);

  return null;
}
