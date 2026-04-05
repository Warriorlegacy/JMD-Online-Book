import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function createAdminUser() {
  const email = "admin@jmd.com";
  const password = "admin123";
  const fullName = "Admin User";

  console.log("Creating admin user...");

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  let user;
  if (existingUser) {
    console.log("User already exists, updating...");
    user = existingUser;
  } else {
    // Create the user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      throw error;
    }

    user = data.user;
    console.log("User created successfully");
  }

  // Upsert profile with admin role
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email,
      full_name: fullName,
      role: "admin",
      balance: 0,
      bonus_balance: 0,
      total_deposited: 0,
      total_withdrawn: 0,
      total_won: 0,
      total_lost: 0,
      referral_code: crypto.randomUUID().slice(0, 8).toUpperCase(),
      is_active: true,
      is_verified: true,
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  console.log("Admin user created/updated successfully!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: admin`);
}

createAdminUser().catch((error) => {
  console.error(error);
  process.exit(1);
});