import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        if (path.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        if (path.startsWith("/dashboard") && token?.role !== "SCHOOL_ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };