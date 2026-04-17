import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    console.log("=== DIAGNOSTIC CHECK START ===");

    // 1. Check Supabase connection
    results.connection = { status: "checking" };
    try {
      createAdminClient();
      results.connection = { status: "success", message: "Admin client created" };
    } catch (error) {
      results.connection = { status: "error", error: error instanceof Error ? error.message : "Unknown error" };
    }

    // 2. Check session
    results.session = { status: "checking" };
    try {
      const session = await getSession();
      results.session = {
        status: "success",
        hasSession: !!session,
        sessionData: session ? { id: session.id, role: session.role, email: session.email } : null
      };
    } catch (error) {
      results.session = { status: "error", error: error instanceof Error ? error.message : "Unknown error" };
    }

    // 3. Check database tables
    const tables = [
      'profiles',
      'transactions',
      'notifications',
      'commissions',
      'games',
      'payment_methods',
      'site_settings',
      'tenants',
      'bets',
      'platform_revenue',
      'otp_tokens'
    ];

    results.tables = {} as Record<string, unknown>;
    const supabase = createAdminClient();

    for (const table of tables) {
      try {
        // Try a simple count query
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          (results.tables as Record<string, unknown>)[table] = { status: "error", error: error.message };
        } else {
          (results.tables as Record<string, unknown>)[table] = { status: "success", count: count || 0 };
        }
      } catch (error) {
        (results.tables as Record<string, unknown>)[table] = {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }

    // 4. Check RLS policies
    results.rls = { status: "checking" };
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        results.rls = { status: "error", error: error.message };
      } else {
        results.rls = { status: "success", message: "RLS policies allow access" };
      }
    } catch (error) {
      results.rls = { status: "error", error: error instanceof Error ? error.message : "Unknown error" };
    }

    // 5. Check environment variables
    results.env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing",
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ? "set" : "missing",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "set" : "missing",
    };

    console.log("=== DIAGNOSTIC CHECK COMPLETE ===");

  } catch (error) {
    results.overall = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }

  return NextResponse.json(results);
}