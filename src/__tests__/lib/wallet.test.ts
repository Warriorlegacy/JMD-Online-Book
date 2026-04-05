import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Wallet Module", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("applyBalanceDelta", () => {
    it("should return error when user not found", async () => {
      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }));

      const { applyBalanceDelta } = await import("@/lib/wallet");
      const result = await applyBalanceDelta({
        userId: "nonexistent",
        amount: 100,
        type: "deposit",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should reject withdraw when insufficient balance", async () => {
      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { id: "user-1", balance: 50 },
                    error: null,
                  }),
              }),
            }),
          }),
        }),
      }));

      const { applyBalanceDelta } = await import("@/lib/wallet");
      const result = await applyBalanceDelta({
        userId: "user-1",
        amount: -100,
        type: "withdraw",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient balance");
    });

    it("should reject bet when insufficient balance", async () => {
      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          from: () => ({
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { id: "user-1", balance: 10 },
                    error: null,
                  }),
              }),
            }),
          }),
        }),
      }));

      const { applyBalanceDelta } = await import("@/lib/wallet");
      const result = await applyBalanceDelta({
        userId: "user-1",
        amount: -50,
        type: "bet",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Insufficient balance");
    });

    it("should allow deposit even with zero balance", async () => {
      const mockEq2 = {
        select: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: {
                id: "user-1",
                balance: 500,
                total_deposited: 600,
                total_withdrawn: 0,
              },
              error: null,
            })
          ),
        })),
      };
      const mockEq1 = {
        eq: vi.fn(() => mockEq2),
      };
      const mockUpdateChain = {
        eq: vi.fn(() => mockEq1),
      };

      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          from: (table: string) => {
            if (table === "profiles") {
              return {
                select: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    maybeSingle: vi.fn(() =>
                      Promise.resolve({
                        data: {
                          id: "user-1",
                          balance: 0,
                          total_deposited: 100,
                          total_withdrawn: 0,
                        },
                        error: null,
                      })
                    ),
                  })),
                })),
                update: vi.fn(() => mockUpdateChain),
              };
            }
            return {
              select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
              update: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ select: vi.fn(() => ({ maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })) })) })),
            };
          },
        }),
      }));

      const { applyBalanceDelta } = await import("@/lib/wallet");
      const result = await applyBalanceDelta({
        userId: "user-1",
        amount: 500,
        type: "deposit",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("computeDashboardStats", () => {
    it("should return stats from RPC call", async () => {
      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          rpc: () =>
            Promise.resolve({
              data: {
                total_users: 150,
                total_agents: 10,
                today_deposits: 25000,
                today_withdrawals: 15000,
                pending_deposits: 5000,
                pending_withdrawals: 3000,
                total_balance: 500000,
                new_users_today: 12,
              },
              error: null,
            }),
        }),
      }));

      const { computeDashboardStats } = await import("@/lib/wallet");
      const stats = await computeDashboardStats();
      expect(stats.total_users).toBe(150);
      expect(stats.total_agents).toBe(10);
      expect(stats.today_deposits).toBe(25000);
      expect(stats.today_withdrawals).toBe(15000);
      expect(stats.pending_deposits).toBe(5000);
      expect(stats.pending_withdrawals).toBe(3000);
      expect(stats.total_balance).toBe(500000);
      expect(stats.new_users_today).toBe(12);
    });

    it("should default to zero for missing stats", async () => {
      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          rpc: () =>
            Promise.resolve({
              data: {},
              error: null,
            }),
        }),
      }));

      const { computeDashboardStats } = await import("@/lib/wallet");
      const stats = await computeDashboardStats();
      expect(stats.total_users).toBe(0);
      expect(stats.total_agents).toBe(0);
      expect(stats.today_deposits).toBe(0);
    });

    it("should throw when RPC returns error", async () => {
      vi.doMock("@/lib/supabase/admin", () => ({
        createAdminClient: () => ({
          rpc: () =>
            Promise.resolve({
              data: null,
              error: new Error("RPC failed"),
            }),
        }),
      }));

      const { computeDashboardStats } = await import("@/lib/wallet");
      await expect(computeDashboardStats()).rejects.toThrow();
    });
  });
});
