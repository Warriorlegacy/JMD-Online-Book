import { getSession } from "@/lib/auth";
import { getTenantById } from "@/lib/repo";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.tenantId) {
      return Response.json({ tenant: null });
    }
    const tenant = await getTenantById(session.tenantId);
    return Response.json({ tenant });
  } catch {
    return Response.json({ tenant: null });
  }
}