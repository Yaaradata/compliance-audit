"use client";

import type { ReactNode } from "react";

export type ModuleTabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

export default function ModuleTabBar({
  items,
  value,
  onChange,
  variant = "solid",
  className = "",
}: {
  items: ReadonlyArray<ModuleTabItem>;
  value: string;
  onChange: (id: string) => void;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const wrapperCls =
    variant === "solid"
      ? "rounded-2xl border border-indigo-100/90 bg-white/70 p-1.5 shadow-inner shadow-indigo-950/5 backdrop-blur-sm"
      : "border-b border-indigo-100/80";

  return (
    <div className={`${wrapperCls} ${className}`}>
      <nav className="flex w-full flex-wrap gap-1">
        {items.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-white/80 hover:text-indigo-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
