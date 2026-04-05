import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Bet,
  Commission,
  Database,
  Game,
  Notification,
  PaymentMethod,
  PlatformRevenue,
  Profile,
  SiteSetting,
  Tenant,
  Transaction,
} from "@/types/database";

const LEGACY_BUCKET = "appdata";
const MIGRATION_FLAG_KEY = "legacy_storage_migrated_at";

export async function getTenants(limit = 50, offset = 0) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data ?? [];
}

export async function getTenantById(tenantId: string) {
  const db = createAdminClient();
  const { data, error } = await db.from("tenants").select("*").eq("id", tenantId).maybeSingle();
  if (error) throw error;
  return data as Tenant | null;
}

export async function getTenantBySlug(slug: string) {
  const db = createAdminClient();
  const { data, error } = await db.from("tenants").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Tenant | null;
}

export async function getTenantByDomain(domain: string) {
  const db = createAdminClient();
  const { data, error } = await db.from("tenants").select("*").eq("domain", domain).maybeSingle();
  if (error) throw error;
  return data as Tenant | null;
}

export async function createTenant(tenant: Partial<Tenant> & { name: string; slug: string }) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("tenants")
    .insert({
      name: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain ?? null,
      logo_url: tenant.logo_url ?? null,
      primary_color: tenant.primary_color ?? "#f59e0b",
      secondary_color: tenant.secondary_color ?? "#1e293b",
      theme_config: tenant.theme_config ?? {},
      owner_id: tenant.owner_id ?? null,
      subscription_plan: tenant.subscription_plan ?? "free",
      monthly_price: tenant.monthly_price ?? 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Tenant;
}

export async function updateTenant(tenantId: string, patch: Partial<Tenant>) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("tenants")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", tenantId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as Tenant | null;
}

export async function suspendTenant(tenantId: string, suspend: boolean) {
  return updateTenant(tenantId, { is_suspended: suspend });
}

export async function getTenantStats(tenantId: string) {
  return {
    total_users: 0,
    pending_transactions: 0,
    total_revenue: 0,
  };
}

export async function addPlatformRevenue(_revenue: Partial<PlatformRevenue> & { tenant_id: string; type: PlatformRevenue["type"]; amount: number }) {
  throw new Error("Platform revenue requires database migration");
}

const defaultSettings: Omit<SiteSetting, "tenant_id">[] = [
  {
    key: "site_name",
    value: "JMD Online Book",
    type: "string",
    description: "Platform name",
    updated_at: new Date().toISOString(),
  },
  {
    key: "min_deposit",
    value: "100",
    type: "number",
    description: "Minimum deposit",
    updated_at: new Date().toISOString(),
  },
  {
    key: "min_withdraw",
    value: "200",
    type: "number",
    description: "Minimum withdraw",
    updated_at: new Date().toISOString(),
  },
  {
    key: "max_withdraw_daily",
    value: "50000",
    type: "number",
    description: "Daily withdraw cap",
    updated_at: new Date().toISOString(),
  },
  {
    key: "referral_commission_rate",
    value: "0.05",
    type: "number",
    description: "Direct referral commission",
    updated_at: new Date().toISOString(),
  },
  {
    key: "second_level_commission_rate",
    value: "0.02",
    type: "number",
    description: "Second level commission",
    updated_at: new Date().toISOString(),
  },
  {
    key: "maintenance_mode",
    value: "false",
    type: "boolean",
    description: "Maintenance flag",
    updated_at: new Date().toISOString(),
  },
  {
    key: "announcement",
    value: "Fast deposits. Manual approvals. Live balance updates.",
    type: "string",
    description: "Ticker",
    updated_at: new Date().toISOString(),
  },
];

const defaultPaymentMethods: Omit<PaymentMethod, "tenant_id">[] = [
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54601",
    name: "UPI",
    type: "upi",
    details: { upi_id: "jmdonlinebook@upi", display: "Scan and Pay" },
    is_active: true,
    for_deposit: true,
    for_withdraw: false,
    sort_order: 1,
    min_amount: 100,
    max_amount: 100000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54602",
    name: "PhonePe",
    type: "upi",
    details: { upi_id: "jmdonlinebook@ybl", display: "PhonePe UPI" },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 2,
    min_amount: 100,
    max_amount: 50000,
    created_at: new Date().toISOString(),
  },
  {
    id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54603",
    name: "Bank Transfer",
    type: "bank",
    details: {
      bank_name: "HDFC Bank",
      account: "1234567890",
      ifsc: "HDFC0001234",
      holder: "JMD Online Services",
    },
    is_active: true,
    for_deposit: true,
    for_withdraw: true,
    sort_order: 3,
    min_amount: 500,
    max_amount: 100000,
    created_at: new Date().toISOString(),
  },
];

