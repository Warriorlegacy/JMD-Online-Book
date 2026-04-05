import { fail, ok } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { getTransactions } from "@/lib/repo";

export async function GET() {
  try {
    await requireAdminSession();
    const transactions = await getTransactions();
    const sortedTransactions = transactions
      .slice()
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));

    return ok(sortedTransactions);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to fetch transactions", 500);
  }
}
