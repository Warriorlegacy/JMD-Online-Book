import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get("host")?.split(":")?.[0] ?? "";
    const requestedSlug = host.includes(".") && !host.startsWith("localhost")
      ? host?.split(".")?.[0]
      : null;

    let tenant = null;
    const client = await pool.connect();

    try {
      if (requestedSlug) {
        const tenantResult = await client.query(
          `SELECT id, name, slug, primary_color as "primaryColor"
           FROM public.tenants
           WHERE slug = $1 AND is_active = true
           LIMIT 1`,
          [requestedSlug]
        );
        tenant = tenantResult.rows?.[0] || null;
      }

      if (!tenant) {
        const fallbackResult = await client.query(
          `SELECT id, name, slug, primary_color as "primaryColor"
           FROM public.tenants
           WHERE is_active = true
           ORDER BY created_at DESC
           LIMIT 1`
        );
        tenant = fallbackResult.rows?.[0] || null;
      }
    } finally {
      client.release();
    }

    if (!tenant) {
      return NextResponse.json(
        {
          id: "kinetic-ledger",
          name: "Kinetic Ledger",
          slug: "kinetic-ledger",
          theme: {
            primaryColor: "#0071e3",
            backgroundColor: "#000000",
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      theme: {
        primaryColor: tenant.primaryColor || "#0071e3",
        backgroundColor: "#000000",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
