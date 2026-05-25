"use client";

import { useEffect, useId, useRef } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { PanelLeft, PanelLeftClose, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { autoSegmentTabStyle } from "../automotive/automotive-ui";

/** Main canvas: one readable column inside the app shell. */
export const SCOPE3_MAX_WIDTH = "max-w-[1280px]";

/** Sidebar width — matches automotive Scope 3 shell. */
export const SCOPE3_SIDEBAR_EXPANDED = "w-[288px]";
export const SCOPE3_SIDEBAR_COLLAPSED = "w-14";
export const SCOPE3_SIDEBAR_MIN_W = "min-w-[288px]";

/** Gradient content panel (see `.auto-scope3-content-panel` in globals.css). */
export const SCOPE3_CONTENT_PANEL_CLASS =
  "auto-scope3-content-panel min-h-[50vh] !p-4 sm:!p-6 lg:!p-8";

export function scope3NavItemClass(active: boolean, sidebarOpen: boolean): string {
  return [
    "relative flex w-full items-center rounded-xl text-left text-sm transition-all",
    sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-2.5",
    active ? "font-semibold text-white shadow-md" : "text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)]",
  ].join(" ");
}

export function scope3NavItemStyle(active: boolean): CSSProperties | undefined {
  return active ? autoSegmentTabStyle(true) : undefined;
}

export function Scope3SidebarBrand({
  sidebarOpen,
  kicker,
  title,
  tag,
  onCollapse,
  onExpand,
}: {
  sidebarOpen: boolean;
  kicker: string;
  title: string;
  tag?: string;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  return (
    <div
      className={`flex shrink-0 items-start gap-2 border-b border-[var(--sidebar-border)] py-3 sm:py-4 ${
        sidebarOpen ? "justify-between px-3 sm:px-4" : "justify-center px-2"
      }`}
    >
      {sidebarOpen ? (
        <>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)]">{kicker}</div>
            <div className="mt-1 text-sm font-semibold leading-snug">{title}</div>
            {tag ? <div className="mt-1 text-[10px] text-[var(--sidebar-text-muted)]">{tag}</div> : null}
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover)]"
            aria-label="Collapse navigation"
            onClick={onCollapse}
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          </button>
        </>
      ) : (
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-[var(--sidebar-hover)]"
          aria-label="Expand navigation"
          onClick={onExpand}
        >
          <PanelLeft className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Scope3SidebarNavButton({
  active,
  sidebarOpen,
  label,
  icon: Icon,
  badge = 0,
  onClick,
}: {
  active: boolean;
  sidebarOpen: boolean;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-current={active ? "page" : undefined}
      aria-label={sidebarOpen ? undefined : label}
      onClick={onClick}
      className={scope3NavItemClass(active, sidebarOpen)}
      style={scope3NavItemStyle(active)}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {sidebarOpen ? (
        <>
          <span className="flex-1 font-medium">{label}</span>
          {badge > 0 ? (
            <span className="rounded-full bg-[var(--danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>
          ) : null}
        </>
      ) : badge > 0 ? (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--danger)]" />
      ) : null}
    </button>
  );
}

/** Filter bars & search rows — light elevation, consistent border */
export const scope3ToolbarSurface =
  "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]";

/** Text inputs & search fields */
export const scope3InputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] shadow-sm outline-none transition-[box-shadow,border-color] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

/** Native selects in header & filters */
export const scope3SelectClass =
  "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none transition-[box-shadow,border-color] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

/** Icon / ghost header controls */
export const scope3IconButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--foreground-muted)] shadow-sm outline-none transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--dashboard-canvas)]";

export function Scope3ViewHeader({
  eyebrow,
  title,
  subtitle,
  aside,
  className = "",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex flex-col gap-4 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-start lg:justify-between ${className}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--foreground)] lg:text-[1.7rem]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--foreground-muted)]">{subtitle}</p>
      </div>
      {aside ? <div className="shrink-0 lg:pt-1">{aside}</div> : null}
    </header>
  );
}

export function Scope3Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Scope3SectionLabel({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-[var(--foreground-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Right-hand slide-over for nested KPI, regulatory, supplier, and control detail. */
export function Scope3DrilldownDrawer({
  open,
  title,
  subtitle,
  children,
  footer,
  onClose,
  size = "md",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  /** `lg` widens the panel for dense assurance / evidence drill-downs. */
  size?: "md" | "lg";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  function trapFocus(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const root = panelRef.current;
    const nodes = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const list = Array.from(nodes).filter((el) => el.offsetParent !== null || root.contains(el));
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity dark:bg-black/55"
        aria-label="Close detail panel"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="document"
        className={`relative flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-l-2xl ${
          size === "lg"
            ? "max-w-full sm:max-w-[min(42rem,calc(100vw-0.5rem))]"
            : "max-w-xl sm:max-w-[28rem]"
        }`}
        onKeyDown={trapFocus}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold leading-snug text-[var(--foreground)]">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-muted)]">{subtitle}</p> : null}
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="shrink-0 rounded-lg p-2 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-[var(--foreground)]">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-[var(--border)] bg-[var(--muted)]/25 px-5 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

/** Full-width placeholder while dashboard search params / inventory load. */
export function Scope3DashboardSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-[var(--dashboard-canvas)]">
      <div className={`hidden h-screen ${SCOPE3_SIDEBAR_EXPANDED} shrink-0 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] sm:block`} />
      <div className="flex min-w-0 flex-1 flex-col gap-5 p-6 sm:p-8">
        <div className="h-14 rounded-xl bg-[var(--muted)] ring-1 ring-slate-900/[0.05]" />
        <div className="h-44 rounded-[var(--radius-lg)] bg-[var(--muted)] ring-1 ring-slate-900/[0.05]" />
        <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--muted)] ring-1 ring-slate-900/[0.05]" />
        <div className="h-52 rounded-[var(--radius-lg)] bg-[var(--muted)] ring-1 ring-slate-900/[0.05]" />
      </div>
    </div>
  );
}
