import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to all auth pages
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/auth/:path*"],
};
