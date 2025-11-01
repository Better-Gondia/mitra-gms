import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If accessing /access-not-granted
    if (pathname === "/access-not-granted") {
      // Allow access to /access-not-granted (the page will handle role-based logic)
      return NextResponse.next();
    }

    // Skip role-based redirects if no token
    if (!token) {
      return NextResponse.next();
    }

    const role = (token as any)?.role as Role | undefined;

    // If user has role USER or no role, redirect them to /access-not-granted
    if (!role || role === "USER") {
      return NextResponse.redirect(new URL("/access-not-granted", req.url));
    }

    // Allow access for all other roles
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to all auth pages
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true;
        }
        // Allow access to /access-not-granted for everyone
        if (req.nextUrl.pathname === "/access-not-granted") {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
