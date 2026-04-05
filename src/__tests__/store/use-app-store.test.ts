import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store/use-app-store";
import type { SiteSetting, PaymentMethod } from "@/types/database";

describe("App Store", () => {
  beforeEach(() => {
    useAppStore.getState().setBootstrap({ settings: [], paymentMethods: [] });
  });

  it("should have initial empty state", () => {
    const state = useAppStore.getState();
    expect(state.settings).toEqual([]);
    expect(state.paymentMethods).toEqual([]);
  });

  it("should set bootstrap data", () => {
    const settings: SiteSetting[] = [
      {
        key: "site_name",
        value: "Test Site",
        type: "string",
        description: "Test",
        updated_at: new Date().toISOString(),
      },
    ];
    const paymentMethods: PaymentMethod[] = [
      {
        id: "pm-1",
        name: "UPI",
        type: "upi",
        details: {},
        is_active: true,
        for_deposit: true,
        for_withdraw: false,
        sort_order: 1,
        min_amount: 100,
        max_amount: 10000,
        created_at: new Date().toISOString(),
      },
    ];

    useAppStore.getState().setBootstrap({ settings, paymentMethods });

    const state = useAppStore.getState();
    expect(state.settings).toHaveLength(1);
    expect(state.settings[0].key).toBe("site_name");
    expect(state.paymentMethods).toHaveLength(1);
    expect(state.paymentMethods[0].name).toBe("UPI");
  });

  it("should override previous bootstrap data", () => {
    // Set initial data
    useAppStore.getState().setBootstrap({
      settings: [{ key: "old", value: "old", type: "string", description: "", updated_at: "" }],
      paymentMethods: [],
    });

    // Override with new data
    useAppStore.getState().setBootstrap({
      settings: [{ key: "new", value: "new", type: "string", description: "", updated_at: "" }],
      paymentMethods: [],
    });

    const state = useAppStore.getState();
    expect(state.settings).toHaveLength(1);
    expect(state.settings[0].key).toBe("new");
  });
});
