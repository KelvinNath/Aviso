import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required in monorepos so Next.js traces dependencies outside apps/web
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
