"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/lib/sidebar-context";

const SIDEBAR_HEADER_HEIGHT = 56;

function ChevronIcon({ open, className = "w-5 h-5" }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 200ms ease" }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

/**
 * Sticky sidebar header: circular logo + product name when expanded;
 * collapse chevron (expanded) or search icon (collapsed) on the right.
 */
export function SidebarHeader({
  open,
  onSearchClick,
  className = "",
}: {
  open: boolean;
  onSearchClick?: () => void;
  className?: string;
}) {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const href = user?.role === "admin" ? "/admin" : "/dashboard";

  if (!open) {
    return (
      <div
        className={`shrink-0 border-b flex flex-col items-center gap-2 transition-all duration-200 ${className}`}
        style={{
          minHeight: SIDEBAR_HEADER_HEIGHT,
          borderColor: "var(--sidebar-border)",
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        <Link
          href={href}
          className="rounded-full w-9 h-9 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sidebar-active-text)] shrink-0"
          style={{ background: "var(--sidebar-active-bg)", color: "var(--sidebar-active-text)" }}
          aria-label="YaaraLabs SWIFT — Home"
          title="YaaraLabs SWIFT Compliance"
        >
          <span className="font-bold text-sm">YL</span>
        </Link>
        <button
          type="button"
          onClick={onSearchClick ?? toggle}
          className="w-9 h-9 rounded-full flex items-center justify-center outline-none transition-all duration-200 hover:bg-[var(--sidebar-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sidebar-active-text)]"
          style={{ color: "var(--sidebar-text-muted)" }}
          title="Expand sidebar / Search"
          aria-label="Expand sidebar"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 border-b flex items-center gap-3 min-w-0 transition-[padding] duration-200 ${className}`}
      style={{
        minHeight: SIDEBAR_HEADER_HEIGHT,
        borderColor: "var(--sidebar-border)",
        paddingLeft: 12,
        paddingRight: 10,
      }}
    >
      <Link
        href={href}
        className="flex items-center gap-3 min-w-0 flex-1 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sidebar-active-text)] transition-shadow duration-200 overflow-hidden"
        aria-label="YaaraLabs SWIFT Compliance Platform — Home"
      >
        <span
          className="rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: "var(--sidebar-active-bg)", color: "var(--sidebar-active-text)" }}
        >
          YL
        </span>
        <span
          className="font-bold text-base truncate"
          style={{ color: "var(--sidebar-text)" }}
        >
          YaaraLabs
        </span>
        <span
          className="text-[10px] font-medium uppercase tracking-wider truncate shrink-0"
          style={{ color: "var(--sidebar-text-muted)" }}
        >
          SWIFT
        </span>
      </Link>
      <button
        type="button"
        onClick={toggle}
        className="shrink-0 w-9 h-9 min-w-[36px] rounded-full flex items-center justify-center outline-none transition-all duration-200 hover:bg-[var(--sidebar-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--sidebar-active-text)]"
        style={{ color: "var(--sidebar-text)" }}
        title="Collapse sidebar"
        aria-label="Collapse sidebar"
        aria-expanded={open}
      >
        <ChevronIcon open={open} className="w-5 h-5 shrink-0" />
      </button>
    </div>
  );
}
