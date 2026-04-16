import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/use-auth-store";
import type { AppSession, Profile } from "@/types/database";

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
  });

  it("should have initial null state", () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.profile).toBeNull();
  });

  it("should set auth state", () => {
    const session: AppSession = {
      id: "user-123",
      email: "test@example.com",
      role: "user",
      fullName: "Test User",
      accessToken: "token-123",
    };
    const profile: Profile = {
      id: "user-123",
      tenant_id: null,
      full_name: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      role: "user",
      balance: 1000,
      bonus_balance: 50,
      total_deposited: 5000,
      total_withdrawn: 2000,
      total_won: 3000,
      total_lost: 1500,
      referral_code: "ABC123",
      referred_by: null,
      agent_id: null,
      is_active: true,
      is_verified: true,
      avatar_url: null,
      bank_account: null,
      ifsc_code: null,
      account_holder: null,
      upi_id: null,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(session, profile);

    const state = useAuthStore.getState();
    expect(state.session).toEqual(session);
    expect(state.profile).toEqual(profile);
  });

  it("should update balance", () => {
    const session: AppSession = {
      id: "user-123",
      email: "test@example.com",
      role: "user",
      fullName: "Test User",
      accessToken: "token-123",
    };
     const profile: Profile = {
      id: "user-123",
      tenant_id: null,
      full_name: "Test User",
      email: "test@example.com",
      phone: null,
      role: "user",
      balance: 1000,
      bonus_balance: 0,
      total_deposited: 0,
      total_withdrawn: 0,
      total_won: 0,
      total_lost: 0,
      referral_code: "ABC123",
      referred_by: null,
      agent_id: null,
      is_active: true,
      is_verified: true,
      avatar_url: null,
      bank_account: null,
      ifsc_code: null,
      account_holder: null,
      upi_id: null,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useAuthStore.getState().setAuth(session, profile);
    useAuthStore.getState().setBalance(2500);

    const state = useAuthStore.getState();
    expect(state.profile?.balance).toBe(2500);
    // Session should remain unchanged
    expect(state.session).toEqual(session);
  });

  it("should not update balance when profile is null", () => {
    useAuthStore.getState().setBalance(5000);
    const state = useAuthStore.getState();
    expect(state.profile).toBeNull();
  });

  it("should clear auth state", () => {
    const session: AppSession = {
      id: "user-123",
      email: "test@example.com",
      role: "user",
      fullName: "Test User",
      accessToken: "token-123",
    };
    useAuthStore.getState().setAuth(session, null);

    expect(useAuthStore.getState().session).not.toBeNull();

    useAuthStore.getState().clear();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.profile).toBeNull();
  });
});
