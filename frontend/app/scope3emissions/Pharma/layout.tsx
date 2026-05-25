import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scope 3 Emissions (Pharma) | ESG Control Tower",
  description:
    "Pharma-focused India Scope 3 workspace — inventory, suppliers, controls, AI insights, and BRSR-oriented reporting.",
};

export default function Scope3EmissionsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="scope-3-emissions-root min-h-screen bg-[var(--dashboard-canvas)] text-[var(--foreground)] antialiased">
      {children}
    </div>
  );
}
