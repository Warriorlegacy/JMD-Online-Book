import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from "jose";

const intlMiddleware = createMiddleware(routing);
const secretStr = process.env.JWT_SECRET;
const JWT_SECRET = secretStr ? new TextEncoder().encode(secretStr) : null;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /dashboard to default locale dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return NextResponse.redirect(new URL(`/${routing.defaultLocale}/dashboard`, request.url), 301);
  }

  // 1. Handle i18n first
  const response = intlMiddleware(request);

  // If intlMiddleware redirected or responded with an error, return that immediately.
  // Codes 300-399 are redirects, >= 400 are errors.
  if (response && (response.status >= 300 || response.status === 200)) {
     // If it's a 200, we check if we need to do Auth. 
     // If it's a redirect (307/308), we return it now to avoid redundant logic.
     if (response.status >= 300) return response;
  }

  // 2. Authentication/Authorization Logic
  const token = request.cookies.get("sbe_token")?.value;
  
  // Extract locale from path (e.g., /en/wallet -> en)
  const segments = pathname.split('/');
  const locale = routing.locales.find(l => l === segments[1]) || routing.defaultLocale;
  const localePrefix = `/${locale}`;

  // Adjusted paths for [locale] structure
  const isAuthRoute = pathname.startsWith(`${localePrefix}/login`) || pathname.startsWith(`${localePrefix}/register`);
  const isCasinoGameRoute = pathname.startsWith(`${localePrefix}/casino/`) && pathname.split('/').length > 3;
  const isProtectedRoute = pathname.startsWith(`${localePrefix}/wallet`) || pathname.startsWith(`${localePrefix}/admin`) || pathname.startsWith(`${localePrefix}/dashboard`) || isCasinoGameRoute;
  const isAdminRoute = pathname.startsWith(`${localePrefix}/admin`);

  if (!token) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
    }
    return response;
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET not set");
    return response;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(`${localePrefix}`, request.url));
    }

    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL(`${localePrefix}`, request.url));
    }

    return response;
  } catch {
    if (isProtectedRoute) {
      const responseRedirect = NextResponse.redirect(new URL(`${localePrefix}/login`, request.url));
      responseRedirect.cookies.delete("sbe_token");
      return responseRedirect;
    }
    return response;
  }
}

export const config = {
  // Match all paths except for static files and api
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};