"use client";

import { AwsNav } from "./aws-nav";

/**
 * Wraps AWS section content with top nav and consistent container.
 * Use for Dashboard, Evidence, Controls. Connect page uses its own centered layout.
 */
export function AwsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="shrink-0 mb-6">
        <AwsNav />
      </div>
      <div className="flex-1 flex flex-col gap-6">{children}</div>
    </div>
  );
}
