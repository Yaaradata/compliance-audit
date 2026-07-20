"use client";

export type LensOption<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  options: LensOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * The one segmented-control style for every "lens" surface in v6: the MLRO
 * three-tab selector (Operational Assurance / Inherent Exposure / Fraud) and
 * the CRO drill's Assurance/Exposure toggle both render through this — same
 * component, same active/inactive styling, never forked per screen.
 */
export function LensToggle<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <div className={`flex rounded-lg border border-slate-200 bg-white p-1 text-xs ${className ?? "w-fit"}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={
            value === opt.id
              ? "rounded-md bg-slate-900 px-3.5 py-1.5 font-semibold text-white"
              : "rounded-md px-3.5 py-1.5 font-medium text-slate-500 hover:text-slate-900"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
