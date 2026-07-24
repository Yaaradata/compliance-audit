"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_LABELS } from "@/lib/demo-access";

type Mode = "signin" | "signup";

const DASHBOARD_ENTRIES = Object.entries(DASHBOARD_LABELS);

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
const primaryBtnClass =
  "w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/select_region";
  return raw;
}

function AccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));

  const [checkingSession, setCheckingSession] = useState(true);
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  // Client fallback: if proxy did not catch it, bounce signed-in users off this page.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/access/me", { cache: "no-store" });
        const d = (await r.json()) as { signedIn?: boolean };
        if (cancelled) return;
        if (d.signedIn) {
          router.replace(next);
          return;
        }
      } catch {
        // stay on form
      }
      if (!cancelled) setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  const toggleKey = (key: string) => {
    setRequested((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setSignupDone(false);
  };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const r = await fetch("/api/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (!d.ok) {
        setError(d.error || "Email or password not recognised.");
        setSubmitting(false);
        return;
      }
      // replace so Back does not return to /access
      router.replace(next);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const selected = DASHBOARD_ENTRIES.map(([key]) => key).filter((key) => requested[key]);
    if (selected.length === 0) {
      setError("Select at least one dashboard.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/access/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          requested: selected.join(","),
        }),
      });
      const d = (await r.json()) as { ok?: boolean; error?: string };
      if (!d.ok) {
        setError(d.error || "Sign up failed. Please try again.");
        setSubmitting(false);
        return;
      }
      setSignupDone(true);
      setSubmitting(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10">
      {checkingSession ? (
        <div className="h-10 w-48 animate-pulse rounded-full bg-slate-200" aria-label="Checking session" />
      ) : (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {mode === "signin" ? "Sign in" : "Sign up"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {mode === "signin"
              ? "Use the email and password from your access grant."
              : "Create an account and choose the dashboards you need. An administrator must approve before you can sign in."}
          </p>
        </div>

        {mode === "signup" && signupDone ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm leading-relaxed text-emerald-900">
            Sign up submitted — your account has been created and is awaiting approval. You&apos;ll
            be able to sign in once an administrator activates it.
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setPassword("");
                  switchMode("signin");
                }}
                className="text-sm font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
              >
                Back to sign in
              </button>
            </div>
          </div>
        ) : mode === "signin" ? (
          <form onSubmit={onSignIn} className="space-y-4">
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </label>
            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={submitting} className={primaryBtnClass}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={onSignUp} className="space-y-4">
            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </label>

            <fieldset>
              <legend className={labelClass}>Dashboards</legend>
              <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/80 p-2.5">
                {DASHBOARD_ENTRIES.map(([key, label]) => (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm text-slate-800 hover:bg-white">
                      <input
                        type="checkbox"
                        checked={Boolean(requested[key])}
                        onChange={() => toggleKey(key)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      {label}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={submitting} className={primaryBtnClass}>
              {submitting ? "Signing up…" : "Sign up"}
            </button>
          </form>
        )}

        {!(mode === "signup" && signupDone) ? (
          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-slate-900 underline underline-offset-2"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-slate-900 underline underline-offset-2"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        ) : null}

        <p className="mt-4 text-center text-xs text-slate-400">
          <Link href="/select_region" className="hover:text-slate-600">
            Back to region select
          </Link>
        </p>
      </div>
      )}
    </main>
  );
}

export default function AccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-48 animate-pulse rounded-full bg-slate-200" />
        </main>
      }
    >
      <AccessForm />
    </Suspense>
  );
}
