import { fail, ok } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;
  const db = createAdminClient();

  const { data: user, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message, 500);
  if (!user) return fail("User not found", 404);

  const [{ data: transactions }, { data: bets }] = await Promise.all([
    db.from("transactions").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
    db.from("bets").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(50),
  ]);

  return ok({ user, transactions: transactions ?? [], bets: bets ?? [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    return fail("Unauthorized", 401);
  }

  const { id } = await params;
  let body: { is_active?: boolean };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON");
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .update({ is_active: body.is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, is_active")
    .maybeSingle();

  if (error) return fail(error.message, 500);
  if (!data) return fail("User not found", 404);

  return ok(data);
}
