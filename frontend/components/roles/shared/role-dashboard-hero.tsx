import Link from "next/link";

export type RoleDashboardHeroAction =
  | { href: string; label: string; gradient: string }
  | { onClick: () => void; label: string; gradient: string };

type RoleDashboardHeroProps = {
  eyebrow: string;
  greetingName: string;
  description: string;
  primaryActions?: RoleDashboardHeroAction[];
};

export function RoleDashboardHero({
  eyebrow,
  greetingName,
  description,
  primaryActions = [],
}: RoleDashboardHeroProps) {
  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
            {eyebrow}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--foreground)" }}>
            Good day, {greetingName}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
            {description}
          </p>
        </div>
        {primaryActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {primaryActions.map((a) =>
              "onClick" in a ? (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className="interactive-hero-action rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: a.gradient }}
                >
                  {a.label}
                </button>
              ) : (
                <Link
                  key={a.href + a.label}
                  href={a.href}
                  className="interactive-hero-action rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: a.gradient }}
                >
                  {a.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
