import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = createAdminClient();

    console.log("Checking database connection...");

    // Test basic connection
    const { error: testError } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (testError) {
      console.log("Database tables not found, this is expected for first setup");
    } else {
      console.log("Database already has tables set up");
      return NextResponse.json({
        success: true,
        message: "Database appears to be already set up",
      });
    }

    // Try to create a simple test table to verify we can execute DDL
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: "CREATE TABLE IF NOT EXISTS migration_test (id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT NOW());"
    });

    if (createError) {
      console.error("Cannot execute DDL operations:", createError);
      return NextResponse.json({
        success: false,
        error: "Database setup requires manual intervention",
        message: "Please run the Supabase migrations manually in the Supabase dashboard or using Supabase CLI",
      });
    }

    console.log("Database setup capability confirmed");
    return NextResponse.json({
      success: true,
      message: "Database connection successful. Migrations need to be run manually.",
    });

  } catch (error) {
    console.error("Database setup check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}