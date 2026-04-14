import pg from "pg";

async function applyRLS() {
  const connectionString = "postgres://postgres:GJH31Qc0uvlzbdpD@db.zkvrlwqcfeecsecrzlnu.supabase.co:5432/postgres";
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("[RLS] Applying security policies...");

    const rlsSql = `
      -- 1. Enable RLS on core tables
      ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      -- 2. Drop existing policies if any
      DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
      DROP POLICY IF EXISTS "Users can manage own orders" ON orders;
      DROP POLICY IF EXISTS "Users can view own profile" ON users;

      -- 3. Create fresh policies
      CREATE POLICY "Users can view own wallet" ON wallets FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can manage own orders" ON orders FOR ALL USING (auth.uid() = user_id);
      CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

      -- 4. Public access for markets (No RLS or Open RLS)
      ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public can view matches" ON matches;
      CREATE POLICY "Public can view matches" ON matches FOR SELECT USING (true);
    `;

    await client.query(rlsSql);
    console.log("[RLS] Security perimeter active!");
  } catch (err) {
    console.error("[RLS] Failed:", err.message);
  } finally {
    await client.end();
  }
}

applyRLS();
