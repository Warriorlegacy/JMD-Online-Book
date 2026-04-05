import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "@/store/use-notification-store";
import type { Notification } from "@/types/database";

describe("Notification Store", () => {
  beforeEach(() => {
    useNotificationStore.getState().setNotifications([]);
  });

  it("should have initial empty notifications", () => {
    const state = useNotificationStore.getState();
    expect(state.notifications).toEqual([]);
  });

  it("should set notifications", () => {
    const notifications: Notification[] = [
      {
        id: "notif-1",
        user_id: "user-123",
        title: "Welcome",
        body: "Welcome to the platform",
        type: "info",
        is_read: false,
        action_url: null,
        metadata: {},
        created_at: new Date().toISOString(),
      },
    ];

    useNotificationStore.getState().setNotifications(notifications);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].title).toBe("Welcome");
  });

  it("should push a new notification to the front", () => {
    useNotificationStore.getState().setNotifications([
      {
        id: "notif-1",
        user_id: "user-123",
        title: "Old",
        body: "Old notification",
        type: "info",
        is_read: true,
        action_url: null,
        metadata: {},
        created_at: new Date().toISOString(),
      },
    ]);

    const newNotif: Notification = {
      id: "notif-2",
      user_id: "user-123",
      title: "New",
      body: "New notification",
      type: "success",
      is_read: false,
      action_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    useNotificationStore.getState().pushNotification(newNotif);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(2);
    // New notification should be first
    expect(state.notifications[0].title).toBe("New");
  });

  it("should replace existing notification with same id", () => {
    const existing: Notification = {
      id: "notif-1",
      user_id: "user-123",
      title: "Original",
      body: "Original body",
      type: "info",
      is_read: false,
      action_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    useNotificationStore.getState().setNotifications([existing]);

    const updated: Notification = {
      id: "notif-1",
      user_id: "user-123",
      title: "Updated",
      body: "Updated body",
      type: "warning",
      is_read: false,
      action_url: null,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    useNotificationStore.getState().pushNotification(updated);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].title).toBe("Updated");
  });

  it("should mark a notification as read", () => {
    const notifications: Notification[] = [
      {
        id: "notif-1",
        user_id: "user-123",
        title: "Unread",
        body: "Body",
        type: "info",
        is_read: false,
        action_url: null,
        metadata: {},
        created_at: new Date().toISOString(),
      },
      {
        id: "notif-2",
        user_id: "user-123",
        title: "Also Unread",
        body: "Body",
        type: "info",
        is_read: false,
        action_url: null,
        metadata: {},
        created_at: new Date().toISOString(),
      },
    ];

    useNotificationStore.getState().setNotifications(notifications);
    useNotificationStore.getState().markRead("notif-1");

    const state = useNotificationStore.getState();
    expect(state.notifications.find((n) => n.id === "notif-1")?.is_read).toBe(true);
    // Other notification should remain unchanged
    expect(state.notifications.find((n) => n.id === "notif-2")?.is_read).toBe(false);
  });

  it("should handle markRead for non-existent notification", () => {
    useNotificationStore.getState().setNotifications([]);
    // Should not throw
    expect(() => useNotificationStore.getState().markRead("nonexistent")).not.toThrow();
  });
});
