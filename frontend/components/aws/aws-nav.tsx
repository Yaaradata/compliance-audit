"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/aws", label: "Connect" },
  { href: "/aws/dashboard", label: "Dashboard" },
  { href: "/aws/evidence", label: "Evidence" },
  { href: "/aws/controls", label: "Controls" },
];

export function AwsNav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-1 rounded-xl border p-1.5 w-full max-w-fit"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
      aria-label="AWS section"
    >
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = href === "/aws" ? pathname === "/aws" || pathname === "/aws/" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors min-h-[40px] flex items-center justify-center"
            style={
              isActive
                ? { background: "var(--primary)", color: "var(--primary-foreground, white)" }
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
