import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scope 3 Emissions (Automotive) | ESG Control Tower",
  description:
    "Automotive Scope 3 workspace — lifecycle emissions, supply chain intelligence, BRSR-aligned reporting, and decarbonisation pathways.",
};

export default function Scope3AutomotiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="scope-3-emissions-root min-h-screen bg-[var(--dashboard-canvas)] text-[var(--foreground)] antialiased">
      {children}
    </div>
  );
}
