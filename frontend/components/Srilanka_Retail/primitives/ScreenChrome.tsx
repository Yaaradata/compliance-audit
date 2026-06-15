import type { ReactNode } from "react";

/**
 * Shared screen frame: eyebrow (screen id), title, subtitle, optional header
 * actions, and the body. Keeps every C1–C5 screen visually consistent.
 */
export function ScreenChrome({
  eyebrow,
  title,
  subtitle,
  headerRight,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/80">
            {eyebrow}
          </span>
          <h2 className="text-xl font-bold text-slate-100 sm:text-2xl">{title}</h2>
          {subtitle ? (
            <p className="max-w-2xl text-sm text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {headerRight ? <div className="flex items-center gap-3">{headerRight}</div> : null}
      </header>
      {children}
    </section>
  );
}
