import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "../"
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  async rewrites () {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`
      }
    ]
  }
};

export default nextConfig;
