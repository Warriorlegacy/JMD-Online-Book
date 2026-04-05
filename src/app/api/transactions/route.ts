import { fail, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await requireSession();

    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

    if (isNaN(offset) || offset < 0) {
      return fail("Invalid offset parameter");
    }
    if (isNaN(limit) || limit < 1) {
      return fail("Invalid limit parameter");
    }

    const { getTransactions, getTransactionsCount } = await import("@/lib/repo");
    const [transactions, total] = await Promise.all([
      getTransactions(session.id, limit, offset),
      getTransactionsCount(session.id),
    ]);

    return ok({ transactions, total, hasMore: offset + limit < total });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return fail("Unauthorized", 401);
    }
    return fail("Failed to fetch transactions", 500);
  }
}