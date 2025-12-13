import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
