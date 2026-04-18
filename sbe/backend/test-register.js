import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;
const connectionString = "postgres://postgres:GJH31Qc0uvlzbdpD@db.zkvrlwqcfeecsecrzlnu.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const username = "johndoe_99";
  const email = "piyushrajsingh092@gmail.com";
  const password = "password123";

  console.log("Connecting to pool...");
  const client = await pool.connect();
  console.log("Connected!");
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("BEGIN");
    await client.query("BEGIN");
    
    // Check if user already exists
    console.log("Checking if user exists...");
    const existing = await client.query(
      "SELECT id FROM public.users WHERE lower(email) = $1 OR lower(username) = $2 LIMIT 1",
      [email.toLowerCase(), username.toLowerCase()]
    );
    if (existing.rows.length > 0) {
       console.log("User already exists!");
    } else {
       console.log("Inserting user...");
       const userResult = await client.query(
        `INSERT INTO public.users (username, email, password_hash, role)
         VALUES ($1, $2, $3, 'user')
         RETURNING id, username, email, role`,
        [username, email.toLowerCase(), passwordHash]
       );
       const newUser = userResult.rows[0];
       console.log("User inserted:", newUser.id);
       
       console.log("Inserting wallet...");
       await client.query(
        `INSERT INTO public.wallets (user_id, currency, balance, locked_balance)
         VALUES ($1, 'INR', 0, 0)`,
        [newUser.id]
       );
       console.log("Wallet inserted.");
    }
    
    await client.query("ROLLBACK");
    console.log("Successfully tested and rolled back!");
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Query Error Detail:", err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
