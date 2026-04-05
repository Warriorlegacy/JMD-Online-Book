import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";
import type { AppRole, AppSession } from "@/types/database";

const jwtSecret = Buffer.from(env.Legacy_JWT_Secret);

export const SESSION_COOKIE = "jmd_session";

interface SessionTokenPayload {
  sub: string;
  email: string;
  role: AppRole;
  fullName: string;
  tenantId?: string;
}

export async function createSessionToken(payload: SessionTokenPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName,
    tenantId: payload.tenantId,
    aud: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);
}

export async function verifySessionToken(token: string): Promise<AppSession | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
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

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  if (session.role !== "super_admin") {
    throw new Error("Forbidden: Super admin access required");
  }
  return session;
}

export function getSessionCookie(token: string): ResponseCookie {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
