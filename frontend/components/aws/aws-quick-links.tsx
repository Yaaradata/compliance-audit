"use client";

import Link from "next/link";
import { FileText, ListChecks, ChevronRight } from "lucide-react";

const LINKS = [
  {
    href: "/aws/evidence",
    title: "Evidence",
    desc: "Browse all collected evidence",
    icon: FileText,
    style: "bg-[var(--info-bg)] text-[var(--info)] hover:opacity-90",
  },
  {
    href: "/aws/controls",
    title: "Controls",
    desc: "View controls and fetch by control",
    icon: ListChecks,
    style: "bg-[var(--primary-muted)] text-[var(--primary)] hover:opacity-90",
  },
];

export function AwsQuickLinks() {
  return (
    <nav className="flex flex-col gap-3" aria-label="Quick links">
      {LINKS.map(({ href, title, desc, icon: Icon, style }) => (
        <Link
          key={href}
          href={href}
          className="card rounded-xl p-4 flex items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style}`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              {title}
            </span>
            <span className="block text-xs" style={{ color: "var(--foreground-muted)" }}>
              {desc}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--foreground-muted)" }} />
        </Link>
      ))}
    </nav>
  );
}
