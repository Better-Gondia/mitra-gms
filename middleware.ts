import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to sign-in page
        if (req.nextUrl.pathname.startsWith("/auth/signin")) {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/api/complaints/:path*",
    "/api/analytics/:path*",
    "/api/ai/:path*",
    "/auth/signin",
  ],
};
