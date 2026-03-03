import type { NextConfig } from "next";
import { getBackendUrl } from "./lib/env";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = getBackendUrl();
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
