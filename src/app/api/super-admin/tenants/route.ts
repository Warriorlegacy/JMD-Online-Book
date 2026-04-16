import { created, fail } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/auth";
import { createTenant, getTenantBySlug, getTenantByDomain } from "@/lib/repo";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { name, slug, domain, ownerEmail, ownerName, primaryColor, plan } = body;

    if (!name || !slug || !ownerEmail || !ownerName) {
      return fail("Missing required fields");
    }

    if (!SLUG_REGEX.test(slug)) {
      return fail("Slug must contain only lowercase letters, numbers, and hyphens");
    }

    const existingSlug = await getTenantBySlug(slug);
    if (existingSlug) {
      return fail("Slug already in use");
    }

    if (domain) {
      const existingDomain = await getTenantByDomain(domain);
      if (existingDomain) {
        return fail("Domain already in use");
      }
    }

    const validPlans = ["free", "pro", "enterprise"];
    const subscriptionPlan = validPlans.includes(plan) ? plan : "free";

    const tenant = await createTenant({
      name,
      slug,
      domain: domain || null,
      primary_color: primaryColor || "#f59e0b",
      subscription_plan: subscriptionPlan,
    });

    return created({ tenant, message: "Tenant created successfully" });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create tenant", 500);
  }
}
