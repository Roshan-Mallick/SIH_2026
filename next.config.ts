import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/about", destination: "/about.html" },
      { source: "/pricing", destination: "/pricing.html" },
      { source: "/downloads", destination: "/downloads.html" },
    ];
  },
};

export default nextConfig;
