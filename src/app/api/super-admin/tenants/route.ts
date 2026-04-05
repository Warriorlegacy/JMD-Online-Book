import { created, fail } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/auth";
import { createTenant } from "@/lib/repo";

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { name, slug, domain, ownerEmail, ownerName, primaryColor, plan } = body;

    if (!name || !slug || !ownerEmail || !ownerName) {
      return fail("Missing required fields");
    }

    const tenant = await createTenant({
      name,
      slug,
      domain: domain || null,
      primary_color: primaryColor || "#f59e0b",
      subscription_plan: plan || "free",
    });

    return created({ tenant, message: "Tenant created successfully" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create tenant", 500);
  }
}