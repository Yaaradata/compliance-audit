import type { NextConfig } from "next";

const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").trim().replace(/\/+$/, "");
const apiBase = backendOrigin ? `${backendOrigin}/api/v1` : "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendOrigin) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL is required. Add it to frontend/.env (e.g. NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000)"
      );
    }
    // Proxy /api/v1/* to backend so backend receives path /api/v1/* (full path in destination)
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
