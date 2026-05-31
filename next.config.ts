import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Required for multi-stage Docker builds — creates self-contained server.js
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
