import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ background: "var(--ks-panel)", border: "1px solid var(--ks-border)", ...style }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: "var(--ks-faint)" }}
    >
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  kind = "primary",
  icon: Icon,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost" | "secondary";
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  const styles: CSSProperties =
    kind === "primary"
      ? {
          background: "var(--ks-accent)",
          color: "var(--ks-btn-primary-fg)",
          border: "1px solid var(--ks-accent)",
        }
      : kind === "ghost"
        ? {
            background: "transparent",
            color: "var(--ks-dim)",
            border: "1px solid var(--ks-border)",
          }
        : {
            background: "var(--ks-raise)",
            color: "var(--ks-text)",
            border: "1px solid var(--ks-border)",
          };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
      style={styles}
    >
      {Icon ? <Icon size={15} strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}
