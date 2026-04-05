import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const LEGACY_BUCKET = "appdata";
const MIGRATION_FLAG_KEY = "legacy_storage_migrated_at";
const reset = process.argv.includes("--reset");

const settings = [
  { key: "site_name", value: "JMD Online Book", type: "string", description: "Platform name", updated_at: new Date().toISOString() },
  { key: "min_deposit", value: "100", type: "number", description: "Minimum deposit", updated_at: new Date().toISOString() },
  { key: "min_withdraw", value: "200", type: "number", description: "Minimum withdraw", updated_at: new Date().toISOString() },
  { key: "max_withdraw_daily", value: "50000", type: "number", description: "Daily withdraw cap", updated_at: new Date().toISOString() },
  { key: "referral_commission_rate", value: "0.05", type: "number", description: "Direct referral rate", updated_at: new Date().toISOString() },
  { key: "second_level_commission_rate", value: "0.02", type: "number", description: "Second-level referral rate", updated_at: new Date().toISOString() },
  { key: "maintenance_mode", value: "false", type: "boolean", description: "Maintenance flag", updated_at: new Date().toISOString() },
  { key: "announcement", value: "Fast deposits. Manual approvals. Live balance updates.", type: "string", description: "Ticker", updated_at: new Date().toISOString() },
];

