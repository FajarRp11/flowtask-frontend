import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
      {
        source: "/sanctum/:path*",
        destination: `${process.env.BACKEND_URL}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
