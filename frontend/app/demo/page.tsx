"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/data/roles";
import { DEMO_ROLE_STEPS, type DemoRole } from "@/lib/demo-auth";

function DemoRoleCard({
  role,
  step,
  busy,
  onLoginAs,
}: {
  role: DemoRole;
  step: number;
  busy: boolean;
  onLoginAs: () => Promise<void>;
}) {
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
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          Server-authenticated demo account
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onLoginAs}
          disabled={busy}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors inline-flex items-center gap-1"
          style={{ background: "var(--primary)" }}
          title="Start a server-authenticated demo session"
        >
          {busy ? "Signing in…" : "Login as this role"}
          <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const router = useRouter();
  const { demoLogin } = useAuth();
  const [activeRole, setActiveRole] = useState<DemoRole | null>(null);
  const [error, setError] = useState("");

  const handleLoginAsRole = async (role: DemoRole) => {
    setError("");
    setActiveRole(role);
    const ok = await demoLogin(role);
    if (ok) {
      router.push("/dashboard");
      return;
    }
    setError("Demo login failed. Check the server-only demo credential configuration.");
    setActiveRole(null);
  };

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
          Select a role to start a server-authenticated demo session. Flow: Compliance Officer → Evidence Collection (IT) → L1 Review → L2/External Review → Approver
        </p>
        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <div className="space-y-2">
          {DEMO_ROLE_STEPS.map(({ role, step }) => (
            <DemoRoleCard
              key={role}
              role={role}
              step={step}
              busy={activeRole === role}
              onLoginAs={() => handleLoginAsRole(role)}
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
