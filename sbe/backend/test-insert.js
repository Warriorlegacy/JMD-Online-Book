import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ 
    connectionString: "postgres://postgres:GJH31Qc0uvlzbdpD@db.zkvrlwqcfeecsecrzlnu.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();
        
        console.log("Connected! Inserting test user...");
        await client.query("BEGIN");
        
        try {
            const userResult = await client.query(
                `INSERT INTO public.users (username, email, password_hash, role)
                 VALUES ($1, $2, $3, 'user')
                 RETURNING id`,
                ['testuser123', 'testuser123@example.com', 'dummyhash']
            );
            const newUser = userResult.rows[0];
            
            await client.query(
                `INSERT INTO public.wallets (user_id, currency, balance, locked_balance)
                 VALUES ($1, 'INR', 0, 0)`,
                [newUser.id]
            );
            
            await client.query("ROLLBACK"); // We don't want to actually commit the test user
            console.log("Test success! Rolled back.");
        } catch (err) {
            await client.query("ROLLBACK");
            console.error("Query Error:", err);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Connection Error:", err);
    } finally {
        await pool.end();
    }
}

main();