const defaultGames: Omit<Game, "tenant_id">[] = [
  {
    id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a01",
    name: "IPL Cricket Bet",
    provider: "JMD Sports",
    category: "sports",
    thumbnail_url: null,
    launch_url: null,
    description: "Live book with session odds and quick settlement.",
    is_active: true,
    is_featured: true,
    is_hot: true,
    is_new: false,
    sort_order: 1,
    min_bet: 10,
    max_bet: 100000,
    tags: ["cricket", "live", "popular"],
    play_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a02",
    name: "Teen Patti Gold",
    provider: "JMD Casino",
    category: "cards",
    thumbnail_url: null,
    launch_url: null,
    description: "Fast-round mobile card room.",
    is_active: true,
    is_featured: true,
    is_hot: true,
    is_new: false,
    sort_order: 2,
    min_bet: 10,
    max_bet: 50000,
    tags: ["cards", "casino", "popular"],
    play_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a03",
    name: "Aviator",
    provider: "JMD Games",
    category: "casino",
    thumbnail_url: null,
    launch_url: null,
    description: "High-velocity crash style round.",
    is_active: true,
    is_featured: true,
    is_hot: false,
    is_new: true,
    sort_order: 3,
    min_bet: 10,
    max_bet: 25000,
    tags: ["aviator", "trending"],
    play_count: 0,
    created_at: new Date().toISOString(),
  },
];

let bootstrapPromise: Promise<void> | null = null;

function getDb() {
  return createAdminClient();
}

