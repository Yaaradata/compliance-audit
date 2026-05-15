import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Access Management Audit | SWIFT Compliance",
  description: "AWS IAM access management and identity governance audit view",
};

export default function SoftwareAuditFrontendLayout({ children }: { children: ReactNode }) {
  return <div className="software-audit-frontend-root min-h-screen">{children}</div>;
}
