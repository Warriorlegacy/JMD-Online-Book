import { fail, ok } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { addTransaction } from "@/lib/repo";

export async function POST(request: Request) {
  let session;
  try {
    session = await requireAdminSession();
  } catch {
    return fail("Unauthorized", 401);
  }

  let body: { user_id: string; delta: number; note?: string };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON");
  }

  const { user_id, delta, note } = body;
  if (!user_id || delta === undefined) return fail("user_id and delta are required");

  const db = createAdminClient();

  // Get current balance
  const { data: profile } = await db
    .from("profiles")
    .select("balance")
    .eq("id", user_id)
    .maybeSingle();

  if (!profile) return fail("User not found", 404);

  const currentBalance = Number(profile.balance ?? 0);
  const newBalance = currentBalance + delta;

  if (newBalance < 0) {
    return fail("negative_balance_result");
  }

  // Update balance via RPC
  const { error: rpcError } = await db.rpc("update_balance", {
    p_user_id: user_id,
    p_amount: delta,
    p_type: "adjustment",
  });

  if (rpcError) return fail(rpcError.message, 500);

  // Record transaction
  await addTransaction({
    user_id,
    type: "adjustment",
    amount: Math.abs(delta),
    status: "completed",
    balance_before: currentBalance,
    balance_after: newBalance,
    admin_note: note ?? `Admin adjustment by ${session.id}`,
    approved_by: session.id,
    approved_at: new Date().toISOString(),
  });

  return ok({ balance: newBalance });
}
