import { createAdminClient } from "@/lib/supabase/admin";

const defaultSettings = [
  ["site_name", "JMD Online Book", "string", "Platform name"],
  ["min_deposit", "100", "number", "Minimum deposit amount in INR"],
  ["min_withdraw", "200", "number", "Minimum withdrawal amount"],
  ["max_withdraw_daily", "50000", "number", "Daily withdrawal limit"],
  ["referral_commission_rate", "0.05", "number", "Direct referral rate"],
  ["second_level_commission_rate", "0.02", "number", "Second level rate"],
  ["maintenance_mode", "false", "boolean", "Enable maintenance mode"],
  ["welcome_bonus", "50", "number", "Default welcome bonus"],
  ["upi_id", "jmdonlinebook@upi", "string", "Company UPI"],
  ["whatsapp_support", "+919999999999", "string", "WhatsApp support"],
  [
    "announcement",
    "Fast deposits. Manual approvals. Live balance updates for every wallet move.",
    "string",
    "Announcement ticker",
  ],
] as const;

const defaultPaymentMethods = [
  {
    name: "UPI",
    type: "upi",
    details: { upi_id: "jmdonlinebook@upi", display: "Scan and Pay" },
    sort_order: 1,
    min_amount: 100,
    max_amount: 100000,
    for_deposit: true,
    for_withdraw: false,
  },
  {
    name: "PhonePe",
    type: "upi",
    details: { upi_id: "jmdonlinebook@ybl", display: "PhonePe UPI" },
    sort_order: 2,
    min_amount: 100,
    max_amount: 50000,
    for_deposit: true,
    for_withdraw: true,
  },
  {
    name: "Bank Transfer",
    type: "bank",
    details: {
      bank_name: "HDFC Bank",
      account: "1234567890",
      ifsc: "HDFC0001234",
      holder: "JMD Online Services",
    },
    sort_order: 3,
    min_amount: 500,
    max_amount: 100000,
    for_deposit: true,
    for_withdraw: true,
  },
];

const defaultGames = [
  {
    name: "IPL Cricket Bet",
    provider: "JMD Sports",
    category: "sports",
    is_featured: true,
    is_hot: true,
    sort_order: 1,
    min_bet: 10,
    max_bet: 100000,
    tags: ["cricket", "live", "popular"],
    description: "Fast-moving cricket book with live session odds.",
  },
  {
    name: "Teen Patti Gold",
    provider: "JMD Casino",
    category: "cards",
    is_featured: true,
    is_hot: true,
    sort_order: 2,
    min_bet: 10,
    max_bet: 50000,
    tags: ["cards", "casino", "popular"],
    description: "Classic touch-first card room with high-volume play.",
  },
  {
    name: "Aviator",
    provider: "JMD Games",
    category: "casino",
    is_featured: true,
    is_new: true,
    sort_order: 3,
    min_bet: 10,
    max_bet: 25000,
    tags: ["aviator", "trending"],
    description: "High-velocity crash-style lobby for quick rounds.",
  },
  {
    name: "Football Bet",
    provider: "JMD Sports",
    category: "sports",
    sort_order: 4,
    min_bet: 10,
    max_bet: 100000,
    tags: ["football", "sports"],
    description: "Pre-match and live football lines.",
  },
];

export async function bootstrapRemoteData() {
  const supabase = createAdminClient();

  await supabase.from("site_settings").upsert(
    defaultSettings.map(([key, value, type, description]) => ({
      key,
      value,
      type,
      description,
    })),
    { onConflict: "key" },
  );

  const [{ data: existingMethods }, { data: existingGames }] = await Promise.all([
    supabase.from("payment_methods").select("id,name"),
    supabase.from("games").select("id,name"),
  ]);

  const existingMethodNames = new Set((existingMethods ?? []).map((item) => item.name));
  const existingGameNames = new Set((existingGames ?? []).map((item) => item.name));

  const methodsToInsert = defaultPaymentMethods.filter(
    (method) => !existingMethodNames.has(method.name),
  );
  const gamesToInsert = defaultGames.filter((game) => !existingGameNames.has(game.name));

  if (methodsToInsert.length) {
    await supabase.from("payment_methods").insert(methodsToInsert);
  }

  if (gamesToInsert.length) {
    await supabase.from("games").insert(gamesToInsert);
  }

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((bucket) => bucket.id === "screenshots")) {
    await supabase.storage.createBucket("screenshots", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
  }
}
