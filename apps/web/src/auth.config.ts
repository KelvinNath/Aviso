import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth configuration.
 *
 * Kept separate from auth.ts so middleware can run on the Edge runtime
 * without importing Node-only modules (e.g. future Prisma adapter).
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
