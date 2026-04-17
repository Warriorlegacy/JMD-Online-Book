import { cache } from "react";
import { cookies } from "next/headers";

import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ensureRepoBootstrap,
  getCommissions,
  getGames,
  getNotifications,
  getPaymentMethods,
  getProfile,
  getProfiles,
  getSettings,
  getTenants,
  getTransactions,
} from "@/lib/repo";
import { computeDashboardStats } from "@/lib/wallet";
import type {
  AppSession,
  Commission,
  DashboardStats,
  Game,
  Notification,
  PaymentMethod,
  PlatformStats,
  Profile,
  ReferralTreeNode,
  SiteSetting,
  Transaction,
} from "@/types/database";

export const getAppBootstrap = cache(async () => {
  await ensureRepoBootstrap();
  const [siteSettings, paymentMethods, games] = await Promise.all([
    getSettings(),
    getPaymentMethods(),
    getGames(),
  ]);

  return {
    siteSettings: (siteSettings ?? []) as SiteSetting[],
    paymentMethods: (paymentMethods ?? []).filter((item) => item.is_active !== false) as PaymentMethod[],
    games: (games ?? []).filter((item) => item.is_active !== false) as Game[],
  };
});

export async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;
  return (await getProfile(session.id)) as Profile | null;
}

export async function getSessionWithProfile() {
  const [session, profile] = await Promise.all([getSession(), getCurrentProfile()]);
  return { session, profile };
}

export async function getMainDashboardData() {
  const [bootstrap, session, profile] = await Promise.all([
    getAppBootstrap(),
    getSession(),
    getCurrentProfile(),
  ]);

  const userId = session?.id;
  const [transactions, notifications, commissions] = await Promise.all([
    userId ? getTransactions(userId, 10, 0) : Promise.resolve([]),
    userId ? getNotifications(userId, 10, 0) : Promise.resolve([]),
    userId ? getCommissions(userId, 10, 0) : Promise.resolve([]),
  ]);

  return {
    ...bootstrap,
    session,
    profile,
    transactions: transactions as Transaction[],
    notifications: notifications as Notification[],
    commissions: commissions as Commission[],
  };
}

export async function getAdminDashboardData() {
  const [bootstrap, session, profile, statsResponse, transactions, profiles] = await Promise.all([
    getAppBootstrap(),
    getSession(),
    getCurrentProfile(),
    computeDashboardStats(),
    getTransactions(undefined, 20, 0),
    getProfiles(10, 0),
  ]);

  const adminActivityData = await getNotifications(session?.id, 12, 0);

  const users = profiles
    .slice()
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")) as Profile[];

  return {
    ...bootstrap,
    session,
    profile,
    stats: statsResponse as DashboardStats,
    adminActivity: (adminActivityData as Notification[] ?? []).filter(
      (item) =>
        typeof item.metadata === "object" &&
        item.metadata !== null &&
        !Array.isArray(item.metadata) &&
        item.metadata.scope === "admin_audit",
    ) as Notification[],
    users,
    transactions: transactions
      .slice()
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")) as Transaction[],
  };
}

export async function getReferralTree(session: AppSession): Promise<ReferralTreeNode | null> {
  const [profiles, commissions] = await Promise.all([getProfiles(), getCommissions()]);
  const profile = profiles.find((item) => item.id === session.id) ?? null;

  if (!profile) return null;

  const directReferrals = profiles.filter((item) => item.referred_by === session.id);

  const directIds = (directReferrals ?? []).map((item) => item.id);
  const secondLevelReferrals = profiles.filter((item) => directIds.includes(item.referred_by ?? ""));

  return {
    profile: profile as Profile,
    directReferrals: (directReferrals ?? []) as Profile[],
    secondLevelReferrals: (secondLevelReferrals ?? []) as Profile[],
    commissions: (commissions ?? []).filter((item) => item.agent_id === session.id) as Commission[],
  };
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("jmd_session");
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("get_platform_stats");
  if (error) throw error;
  const stats = (data ?? {}) as Record<string, number>;
  return {
    total_tenants: stats.total_tenants ?? 0,
    active_tenants: stats.active_tenants ?? 0,
    suspended_tenants: stats.suspended_tenants ?? 0,
    total_users: stats.total_users ?? 0,
    total_admins: stats.total_admins ?? 0,
    total_revenue: stats.total_revenue ?? 0,
    monthly_revenue: stats.monthly_revenue ?? 0,
    pending_approvals: stats.pending_approvals ?? 0,
  };
}

export async function getTenantList(limit = 50, offset = 0) {
  return getTenants(limit, offset);
}
