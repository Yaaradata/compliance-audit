"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DASHBOARD_LABELS } from "@/lib/demo-access";

function DeniedBody() {
  const searchParams = useSearchParams();
  const key = searchParams.get("d") ?? "";
  const label = DASHBOARD_LABELS[key] ?? (key || "that dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          You&apos;re signed in, but you don&apos;t have access to {label}.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Ask your administrator to add it to your account.
        </p>
        <Link
          href="/select_region"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to region select
        </Link>
      </div>
    </main>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-48 animate-pulse rounded-full bg-slate-200" />
        </main>
      }
    >
      <DeniedBody />
    </Suspense>
  );
}
