import { fail, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getReferralTree } from "@/lib/data";

export async function GET() {
  try {
    const session = await requireSession();
    const data = await getReferralTree(session);
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to load referral tree", 500);
  }
}
