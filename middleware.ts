import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";

const publicRoutes = [
  "/login",
  "/register",
  "/stream",
  "/_next",
  "/static",
  "/assets",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const parsedCookies = cookieHeader ? parse(cookieHeader) : {};
  const authToken = parsedCookies.token;
  const { pathname } = request.nextUrl;

  // Allow public routes without token check
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Redirect authenticated users from /login and /register to /dashboard
    if (authToken && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect non-public routes (e.g., /dashboard): redirect to /login if no token
  if (!authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};