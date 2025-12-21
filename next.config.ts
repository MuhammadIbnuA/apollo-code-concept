import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to bundle 'pg', which causes crashes
  serverExternalPackages: ["pg"],
};

export default nextConfig;
