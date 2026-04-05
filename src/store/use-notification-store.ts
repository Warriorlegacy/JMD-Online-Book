"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Notification } from "@/types/database";

interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  pushNotification: (notification: Notification) => void;
  markRead: (notificationId: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      pushNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications.filter((item) => item.id !== notification.id)],
        })),
      markRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification,
          ),
        })),
    }),
    {
      name: "jmd-notifications",
    },
  ),
);
