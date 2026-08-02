import { PrismaClient } from "@prisma/client";

/**
 * Singleton pattern for Prisma Client in Next.js.
 *
 * Why a singleton is needed:
 * Each PrismaClient opens a connection pool to PostgreSQL. Creating a new
 * instance on every import would spawn multiple pools and waste database
 * connections. The app should share exactly one client for its lifetime.
 *
 * Why hot reload creates multiple clients:
 * In development, Next.js re-executes modules on every file save without
 * restarting the Node process. Each reload runs `new PrismaClient()` again,
 * leaving orphaned pools from previous reloads attached to the same process.
 *
 * Why globalThis is used:
 * globalThis survives hot reloads because it belongs to the Node process, not
 * the module cache. Storing the client on globalThis lets the next reload
 * reuse the existing instance instead of creating another one.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
