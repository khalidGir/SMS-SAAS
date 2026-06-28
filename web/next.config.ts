import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

if (process.env.NODE_ENV === "development") {
  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${process.env.API_PROXY_URL || "http://localhost:4000"}/api/:path*`,
    },
  ];
}

export default nextConfig;
