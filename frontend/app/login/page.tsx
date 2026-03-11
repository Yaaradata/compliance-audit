"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/data/roles";
import { PasswordInput } from "@/components/ui/password-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { UserRole } from "@/lib/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get("signup") === "1";
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(isSignup ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("compliance_officer");
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!email.trim()) {
        setError("Email is required.");
        return;
      }
      if (!password.trim()) {
        setError("Password is required.");
        return;
      }
      if (mode === "signup" && !name.trim()) {
        setError("Name is required for sign up.");
        return;
      }
      setSubmitting(true);
      try {
        let ok: boolean;
        if (mode === "login") {
          ok = await login(email, password, role);
        } else {
          ok = await signup(email, password, role, name.trim());
        }
        if (!ok) {
          setError(mode === "login" ? "Invalid credentials." : "Sign up failed.");
          setSubmitting(false);
          return;
        }
        // Redirect to dashboard; main layout will send admins to /admin and others to the appropriate place
        router.replace("/dashboard");
      } catch {
        setError("Something went wrong.");
        setSubmitting(false);
      }
    },
    [email, password, name, role, mode, login, signup, router]
  );

  const roles: UserRole[] = ["admin", "compliance_officer", "it_sme", "internal_reviewer_l1", "internal_reviewer_l2", "external_assessor"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header className="border-b flex items-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>YaaraLabs</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-md" style={{ color: "var(--primary)", background: "var(--primary-muted)" }}>
              SWIFT Compliance Platform
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="default" />
            <Link href="/" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--foreground-muted)" }}>Back to home</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md card-elevated p-8" style={{ borderRadius: "var(--radius-xl)" }}>
          <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--border)" }}>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "login" ? "shadow-sm" : ""}`}
              style={mode === "login" ? { background: "var(--surface)", color: "var(--foreground)" } : { color: "var(--foreground-muted)" }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === "signup" ? "shadow-sm" : ""}`}
              style={mode === "signup" ? { background: "var(--surface)", color: "var(--foreground)" } : { color: "var(--foreground-muted)" }}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="input w-full px-3 py-2 text-sm"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs" style={{ color: "var(--foreground-muted)" }}>{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bank.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              hint="Enter your account credentials."
            />

            {error && <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 font-semibold text-white bg-[#0c2340] hover:bg-[#0f2d52] rounded-lg transition-colors"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
            {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}><div className="text-sm" style={{ color: "var(--foreground-muted)" }}>Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
