import { created, fail } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { enforceTransactionRateLimit } from "@/lib/rate-limit";
import { addNotification, addTransaction, getSettings } from "@/lib/repo";
import { depositSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid deposit request");
    }

    await enforceTransactionRateLimit(session.id, "deposit");
    const settings = await getSettings();

    const minDeposit = Number(
      settings.find((setting) => setting.key === "min_deposit")?.value ?? 100,
    );

    if (parsed.data.amount < minDeposit) {
      return fail(`Minimum deposit is ${minDeposit}`);
    }

    const data = await addTransaction({
      user_id: session.id,
      type: "deposit",
      amount: parsed.data.amount,
      status: "pending",
      payment_method: parsed.data.payment_method,
      payment_reference: parsed.data.reference || null,
      screenshot_url: parsed.data.screenshot_url || null,
      upi_id: parsed.data.upi_id || null,
    });

    await addNotification({
      user_id: session.id,
      title: "Deposit request received",
      body: "Your deposit is pending admin approval.",
      type: "deposit",
    });

    return created(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create deposit", 500);
  }
}
