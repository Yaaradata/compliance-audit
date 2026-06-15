import type { PostureStatus } from "@/lib/Srilanka_Retail/types";

const CELL: Record<PostureStatus, { dot: string; cell: string }> = {
  OK: { dot: "var(--ks-green)", cell: "var(--ks-green-dim)" },
  ATTENTION: { dot: "var(--ks-amber)", cell: "var(--ks-amber-dim)" },
  BREACH: { dot: "var(--ks-amber)", cell: "var(--ks-amber-dim)" },
};

export function StatusCell({
  status,
  title,
  highlight = false,
}: {
  status: PostureStatus;
  title?: string;
  highlight?: boolean;
}) {
  const s = CELL[status];
  return (
    <div
      title={title}
      className="flex h-12 items-center justify-center rounded-md border transition-colors duration-500"
      style={{
        background: s.cell,
        borderColor: highlight ? "var(--ks-accent)" : "var(--ks-border-soft)",
        boxShadow: highlight ? "0 0 0 1px var(--ks-accent)" : undefined,
      }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.dot }} aria-hidden />
    </div>
  );
}
