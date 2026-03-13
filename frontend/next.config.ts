import type { NextConfig } from "next";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ?? "";
const apiBase = backendOrigin ? `${backendOrigin}/api/v1` : "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiBase) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL is required. Add it to frontend/.env (e.g. NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000)"
      );
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
