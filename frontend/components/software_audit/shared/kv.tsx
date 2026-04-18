import type { ReactNode } from "react";

export default function KV({
  k,
  v,
  mono = false,
}: {
  k: string;
  v: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <dt className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {k}
      </dt>
      <dd
        className={`text-right text-sm text-slate-900 ${
          mono ? "break-all font-mono text-xs" : ""
        }`}
      >
        {v}
      </dd>
    </div>
  );
}
