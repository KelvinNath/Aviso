export { auth as middleware } from "@/auth";

/**
 * Middleware matcher — only runs auth checks on protected route prefixes.
 * Unauthenticated users accessing /dashboard/* are redirected to sign-in.
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};
