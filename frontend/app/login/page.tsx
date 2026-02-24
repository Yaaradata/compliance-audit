"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/data/roles";
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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!email.trim()) {
        setError("Email is required.");
        return;
      }
      if (mode === "signup" && !name.trim()) {
        setError("Name is required for sign up.");
        return;
      }
      if (mode === "login") {
        const ok = login(email, password, role);
        if (!ok) {
          setError("Login failed.");
          return;
        }
      } else {
        const ok = signup(email, password, role, name.trim());
        if (!ok) {
          setError("Sign up failed.");
          return;
        }
      }
      if (role === "admin") router.replace("/admin");
      else router.replace("/select-architecture");
    },
    [email, password, name, role, mode, login, signup, router]
  );

  const roles: UserRole[] = ["admin", "compliance_officer", "it_sme", "internal_reviewer", "external_assessor", "approver"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-800">YaaraLabs</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">SWIFT Compliance Platform</span>
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">Back to home</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-lg p-8">
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "signup" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">{ROLE_DESCRIPTIONS[role]}</p>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">Mock auth — any password works.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 font-semibold text-white bg-[#0c2340] hover:bg-[#0f2d52] rounded-lg transition-colors"
            >
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-medium text-blue-600 hover:underline">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-sm text-slate-500">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
