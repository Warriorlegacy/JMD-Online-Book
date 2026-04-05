import { NextResponse } from "next/server";

import { createSessionToken, getSessionCookie } from "@/lib/auth";
import { fail } from "@/lib/api";
import { addAdminAuditLog, getProfile, upsertProfile } from "@/lib/repo";
import { createPublicClient } from "@/lib/supabase/public";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid credentials");
    }

    const supabase = createPublicClient();
    const loginResult = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (loginResult.error) {
      return fail(loginResult.error.message ?? "Invalid email or password", 401);
    }

    if (!loginResult.data.user) {
      return fail("No user returned from Supabase", 401);
    }

    
    const profile =
      (await getProfile(loginResult.data.user.id)) ??
      (await upsertProfile({
        id: loginResult.data.user.id,
        email: parsed.data.email,
        full_name: loginResult.data.user.user_metadata?.full_name ?? "User",
        role: "user",
        is_verified: true,
      }));

    const token = await createSessionToken({
      sub: loginResult.data.user.id,
      email: parsed.data.email,
      role: (profile?.role ?? "user") as "user" | "agent" | "admin",
      fullName: profile?.full_name ?? loginResult.data.user.user_metadata?.full_name ?? "User",
    });

    await upsertProfile({
      id: loginResult.data.user.id,
      last_login_at: new Date().toISOString(),
    });

    if ((profile?.role ?? "user") === "admin") {
      await addAdminAuditLog({
        adminId: loginResult.data.user.id,
        title: "Admin login",
        body: `${parsed.data.email} signed in to the admin console.`,
        metadata: {
          event: "admin_login",
          actor_email: parsed.data.email,
        },
      });
    }

    const response = NextResponse.json({
      data: {
        success: true,
        role: profile?.role ?? "user",
      },
      error: null,
    });
    response.cookies.set(getSessionCookie(token));
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to login", 500);
  }
}
