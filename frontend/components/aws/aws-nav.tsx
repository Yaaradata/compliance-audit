"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/aws", label: "Dashboard" },
  { href: "/aws/evidence", label: "Evidence" },
  { href: "/aws/controls", label: "Controls" },
];

export function AwsNav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-0.5 rounded-xl border p-1"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      aria-label="AWS evidence"
    >
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = href === "/aws" ? pathname === "/aws" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
            style={
              isActive
                ? { background: "var(--primary)", color: "white" }
                : { color: "var(--foreground-muted)" }
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
