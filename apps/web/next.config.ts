import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Load env from monorepo root so apps/web shares the same .env as Prisma/bot
loadEnvConfig(path.join(__dirname, "../.."));

const nextConfig: NextConfig = {
  // Required in monorepos so Next.js traces dependencies outside apps/web
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
