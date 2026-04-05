import { NextResponse } from "next/server";

import { fail } from "@/lib/api";
import { createSessionToken, getSessionCookie } from "@/lib/auth";
import {
  findProfileByPhone,
  findProfileByReferralCode,
  upsertProfile,
} from "@/lib/repo";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerPayloadSchema } from "@/lib/validators";



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid registration payload");
    }

    const email = parsed.data.email.toLowerCase();

    const phone = parsed.data.phone?.trim() || null;
    if (phone) {
      const existingPhoneOwner = await findProfileByPhone(phone);
      if (existingPhoneOwner) {
        return fail("An account with this phone number already exists", 409);
      }
    }

    const referralCode = parsed.data.referralCode?.trim();
    const referrer = referralCode ? await findProfileByReferralCode(referralCode) : null;
    const supabase = createAdminClient();
    const createResult = await supabase.auth.admin.createUser({
      email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName,
      },
    });

    if (createResult.error || !createResult.data.user) {
      return fail(createResult.error?.message ?? "Unable to create account", 500);
    }

    try {
      const profile = await upsertProfile({
        id: createResult.data.user.id,
        email,
        full_name: parsed.data.fullName,
        phone,
        referred_by: referrer?.id ?? null,
        is_verified: true,
        role: "user",
      });

      const token = await createSessionToken({
        sub: createResult.data.user.id,
        email,
        role: "user",
        fullName: profile.full_name ?? parsed.data.fullName,
      });

      const response = NextResponse.json(
        {
          data: {
            success: true,
            role: "user",
          },
          error: null,
        },
        { status: 201 },
      );
      response.cookies.set(getSessionCookie(token));
      return response;
    } catch (profileError) {
      await supabase.auth.admin.deleteUser(createResult.data.user.id);
      throw profileError;
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to register", 500);
  }
}
