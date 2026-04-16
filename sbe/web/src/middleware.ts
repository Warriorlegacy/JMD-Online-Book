import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev_sbe_secret_key_123"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  const { pathname } = request.nextUrl;

   // Define protected routes
   const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
   const isCasinoGameRoute = pathname.startsWith("/casino/") && pathname.split('/').length > 2;
   const isProtectedRoute = pathname.startsWith("/wallet") || pathname.startsWith("/admin") || isCasinoGameRoute;
   const isAdminRoute = pathname.startsWith("/admin");

  if (!token) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // If authenticated and trying to access login/register, redirect home
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role-based protection for /admin
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Token invalid
    if (isProtectedRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sbe_token");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/wallet/:path*", "/admin/:path*", "/casino/:path*", "/login", "/register"],
};
