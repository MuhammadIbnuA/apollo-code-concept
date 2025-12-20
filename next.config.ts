import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js/Turbopack from trying to bundle 'pg', which causes panics/crashes
  serverExternalPackages: ["pg"],
};

export default nextConfig;
