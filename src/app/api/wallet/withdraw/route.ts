import { created, fail } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { enforceTransactionRateLimit } from "@/lib/rate-limit";
import { addNotification, addTransaction, getProfile, getSettings } from "@/lib/repo";
import { withdrawSchema } from "@/lib/validators";
import { applyBalanceDelta } from "@/lib/wallet";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = withdrawSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid withdraw request");
    }

    await enforceTransactionRateLimit(session.id, "withdraw");
    const [profile, settings] = await Promise.all([
      getProfile(session.id),
      getSettings(),
    ]);

    const minWithdraw = Number(
      settings.find((setting) => setting.key === "min_withdraw")?.value ?? 200,
    );

    if (parsed.data.amount < minWithdraw) {
      return fail(`Minimum withdraw is ${minWithdraw}`);
    }

    if (Number(profile?.balance ?? 0) < parsed.data.amount) {
      return fail("Insufficient balance", 409);
    }

    const balanceResult = await applyBalanceDelta({
      userId: session.id,
      amount: -parsed.data.amount,
      type: "withdraw",
    });

    if (!balanceResult.success) {
      return fail(balanceResult.error ?? "Balance update failed");
    }

    const data = await addTransaction({
      user_id: session.id,
      type: "withdraw",
      amount: parsed.data.amount,
      status: "pending",
      payment_method: parsed.data.payment_method,
      upi_id: parsed.data.upi_id || null,
      bank_account: parsed.data.bank_account || null,
      ifsc_code: parsed.data.ifsc_code || null,
      account_holder: parsed.data.account_holder || null,
      balance_before: balanceResult.previous,
      balance_after: balanceResult.balance,
    });

    await addNotification({
      user_id: session.id,
      title: "Withdraw request submitted",
      body: "Your withdraw request is pending admin review.",
      type: "withdraw",
    });

    return created(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create withdrawal", 500);
  }
}