async function readLegacyJson<T>(path: string): Promise<T[] | null> {
  const db = getDb();
  const { data, error } = await db.storage.from(LEGACY_BUCKET).createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  const response = await fetch(data.signedUrl, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  return ((await response.json()) as T[]) ?? null;
}

async function seedStaticTable<T extends { id: string }>(
  table: "payment_methods" | "games",
  defaults: T[],
  legacyPath: string,
  tenantId?: string,
) {
  const db = getDb();
  const { count, error: countError } = await db
    .from(table)
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const rows = (await readLegacyJson<T>(legacyPath)) ?? defaults;
  if (!rows.length) {
    return;
  }

  const { error } = await db.from(table).upsert(rows, {
    onConflict: "id",
    ignoreDuplicates: true,
  });

  if (error) {
    throw error;
  }
}

async function seedSettings(tenantId?: string) {
  const db = getDb();
  
  const settingsWithTenant = defaultSettings.map((s) => {
    const base = { ...s };
    delete (base as Record<string, unknown>).tenant_id;
    return base;
  });
  
  const { error } = await db.from("site_settings").upsert(settingsWithTenant, {
    onConflict: "key",
    ignoreDuplicates: true,
  });

  if (error) {
    throw error;
  }
}

async function getMigrationFlag() {
  const db = getDb();
  const { data, error } = await db
    .from("site_settings")
    .select("*")
    .eq("key", MIGRATION_FLAG_KEY)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function setMigrationFlag() {
  const db = getDb();
  const { error } = await db.from("site_settings").upsert(
    {
      key: MIGRATION_FLAG_KEY,
      value: new Date().toISOString(),
      type: "string",
      description: "Legacy storage migration completed",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    throw error;
  }
}

async function migrateLegacyData() {
  const db = getDb();
  const [
    legacyProfiles,
    legacyTransactions,
    legacyNotifications,
    legacyCommissions,
  ] = await Promise.all([
    readLegacyJson<Profile>("profiles.json"),
    readLegacyJson<Transaction>("transactions.json"),
    readLegacyJson<Notification>("notifications.json"),
    readLegacyJson<Commission>("commissions.json"),
  ]);

  const { data: existingProfiles, error: existingProfilesError } = await db
    .from("profiles")
    .select("*");
  if (existingProfilesError) {
    throw existingProfilesError;
  }

  const phoneOwners = new Map(
    (existingProfiles ?? [])
      .filter((profile) => profile.phone)
      .map((profile) => [profile.phone, profile.id]),
  );

  const sanitizedLegacyProfiles = (legacyProfiles ?? []).map((profile) => {
    const nextProfile = { ...profile };
    const phone = nextProfile.phone?.trim() || null;

    if (!phone) {
      nextProfile.phone = null;
      return nextProfile;
    }

    const owner = phoneOwners.get(phone);
    if (owner && owner !== nextProfile.id) {
      nextProfile.phone = null;
      return nextProfile;
    }

    phoneOwners.set(phone, nextProfile.id);
    nextProfile.phone = phone;
    return nextProfile;
  });

  if (sanitizedLegacyProfiles.length) {
    const { error } = await db.from("profiles").upsert(sanitizedLegacyProfiles, {
      onConflict: "id",
    });
    if (error) throw error;
  }

  if (legacyTransactions?.length) {
    const { error } = await db.from("transactions").upsert(legacyTransactions, {
      onConflict: "id",
    });
    if (error) throw error;
  }

  if (legacyNotifications?.length) {
    const { error } = await db.from("notifications").upsert(legacyNotifications, {
      onConflict: "id",
    });
    if (error) throw error;
  }

  if (legacyCommissions?.length) {
    const { error } = await db.from("commissions").upsert(legacyCommissions, {
      onConflict: "id",
    });
    if (error) throw error;
  }
}

async function bootstrapRepo() {
  await seedSettings();
  await seedStaticTable("payment_methods", defaultPaymentMethods, "payment-methods.json");
  await seedStaticTable("games", defaultGames, "games.json");

  const migrationFlag = await getMigrationFlag();
  if (!migrationFlag) {
    await migrateLegacyData();
    await setMigrationFlag();
  }
}

export async function ensureRepoBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapRepo().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  await bootstrapPromise;
}

export async function getSettings() {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPaymentMethods() {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db
    .from("payment_methods")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getGames() {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db.from("games").select("*").order("sort_order", {
    ascending: true,
  });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getGameById(gameId: string) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db.from("games").select("*").eq("id", gameId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getProfiles(limit = 10, offset = 0) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db.from("profiles").select("*").order("created_at", {
    ascending: false,
  }).range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getProfile(userId: string) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  await ensureRepoBootstrap();
  const existing = await getProfile(profile.id);
  const nextProfile = {
    phone: null,
    email: null,
    full_name: "User",
    role: "user",
    balance: 0,
    bonus_balance: 0,
    total_deposited: 0,
    total_withdrawn: 0,
    total_won: 0,
    total_lost: 0,
    referral_code: crypto.randomUUID().slice(0, 8).toUpperCase(),
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
    created_at: existing?.created_at ?? new Date().toISOString(),
    ...existing,
    ...profile,
    updated_at: new Date().toISOString(),
  } as Profile;

  const db = getDb();
  const { data, error } = await db
    .from("profiles")
    .upsert(nextProfile, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function findProfileByReferralCode(code: string) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("referral_code", code)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function findProfileByPhone(phone: string) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTransactions(userId?: string, limit = 20, offset = 0) {
  await ensureRepoBootstrap();
  const db = getDb();
  let query = db.from("transactions").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getTransactionsCount(userId?: string) {
  await ensureRepoBootstrap();
  const db = getDb();
  let query = db.from("transactions").select("*", { count: "exact", head: true });
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function countRecentTransactionsByType(
  userId: string,
  type: string,
  cutoffIso: string,
) {
  const db = getDb();
  const { count, error } = await db
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", type)
    .gte("created_at", cutoffIso);
  if (error) throw error;
  return count ?? 0;
}

export async function addTransaction(
  transaction: Partial<Transaction> & { user_id: string; type: Transaction["type"]; amount: number },
) {
  await ensureRepoBootstrap();
  const payload: Database["public"]["Tables"]["transactions"]["Insert"] = {
    id: transaction.id ?? crypto.randomUUID(),
    user_id: transaction.user_id,
    type: transaction.type,
    amount: transaction.amount,
    balance_before: transaction.balance_before ?? null,
    balance_after: transaction.balance_after ?? null,
    status: transaction.status ?? "pending",
    payment_method: transaction.payment_method ?? null,
    payment_reference: transaction.payment_reference ?? null,
    screenshot_url: transaction.screenshot_url ?? null,
    upi_id: transaction.upi_id ?? null,
    bank_account: transaction.bank_account ?? null,
    ifsc_code: transaction.ifsc_code ?? null,
    account_holder: transaction.account_holder ?? null,
    admin_note: transaction.admin_note ?? null,
    approved_by: transaction.approved_by ?? null,
    approved_at: transaction.approved_at ?? null,
    created_at: transaction.created_at ?? new Date().toISOString(),
    updated_at: transaction.updated_at ?? new Date().toISOString(),
  };

  const db = getDb();
  const { data, error } = await db.from("transactions").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTransaction(transactionId: string, patch: Partial<Transaction>) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db
    .from("transactions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", transactionId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTransactionById(transactionId: string) {
  await ensureRepoBootstrap();
  const db = getDb();
  const { data, error } = await db
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getNotifications(userId?: string, limit = 20, offset = 0) {
  await ensureRepoBootstrap();
  const db = getDb();
  let query = db.from("notifications").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addNotification(
  notification: Partial<Notification> & { user_id: string; title: string; body: string },
) {
  await ensureRepoBootstrap();
  const db = getDb();
  const payload: Database["public"]["Tables"]["notifications"]["Insert"] = {
    id: notification.id ?? crypto.randomUUID(),
    user_id: notification.user_id,
    title: notification.title,
    body: notification.body,
    type: notification.type ?? "info",
    is_read: notification.is_read ?? false,
    action_url: notification.action_url ?? null,
    metadata: notification.metadata ?? {},
    created_at: notification.created_at ?? new Date().toISOString(),
  };
  const { data, error } = await db.from("notifications").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addAdminAuditLog(params: {
  adminId: string;
  title: string;
  body: string;
  metadata?: Notification["metadata"];
}) {
  return addNotification({
    user_id: params.adminId,
    title: params.title,
    body: params.body,
    type: "system",
    metadata: {
      scope: "admin_audit",
      ...(typeof params.metadata === "object" && params.metadata && !Array.isArray(params.metadata)
        ? params.metadata
        : {}),
    },
  });
}

export async function getCommissions(agentId?: string, limit = 20, offset = 0) {
  await ensureRepoBootstrap();
  const db = getDb();
  let query = db.from("commissions").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (agentId) {
    query = query.eq("agent_id", agentId);
  }
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addCommission(
  commission: Partial<Commission> & { agent_id: string; player_id: string; amount: number },
) {
  await ensureRepoBootstrap();
  const db = getDb();
  const payload: Database["public"]["Tables"]["commissions"]["Insert"] = {
    id: commission.id ?? crypto.randomUUID(),
    agent_id: commission.agent_id,
    player_id: commission.player_id,
    transaction_id: commission.transaction_id ?? null,
    amount: commission.amount,
    rate: commission.rate ?? 0.05,
    type: commission.type ?? "deposit",
    is_paid: commission.is_paid ?? false,
    created_at: commission.created_at ?? new Date().toISOString(),
  };
  const { data, error } = await db.from("commissions").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addBet(
  bet: Partial<Bet> & { user_id: string; game_id: string; amount: number },
) {
  await ensureRepoBootstrap();
  const db = getDb();
  const payload: Database["public"]["Tables"]["bets"]["Insert"] = {
    id: bet.id ?? crypto.randomUUID(),
    tenant_id: bet.tenant_id ?? null,
    user_id: bet.user_id,
    game_id: bet.game_id,
    amount: bet.amount,
    odds: bet.odds ?? null,
    potential_win: bet.potential_win ?? null,
    result: bet.result ?? null,
    payout: bet.payout ?? null,
    settled_at: bet.settled_at ?? null,
    metadata: bet.metadata ?? null,
    created_at: bet.created_at ?? new Date().toISOString(),
  };
  const { data, error } = await db.from("bets").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBalance(userId: string, amount: number, type: string) {
  const db = getDb();
  const { data, error } = await db.rpc("update_balance", {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
  });

  if (error) {
    throw error;
  }

  return data;
}
