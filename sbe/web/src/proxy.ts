import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "hi"];
const defaultLocale = "en";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip if it's an internal Next.js path or API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Check Authentication for Protected Routes
  const protectedPaths = ["/wallet", "/admin"];
  const isProtectedPath = protectedPaths.some((p) => pathname.includes(p));

  if (isProtectedPath) {
    const token = request.cookies.get("sbe_token")?.value;
    if (!token) {
      // Redirect to login if unauthenticated on a protected path
      const loginUrl = new URL(`/${defaultLocale}/`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // 4. Redirect if there is no locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico).*)",
  ],
};
