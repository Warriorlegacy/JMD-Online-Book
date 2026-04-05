import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-edge";

const PUBLIC_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/admin"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|json|js|css|woff2?)$/.test(pathname)
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (!session && !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(
      new URL(session.role === "admin" ? "/admin/dashboard" : "/home", request.url),
    );
  }

  if (
    session &&
    ADMIN_ROUTES.some((route) => pathname.startsWith(route)) &&
    session.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};