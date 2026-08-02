import { auth } from "@/auth";

/**
 * Returns the current session, or null if the user is not signed in.
 * Use in Server Components and Route Handlers.
 */
export async function getSession() {
  return auth();
}

/**
 * Returns the current session or throws if unauthenticated.
 * Use when a route or component requires a signed-in user.
 */
export async function requireSession() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}
