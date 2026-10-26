import type { NextConfig } from "next";

const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").trim().replace(/\/+$/, "");
const apiBase = backendOrigin ? `${backendOrigin}/api/v1` : "";

const nextConfig: NextConfig = {
  async redirects() {
    const base = "/IndianBankingAudit/v2";
    const v1Base = "/IndianBankingAudit/v1";
    const legacyBase = "/IndianBankingAudit";
    return [
      { source: "/regulatory-intelligence", destination: `${base}/regulatory-intelligence`, permanent: false },
      { source: "/obligation-coverage", destination: `${base}/obligation-coverage`, permanent: false },
      { source: "/control-testing", destination: `${base}/control-testing`, permanent: false },
      { source: "/issues-board", destination: `${base}/issues-board`, permanent: false },
      { source: "/rcsa-workspace", destination: `${base}/rcsa-workspace`, permanent: false },
      { source: "/evidence-workbench", destination: `${base}/evidence-workbench`, permanent: false },
      { source: "/inspection-readiness", destination: `${base}/inspection-readiness`, permanent: false },
      {
        source: `${legacyBase}/regulatory-intelligence`,
        destination: `${base}/regulatory-intelligence`,
        permanent: false,
      },
      {
        source: `${legacyBase}/obligation-coverage`,
        destination: `${base}/obligation-coverage`,
        permanent: false,
      },
      { source: `${legacyBase}/control-testing`, destination: `${base}/control-testing`, permanent: false },
      { source: `${legacyBase}/issues-board`, destination: `${base}/issues-board`, permanent: false },
      { source: `${legacyBase}/rcsa-workspace`, destination: `${base}/rcsa-workspace`, permanent: false },
      {
        source: `${legacyBase}/evidence-workbench`,
        destination: `${base}/evidence-workbench`,
        permanent: false,
      },
      {
        source: `${legacyBase}/inspection-readiness`,
        destination: `${base}/inspection-readiness`,
        permanent: false,
      },
      { source: "/IndianBankingAuditv1", destination: v1Base, permanent: false },
      { source: "/IndianBankingAuditv1/:path*", destination: `${v1Base}/:path*`, permanent: false },
      { source: "/IndianBankingAuditv2", destination: base, permanent: false },
      { source: "/IndianBankingAuditv2/:path*", destination: `${base}/:path*`, permanent: false },
      { source: "/software_audit_v1-1", destination: "/software_audit/v1-1", permanent: false },
      { source: "/software_audit_v1-1/:path*", destination: "/software_audit/v1-1/:path*", permanent: false },
      { source: "/software_audit_v1-2", destination: "/software_audit/v1-2", permanent: false },
      { source: "/software_audit_v1-2/:path*", destination: "/software_audit/v1-2/:path*", permanent: false },
      { source: "/software_audit_v2", destination: "/software_audit/v2", permanent: false },
      { source: "/software_audit_v2/:path*", destination: "/software_audit/v2/:path*", permanent: false },
      { source: "/UKBankingAuditv1", destination: "/UKBankingAudit/v1", permanent: false },
      { source: "/UKBankingAuditv1/:path*", destination: "/UKBankingAudit/v1/:path*", permanent: false },
      { source: "/UKBankingAuditv2", destination: "/UKBankingAudit/v2", permanent: false },
      { source: "/UKBankingAuditv2/:path*", destination: "/UKBankingAudit/v2/:path*", permanent: false },
    ];
  },
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
