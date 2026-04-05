import { decodeJwt } from "jose";

import type { AppRole, AppSession } from "@/types/database";

export const SESSION_COOKIE = "jmd_session";

export async function verifySessionToken(token: string): Promise<AppSession | null> {
  try {
    const payload = decodeJwt(token);
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.sub!,
      email: String(payload.email ?? ""),
      role: payload.role as AppRole,
      fullName: String(payload.fullName ?? "User"),
      tenantId: payload.tenantId as string | undefined,
      accessToken: token,
    };
  } catch {
    return null;
  }
}
