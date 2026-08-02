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
 * Uses JWT sessions. On each session read, the user is synced to the database
 * via findOrCreateUser() and session.user.id is set to the database User.id.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
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
    async session({ session }) {
      if (!session.user?.email) {
        return session;
      }

      const dbUser = await findOrCreateUser({
        email: session.user.email,
        displayName: session.user.name ?? null,
        avatarUrl: session.user.image ?? null,
      });

      session.user.id = dbUser.id;

      return session;
    },
  },
});
