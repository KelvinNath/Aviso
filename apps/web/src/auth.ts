import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { authConfig } from "@/auth.config";
import { findOrCreateUser } from "@/services/user.service";

/**
 * Auth.js entry point for the Aviso web app.
 *
 * Exports handlers (API routes), signIn/signOut helpers, and the auth()
 * function for reading the session in Server Components and Route Handlers.
 *
 * Uses JWT sessions. On sign-in, the user is synced to the database via
 * findOrCreateUser() in the jwt callback; session.user.id comes from the token.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await findOrCreateUser({
          email: user.email,
          displayName: user.name ?? null,
          avatarUrl: user.image ?? null,
        });
        token.sub = dbUser.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
