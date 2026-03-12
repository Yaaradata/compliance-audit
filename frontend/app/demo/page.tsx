"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROLE_LABELS } from "@/lib/data/roles";
import type { UserRole } from "@/lib/types";

/** Demo credentials for role-based flow: Compliance → Evidence Uploader → L1 → L2 → L3 */
const DEMO_CREDENTIALS: { email: string; password: string; role: UserRole; step: number }[] = [
  { email: "ranjith.bk@yaaralabs.ai", password: "Ranjith154@$#", role: "compliance_officer", step: 1 },
  { email: "125150042@sastra.ac.in", password: "12345678", role: "it_sme", step: 2 },
  { email: "125150056@sastra.ac.in", password: "12345678", role: "internal_reviewer_l1", step: 3 },
  { email: "125150051@sastra.ac.in", password: "12345678", role: "internal_reviewer_l2", step: 4 },
  { email: "125150048@sastra.ac.in", password: "12345678", role: "external_assessor", step: 5 },
];

const DEMO_STORAGE_KEY = "demo_login_credentials";

function DemoRoleCard({
  email,
  password,
  role,
  step,
  onLoginAs,
}: {
  email: string;
  password: string;
  role: UserRole;
  step: number;
  onLoginAs: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}\nRole: ${ROLE_LABELS[role]}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <span
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm"
        style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
      >
        {step}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
          {ROLE_LABELS[role]}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--foreground-muted)" }}>
          {email}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={copyCredentials}
          className="text-xs px-2 py-1 rounded border border-(--border) hover:bg-(--surface) transition-colors"
          style={{ color: "var(--foreground-muted)" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={onLoginAs}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors inline-flex items-center gap-1"
          style={{ background: "var(--primary)" }}
          title="Opens login in new tab"
        >
          Login as this role
          <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const handleLoginAsRole = useCallback(
    (email: string, password: string, role: UserRole) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(
          DEMO_STORAGE_KEY,
          JSON.stringify({ email, password, role })
        );
        window.open("/login?demo=1", "_blank", "noopener,noreferrer");
      } catch {
        window.open("/login", "_blank", "noopener,noreferrer");
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header className="shrink-0 border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              YaaraLabs
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-md"
              style={{ color: "var(--primary)", background: "var(--primary-muted)" }}
            >
              SWIFT Compliance Platform
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="default" />
            <Link
              href="/"
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ color: "var(--foreground-muted)" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--foreground)" }}>
          Role-based demo
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
          Click &quot;Login as this role&quot; to open the login page in a new tab with credentials pre-filled. Flow: Compliance Officer → Evidence Uploader (IT SME) → L1 → L2 → L3
        </p>
        <div className="space-y-2">
          {DEMO_CREDENTIALS.map((c) => (
            <DemoRoleCard
              key={c.role}
              email={c.email}
              password={c.password}
              role={c.role}
              step={c.step}
              onLoginAs={() => handleLoginAsRole(c.email, c.password, c.role)}
            />
          ))}
        </div>
      </main>

      <footer className="shrink-0 border-t py-2" style={{ borderColor: "var(--border)" }}>
        <div className="text-center text-xs" style={{ color: "var(--foreground-muted)" }}>
          YaaraLabs SWIFT Compliance Platform
        </div>
      </footer>
    </div>
  );
}
