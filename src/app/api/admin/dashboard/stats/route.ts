import { fail, ok } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { computeDashboardStats } from "@/lib/wallet";

export async function GET() {
  try {
    await requireAdminSession();
    return ok(await computeDashboardStats());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to fetch stats", 500);
  }
}
