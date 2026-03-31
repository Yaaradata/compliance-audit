"use client";

/** Wraps GCP section content with consistent spacing/container (same pattern as AWS shell — no top nav pills). */
export function GcpPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col gap-6">{children}</div>
    </div>
  );
}
