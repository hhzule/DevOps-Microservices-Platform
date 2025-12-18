import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  reactStrictMode: true,
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_RECOMMENDATION_URL: process.env.NEXT_PUBLIC_RECOMMENDATION_URL || 'http://localhost:5000',
  },

  // API rewrites for proxying backend services
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      {
        source: '/recommendations/:path*',
        destination: `${process.env.NEXT_PUBLIC_RECOMMENDATION_URL}/api/recommendations/:path*`,
      },
    ]
  },
}

export default nextConfig;
