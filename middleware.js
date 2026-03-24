import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
    const token = req.cookies.get("token")?.value;
    const pathname = req.nextUrl.pathname;

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
        if (!token) return NextResponse.redirect(new URL("/login", req.url));

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            // If user has no role, redirect to role selection
            if (!payload.role) {
                return NextResponse.redirect(new URL("/role", req.url));
            }

            // Role-based protection - Admin has full access
            if (payload.role !== "admin") {
                if (pathname.startsWith("/dashboard/recruiter") && payload.role !== "recruiter") {
                    return NextResponse.redirect(new URL("/dashboard/student", req.url));
                }
                if (pathname.startsWith("/dashboard/student") && payload.role !== "student") {
                    return NextResponse.redirect(new URL("/dashboard/recruiter", req.url));
                }
                if (pathname.startsWith("/dashboard/admin")) {
                    return NextResponse.redirect(new URL("/login", req.url));
                }
            }
        } catch {
            // Token invalid/expired — try refresh
            const refreshToken = req.cookies.get("refreshToken")?.value;
            if (!refreshToken) {
                return NextResponse.redirect(new URL("/login", req.url));
            }
            // Let the client-side handle refresh
            return NextResponse.next();
        }
    }

    // Protect interview attempt route — must be authenticated
    if (pathname.match(/^\/interview\/[^/]+\/attempt/)) {
        if (!token) {
            const slug = pathname.split("/")[2];
            return NextResponse.redirect(new URL(`/interview/${slug}`, req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/interview/:path*"],
};

