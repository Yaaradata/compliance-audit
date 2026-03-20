"use client";

/**
 * Wraps AWS section content with consistent spacing/container.
 */
export function AwsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col gap-6">{children}</div>
    </div>
  );
}
