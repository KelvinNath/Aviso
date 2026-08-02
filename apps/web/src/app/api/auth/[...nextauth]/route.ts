import { handlers } from "@/auth";

/**
 * Auth.js catch-all route handler.
 *
 * Handles OAuth callbacks, sign-in, sign-out, and session endpoints under
 * /api/auth/* (e.g. /api/auth/callback/google).
 */
export const { GET, POST } = handlers;
