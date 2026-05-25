import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scope 3 emissions — Banking (mock)",
  description:
    "Illustrative banking dashboard for financed Scope 3 Category 15, operational Scope 3, climate risk, and related controls (UX validation dataset).",
};

export default function Scope3BankingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="scope-3-emissions-root min-h-screen bg-[var(--dashboard-canvas)] text-[var(--foreground)] antialiased">{children}</div>
  );
}
