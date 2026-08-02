import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Edge-safe middleware — uses authConfig only (no Prisma/session DB sync).
 * Unauthenticated users accessing /dashboard/* are redirected to sign-in.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*"],
};
