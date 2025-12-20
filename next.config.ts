import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js/Turbopack from trying to bundle 'pg', which causes panics/crashes
  serverExternalPackages: ["pg"],
  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
