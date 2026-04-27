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

  // 2. Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // 3. Redirect if there is no locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico).*)",
  ],
};
