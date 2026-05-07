"use client";

import Link from "next/link";

type RegionOption = {
  id: string;
  title: string;
  icon: string;
  accentSoftClass: string;
  href: string;
};

const REGION_OPTIONS: RegionOption[] = [
  {
    id: "swift",
    title: "SWIFT",
    icon: "💳",
    accentSoftClass: "bg-indigo-50 ring-indigo-100",
    href: "/",
  },
  {
    id: "indian-process",
    title: "Indian Process",
    icon: "📋",
    accentSoftClass: "bg-amber-50 ring-amber-100",
    href: "/Internal_Audit",
  },
  {
    id: "us-banking-audit",
    title: "US Banking Audit",
    icon: "🏦",
    accentSoftClass: "bg-rose-50 ring-rose-100",
    href: "/USBankingAudit",
  },
  {
    id: "uk-banking-audit",
    title: "UK Banking Audit",
    icon: "🛡️",
    accentSoftClass: "bg-emerald-50 ring-emerald-100",
    href: "/UKBankingAudit",
  },
  {
    id: "indian-banking-audit",
    title: "Indian Banking Audit",
    icon: "🏛️",
    accentSoftClass: "bg-blue-50 ring-blue-100",
    href: "/IndianBankingAudit",
  },
];

function RegionCard({ option }: { option: RegionOption }) {
  return (
    <Link
      href={option.href}
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="mb-5 flex items-center justify-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${option.accentSoftClass}`}
        >
          <span className="text-3xl" aria-hidden>
            {option.icon}
          </span>
        </div>
      </div>
      <h2 className="text-center text-[1.7rem] font-bold leading-tight text-slate-900">{option.title}</h2>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500">Choose dashboard to continue</p>
    </Link>
  );
}

export default function SelectRegionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Welcome to Compliance Audit
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Select a client to access the respective dashboard.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {REGION_OPTIONS.map((option) => (
            <RegionCard key={option.id} option={option} />
          ))}
        </section>
      </div>
    </main>
  );
}
