import { fail, ok } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import {
  addAdminAuditLog,
  addCommission,
  addNotification,
  addTransaction,
  getProfile,
  getSettings,
  getTransactionById,
  updateTransaction,
} from "@/lib/repo";
import { approveTransactionSchema } from "@/lib/validators";
import { applyBalanceDelta } from "@/lib/wallet";

async function awardCommissions(userId: string, transactionId: string, amount: number) {
  const typedUser = await getProfile(userId);

  if (!typedUser?.referred_by) return;

  const typedSettings = await getSettings();

  const directRate = Number(
    typedSettings.find((setting) => setting.key === "referral_commission_rate")?.value ?? 0.05,
  );
  const secondLevelRate = Number(
    typedSettings.find((setting) => setting.key === "second_level_commission_rate")?.value ?? 0.02,
  );

  const directAmount = Math.round(amount * directRate * 100) / 100;
  await applyBalanceDelta({
    userId: typedUser.referred_by,
    amount: directAmount,
    type: "commission",
  });
  await addCommission({
    agent_id: typedUser.referred_by,
    player_id: userId,
    transaction_id: transactionId,
    amount: directAmount,
    rate: directRate,
    type: "deposit",
  });
  await addTransaction({
    user_id: typedUser.referred_by,
    type: "commission",
    amount: directAmount,
    status: "approved",
    payment_reference: transactionId,
  });

  const typedSecondLevel = await getProfile(typedUser.referred_by);

  if (typedSecondLevel?.referred_by) {
    const secondLevelAmount = Math.round(amount * secondLevelRate * 100) / 100;
    await applyBalanceDelta({
      userId: typedSecondLevel.referred_by,
      amount: secondLevelAmount,
      type: "commission",
    });
    await addCommission({
      agent_id: typedSecondLevel.referred_by,
      player_id: userId,
      transaction_id: transactionId,
      amount: secondLevelAmount,
      rate: secondLevelRate,
      type: "second_level",
    });
    await addTransaction({
      user_id: typedSecondLevel.referred_by,
      type: "commission",
      amount: secondLevelAmount,
      status: "approved",
      payment_reference: transactionId,
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const parsed = approveTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid admin action");
    }

    const transaction = await getTransactionById(parsed.data.transactionId);

    if (!transaction) {
      return fail("Transaction not found", 404);
    }

    if (parsed.data.action === "approve") {
      const direction = transaction.type === "withdraw" ? -1 : 1;
      const balanceResult = await applyBalanceDelta({
        userId: transaction.user_id,
        amount: direction * Number(transaction.amount),
        type: transaction.type,
      });

      const maybeError =
        typeof balanceResult === "object" &&
        balanceResult &&
        "success" in balanceResult &&
        balanceResult.success === false
          ? String(balanceResult.error)
          : null;

      if (maybeError) {
        return fail(maybeError, 409);
      }

      await updateTransaction(transaction.id, {
        status: "approved",
        approved_by: session.id,
        approved_at: new Date().toISOString(),
        admin_note: parsed.data.note || null,
        balance_before: "previous" in balanceResult ? Number(balanceResult.previous) : null,
        balance_after: "balance" in balanceResult ? Number(balanceResult.balance) : null,
      });

      await addNotification({
        user_id: transaction.user_id,
        title: `${transaction.type} approved`,
        body: `Your ${transaction.type} request has been approved.`,
        type: transaction.type === "deposit" ? "deposit" : "withdraw",
      });

      await addAdminAuditLog({
        adminId: session.id,
        title: "Transaction approved",
        body: `${transaction.type} of ${transaction.amount} approved for user ${transaction.user_id}.`,
        metadata: {
          event: "transaction_approved",
          transaction_id: transaction.id,
          target_user_id: transaction.user_id,
          transaction_type: transaction.type,
          amount: transaction.amount,
        },
      });

      if (transaction.type === "deposit") {
        await awardCommissions(transaction.user_id, transaction.id, Number(transaction.amount));
      }
    } else {
      await updateTransaction(transaction.id, {
        status: "rejected",
        approved_by: session.id,
        approved_at: new Date().toISOString(),
        admin_note: parsed.data.note || null,
      });

      await addNotification({
        user_id: transaction.user_id,
        title: `${transaction.type} rejected`,
        body: `Your ${transaction.type} request was rejected.`,
        type: "warning",
      });

      await addAdminAuditLog({
        adminId: session.id,
        title: "Transaction rejected",
        body: `${transaction.type} of ${transaction.amount} rejected for user ${transaction.user_id}.`,
        metadata: {
          event: "transaction_rejected",
          transaction_id: transaction.id,
          target_user_id: transaction.user_id,
          transaction_type: transaction.type,
          amount: transaction.amount,
        },
      });
    }

    return ok({ success: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to process transaction", 500);
  }
}
