"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/data/roles";
import { PasswordInput } from "@/components/ui/password-input";
import type { AssessmentCycle } from "@/lib/types";

const TEAM_ROLES = ["it_sme", "internal_reviewer", "external_assessor", "approver"] as const;

interface TeamUserEntry {
  role: (typeof TEAM_ROLES)[number];
  email: string;
  password: string;
  name: string;
}

const initialTeamEntries: TeamUserEntry[] = TEAM_ROLES.map((role) => ({
  role,
  email: "",
  password: "",
  name: "",
}));

export default function CycleTeamSetupPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.cycleId as string;
  const { user, isPlatformAdmin, logout } = useAuth();

  const [cycle, setCycle] = useState<AssessmentCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<TeamUserEntry[]>(initialTeamEntries);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isPlatformAdmin) {
      router.replace("/admin");
      return;
    }
    api
      .get<AssessmentCycle>(`/assessments/${cycleId}`)
      .then(setCycle)
      .catch(() => setCycle(null))
      .finally(() => setLoading(false));
  }, [user, isPlatformAdmin, cycleId, router]);

  const updateEntry = (index: number, field: keyof TeamUserEntry, value: string) => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const missing = entries.filter((e) => !e.email.trim() || !e.password.trim());
    if (missing.length > 0) {
      setError("Please provide email and password for all four roles.");
      return;
    }
    if (entries.some((e) => e.password.length < 8)) {
      setError("Each password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/assessments/${cycleId}/team`, {
        users: entries.map(({ role, email, password, name }) => ({
          role,
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || undefined,
        })),
      });
      router.push(`/select-architecture?cycleId=${cycleId}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err as Error)?.message ||
        "Failed to create team accounts.";
      setError(typeof msg === "string" ? msg : "Failed to create team accounts.");
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push(`/select-architecture?cycleId=${cycleId}`);
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-foreground-muted">Loading…</p>
        </main>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-sm text-foreground-muted mb-4">Assessment cycle not found.</p>
            <Link href="/assessments/new" className="text-sm font-medium text-primary hover:underline">
              Back to assessment cycles
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Set up team accounts</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Create login accounts for this assessment cycle. Each role can sign in with the email and password you set below.
          </p>
          <p className="text-xs text-foreground-muted mt-2">
            Cycle: <span className="font-medium text-foreground">{cycle.label}</span>
            {cycle.display_id && (
              <span className="ml-2 font-mono text-foreground-muted">{cycle.display_id}</span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {entries.map((entry, index) => (
            <section
              key={entry.role}
              className="p-4 rounded-xl border border-border bg-surface"
              aria-labelledby={`role-${entry.role}`}
            >
              <h2 id={`role-${entry.role}`} className="text-sm font-semibold text-foreground mb-3">
                {ROLE_LABELS[entry.role]}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`email-${entry.role}`} className="block text-xs font-medium text-foreground mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`email-${entry.role}`}
                    type="email"
                    value={entry.email}
                    onChange={(e) => updateEntry(index, "email", e.target.value)}
                    placeholder="e.g. user@company.com"
                    className="input w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <PasswordInput
                    label="Password *"
                    value={entry.password}
                    onChange={(e) => updateEntry(index, "password", e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor={`name-${entry.role}`} className="block text-xs font-medium text-foreground mb-1">
                  Name (optional)
                </label>
                <input
                  id={`name-${entry.role}`}
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateEntry(index, "name", e.target.value)}
                  placeholder="Full name"
                  className="input w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </section>
          ))}

          {error && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {submitting ? "Creating accounts…" : "Create accounts & continue"}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 disabled:opacity-60 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-foreground-muted">
          After creating accounts, you will select the SWIFT architecture type. Team members can log in with their email and password and will see menus based on their role.
        </p>
      </main>

      {/* Minimal bar: back link and log out — no sidebar, no full header */}
      <footer className="shrink-0 border-t border-border bg-surface px-6 py-3 flex items-center justify-between text-xs">
        <Link
          href="/assessments/new"
          className="text-foreground-muted hover:text-foreground transition-colors"
        >
          ← Back to assessment cycles
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-foreground-muted hover:text-foreground transition-colors"
        >
          Log out
        </button>
      </footer>
    </div>
  );
}
