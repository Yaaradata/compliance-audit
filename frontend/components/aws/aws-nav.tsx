"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { awsNavLinkClass, awsNavShellClass } from "@/components/aws/aws-ui";

const NAV_LINKS = [
  { href: "/aws", label: "Connect" },
  { href: "/aws/dashboard", label: "Dashboard" },
  { href: "/aws/evidence", label: "Evidence" },
];

export function AwsNav() {
  const pathname = usePathname();
  return (
    <nav className={awsNavShellClass} aria-label="AWS section">
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = href === "/aws" ? pathname === "/aws" || pathname === "/aws/" : pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${awsNavLinkClass} ${!isActive ? "hover:bg-[var(--muted)] hover:text-[var(--foreground)]" : ""}`}
            style={
              isActive
                ? { background: "var(--primary)", color: "var(--primary-foreground, white)", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)" }
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
