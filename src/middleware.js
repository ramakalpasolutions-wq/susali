// src/middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret:
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "susali-healthcare-secret-2026",
  });

  const { pathname } = req.nextUrl;

  // Public/Auth routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      if (token.role === "PATIENT") {
        return NextResponse.redirect(new URL("/patient/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Dashboard protection (Staff only)
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role === "PATIENT") {
      return NextResponse.redirect(new URL("/patient/dashboard", req.url));
    }
  }

  // Patient App protection
  if (pathname.startsWith("/patient")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/patient/:path*", "/login", "/register"],
};