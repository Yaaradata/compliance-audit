import type { ReactNode } from "react";

export default function SectionTitle({
  children,
  right,
  subtitle,
}: {
  children: ReactNode;
  right?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {children}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-indigo-600/75">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
