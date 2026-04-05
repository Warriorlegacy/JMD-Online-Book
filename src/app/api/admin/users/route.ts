import { fail, ok } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { getProfiles } from "@/lib/repo";

export async function GET() {
  try {
    await requireAdminSession();
    const data = await getProfiles();
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to fetch users", 500);
  }
}
