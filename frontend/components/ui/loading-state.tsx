"use client";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: "var(--foreground-muted)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card rounded-xl p-8 text-center" style={{ borderColor: "var(--border)" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>{title}</p>
      {description && <p className="text-xs mb-4" style={{ color: "var(--foreground-muted)" }}>{description}</p>}
      {action}
    </div>
  );
}