const paymentMethods = [
  { id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54601", name: "UPI", type: "upi", details: { upi_id: "jmdonlinebook@upi", display: "Scan and Pay" }, is_active: true, for_deposit: true, for_withdraw: false, sort_order: 1, min_amount: 100, max_amount: 100000, created_at: new Date().toISOString() },
  { id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54602", name: "PhonePe", type: "upi", details: { upi_id: "jmdonlinebook@ybl", display: "PhonePe UPI" }, is_active: true, for_deposit: true, for_withdraw: true, sort_order: 2, min_amount: 100, max_amount: 50000, created_at: new Date().toISOString() },
  { id: "31f5c7a3-2d49-45e3-8c0f-d697f6e54603", name: "Bank Transfer", type: "bank", details: { bank_name: "HDFC Bank", account: "1234567890", ifsc: "HDFC0001234", holder: "JMD Online Services" }, is_active: true, for_deposit: true, for_withdraw: true, sort_order: 3, min_amount: 500, max_amount: 100000, created_at: new Date().toISOString() },
];

const games = [
  { id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a01", name: "IPL Cricket Bet", provider: "JMD Sports", category: "sports", thumbnail_url: null, launch_url: null, description: "Live book with session odds and quick settlement.", is_active: true, is_featured: true, is_hot: true, is_new: false, sort_order: 1, min_bet: 10, max_bet: 100000, tags: ["cricket", "live", "popular"], play_count: 0, created_at: new Date().toISOString() },
  { id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a02", name: "Teen Patti Gold", provider: "JMD Casino", category: "cards", thumbnail_url: null, launch_url: null, description: "Fast-round mobile card room.", is_active: true, is_featured: true, is_hot: true, is_new: false, sort_order: 2, min_bet: 10, max_bet: 50000, tags: ["cards", "casino", "popular"], play_count: 0, created_at: new Date().toISOString() },
  { id: "5b611cb0-2cd9-4f6d-a848-f9fb58a53a03", name: "Aviator", provider: "JMD Games", category: "casino", thumbnail_url: null, launch_url: null, description: "High-velocity crash style round.", is_active: true, is_featured: true, is_hot: false, is_new: true, sort_order: 3, min_bet: 10, max_bet: 25000, tags: ["aviator", "trending"], play_count: 0, created_at: new Date().toISOString() },
];

const users = [
  { email: "admin@jmdonlinebook.com", password: "JmdAdmin@2026", full_name: "JMD Admin", role: "admin" },
  { email: "player@jmdonlinebook.com", password: "JmdPlayer@2026", full_name: "Demo Player", role: "user" },
];

async function ensureBucket(id, isPublic = false) {
  const { data } = await supabase.storage.listBuckets();
  if (!data?.find((bucket) => bucket.id === id)) {
    await supabase.storage.createBucket(id, { public: isPublic });
  }
}

async function readLegacyJson(path) {
  const { data, error } = await supabase.storage.from(LEGACY_BUCKET).createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    return null;
  }

  const response = await fetch(data.signedUrl, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  return (await response.json()) ?? null;
}

function sanitizeLegacyProfiles(legacyProfiles, existingProfiles) {
  const phoneOwners = new Map(
    (existingProfiles ?? [])
      .filter((profile) => profile.phone)
      .map((profile) => [profile.phone, profile.id]),
  );

  return (legacyProfiles ?? []).map((profile) => {
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
}

async function resetSqlData() {
  for (const table of ["transactions", "notifications", "commissions", "payment_methods", "games"]) {
    const result = await supabase.from(table).delete().not("id", "is", null);
    if (result.error) throw result.error;
  }
}

await ensureBucket("screenshots", true);

if (reset) {
  await resetSqlData();
}

const listed = await supabase.auth.admin.listUsers();
const { data: existingProfiles } = await supabase.from("profiles").select("*");
const profileMap = new Map((existingProfiles ?? []).map((profile) => [profile.id, profile]));

for (const candidate of users) {
  let user = listed.data.users.find((item) => item.email?.toLowerCase() === candidate.email.toLowerCase());
  if (!user) {
    const created = await supabase.auth.admin.createUser({
      email: candidate.email,
      password: candidate.password,
      email_confirm: true,
      user_metadata: { full_name: candidate.full_name },
    });
    if (created.error) throw created.error;
    user = created.data.user;
  }

  const existingProfile = profileMap.get(user.id);
  profileMap.set(user.id, {
    id: user.id,
    phone: existingProfile?.phone ?? null,
    email: candidate.email,
    full_name: candidate.full_name,
    role: candidate.role,
    balance: existingProfile?.balance ?? 0,
    bonus_balance: existingProfile?.bonus_balance ?? 0,
    total_deposited: existingProfile?.total_deposited ?? 0,
    total_withdrawn: existingProfile?.total_withdrawn ?? 0,
    total_won: existingProfile?.total_won ?? 0,
    total_lost: existingProfile?.total_lost ?? 0,
    referral_code: existingProfile?.referral_code ?? crypto.randomUUID().slice(0, 8).toUpperCase(),
    referred_by: existingProfile?.referred_by ?? null,
    agent_id: existingProfile?.agent_id ?? null,
    is_active: existingProfile?.is_active ?? true,
    is_verified: true,
    avatar_url: existingProfile?.avatar_url ?? null,
    bank_account: existingProfile?.bank_account ?? null,
    ifsc_code: existingProfile?.ifsc_code ?? null,
    account_holder: existingProfile?.account_holder ?? null,
    upi_id: existingProfile?.upi_id ?? null,
    last_login_at: existingProfile?.last_login_at ?? null,
    created_at: existingProfile?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

const settingsResult = await supabase.from("site_settings").upsert(settings, { onConflict: "key", ignoreDuplicates: true });
if (settingsResult.error) throw settingsResult.error;

const methodsResult = await supabase.from("payment_methods").upsert(paymentMethods, { onConflict: "id", ignoreDuplicates: true });
if (methodsResult.error) throw methodsResult.error;

const gamesResult = await supabase.from("games").upsert(games, { onConflict: "id", ignoreDuplicates: true });
if (gamesResult.error) throw gamesResult.error;

const profilesResult = await supabase.from("profiles").upsert(Array.from(profileMap.values()), { onConflict: "id" });
if (profilesResult.error) throw profilesResult.error;

const { data: migrationFlag } = await supabase
  .from("site_settings")
  .select("*")
  .eq("key", MIGRATION_FLAG_KEY)
  .maybeSingle();

if (!migrationFlag) {
  const [legacyProfiles, legacyTransactions, legacyNotifications, legacyCommissions] = await Promise.all([
    readLegacyJson("profiles.json"),
    readLegacyJson("transactions.json"),
    readLegacyJson("notifications.json"),
    readLegacyJson("commissions.json"),
  ]);

  const sanitizedProfiles = sanitizeLegacyProfiles(legacyProfiles, Array.from(profileMap.values()));

  if (sanitizedProfiles.length) {
    const result = await supabase.from("profiles").upsert(sanitizedProfiles, { onConflict: "id" });
    if (result.error) throw result.error;
  }

  if (legacyTransactions?.length) {
    const result = await supabase.from("transactions").upsert(legacyTransactions, { onConflict: "id" });
    if (result.error) throw result.error;
  }

  if (legacyNotifications?.length) {
    const result = await supabase.from("notifications").upsert(legacyNotifications, { onConflict: "id" });
    if (result.error) throw result.error;
  }

  if (legacyCommissions?.length) {
    const result = await supabase.from("commissions").upsert(legacyCommissions, { onConflict: "id" });
    if (result.error) throw result.error;
  }

  const migrationResult = await supabase.from("site_settings").upsert(
    {
      key: MIGRATION_FLAG_KEY,
      value: new Date().toISOString(),
      type: "string",
      description: "Legacy storage migration completed",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (migrationResult.error) throw migrationResult.error;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: reset ? "reset" : "safe-seed",
      backend: "sql",
      admin: users[0].email,
      adminPassword: users[0].password,
      testUser: users[1].email,
      testUserPassword: users[1].password,
    },
    null,
    2,
  ),
);
