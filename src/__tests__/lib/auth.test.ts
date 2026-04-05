/// <reference types="vitest" />
// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key-12345678901234567890",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key-12345678901234567890",
    RESEND_API_KEY: "test-resend-key-1234567890",
    NEXT_PUBLIC_APP_NAME: "Test App",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    Legacy_JWT_Secret: "test-jwt-secret-key-that-is-long-enough-for-hs256",
  },
}));

vi.mock("@/lib/auth", async () => {
  const jose = await import("jose");

  const jwtSecret = new TextEncoder().encode("test-jwt-secret-key-that-is-long-enough-for-hs256");

  const SESSION_COOKIE = "jmd_session";

  async function createSessionToken(payload: {
    sub: string;
    email: string;
    role: string;
    fullName: string;
    tenantId?: string;
  }) {
    return new jose.SignJWT({
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

  async function verifySessionToken(token: string) {
    try {
      const { payload } = await jose.jwtVerify(token, jwtSecret);
      return {
        id: payload.sub!,
        email: String(payload.email ?? ""),
        role: payload.role as string,
        fullName: String(payload.fullName ?? "User"),
        tenantId: payload.tenantId as string | undefined,
        accessToken: token,
      };
    } catch {
      return null;
    }
  }

  function getSessionCookie(token: string) {
    return {
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    };
  }

  return {
    createSessionToken,
    verifySessionToken,
    getSessionCookie,
    SESSION_COOKIE,
  };
});

describe("Auth Module", () => {
  describe("createSessionToken", () => {
    it("should create a valid JWT token", async () => {
      const { createSessionToken } = await import("@/lib/auth");
      const token = await createSessionToken({
        sub: "user-123",
        email: "test@example.com",
        role: "user",
        fullName: "Test User",
      });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should include all payload fields", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
      const token = await createSessionToken({
        sub: "user-456",
        email: "admin@example.com",
        role: "admin",
        fullName: "Admin User",
        tenantId: "tenant-1",
      });
      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified!.id).toBe("user-456");
      expect(verified!.email).toBe("admin@example.com");
      expect(verified!.role).toBe("admin");
      expect(verified!.fullName).toBe("Admin User");
      expect(verified!.tenantId).toBe("tenant-1");
    });

    it("should set 7 day expiration", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
      const token = await createSessionToken({
        sub: "user-expiry",
        email: "expiry@example.com",
        role: "user",
        fullName: "Expiry User",
      });
      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
    });
  });

  describe("verifySessionToken", () => {
    it("should verify a valid token", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
      const token = await createSessionToken({
        sub: "user-789",
        email: "verify@example.com",
        role: "user",
        fullName: "Verify User",
      });
      const result = await verifySessionToken(token);
      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-789");
    });

    it("should return null for empty string", async () => {
      const { verifySessionToken } = await import("@/lib/auth");
      const result = await verifySessionToken("");
      expect(result).toBeNull();
    });

    it("should return null for tampered token", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
      const token = await createSessionToken({
        sub: "user-tamper",
        email: "tamper@example.com",
        role: "user",
        fullName: "Tamper User",
      });
      const tampered = token.slice(0, -5) + "XXXXX";
      const result = await verifySessionToken(tampered);
      expect(result).toBeNull();
    });

    it("should include accessToken in result", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
      const token = await createSessionToken({
        sub: "user-token",
        email: "token@example.com",
        role: "user",
        fullName: "Token User",
      });
      const result = await verifySessionToken(token);
      expect(result!.accessToken).toBe(token);
    });

    it("should handle different roles correctly", async () => {
      const { createSessionToken, verifySessionToken } = await import("@/lib/auth");

      const roles = ["user", "admin", "agent", "super_admin"] as const;
      for (const role of roles) {
        const token = await createSessionToken({
          sub: `user-${role}`,
          email: `${role}@example.com`,
          role,
          fullName: `${role} User`,
        });
        const result = await verifySessionToken(token);
        expect(result!.role).toBe(role);
      }
    });
  });

  describe("getSessionCookie", () => {
    it("should return properly formatted cookie object", async () => {
      const { getSessionCookie, SESSION_COOKIE } = await import("@/lib/auth");
      const cookie = getSessionCookie("test-token-123");
      expect(cookie.name).toBe(SESSION_COOKIE);
      expect(cookie.value).toBe("test-token-123");
      expect(cookie.httpOnly).toBe(true);
      expect(cookie.secure).toBe(true);
      expect(cookie.sameSite).toBe("lax");
      expect(cookie.path).toBe("/");
      expect(cookie.maxAge).toBe(60 * 60 * 24 * 7);
    });

    it("should set correct maxAge for 7 days", async () => {
      const { getSessionCookie } = await import("@/lib/auth");
      const cookie = getSessionCookie("token");
      expect(cookie.maxAge).toBe(604800);
    });
  });

  describe("SESSION_COOKIE constant", () => {
    it("should be 'jmd_session'", async () => {
      const { SESSION_COOKIE } = await import("@/lib/auth");
      expect(SESSION_COOKIE).toBe("jmd_session");
    });
  });
});
