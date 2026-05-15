"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UkVersion = "v1" | "v2";

const UK_BANKING_PATHS: Record<UkVersion, string> = {
  v1: "/UKBankingAuditv1",
  v2: "/UKBankingAuditv2",
};

type SoftwareAuditVersion = "v1-1" | "v1-2" | "v2";

const SOFTWARE_AUDIT_PATHS: Record<SoftwareAuditVersion, string> = {
  "v1-1": "/software_audit/v1-1",
  "v1-2": "/software_audit/v1-2",
  v2: "/software_audit/v2",
};

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
    href: UK_BANKING_PATHS.v2,
  },
  {
    id: "indian-banking-audit",
    title: "Indian Banking Audit",
    icon: "🏛️",
    accentSoftClass: "bg-blue-50 ring-blue-100",
    href: "/IndianBankingAudit",
  },
  {
    id: "software-audit",
    title: "Software Audit",
    icon: "💻",
    accentSoftClass: "bg-violet-50 ring-violet-100",
    href: SOFTWARE_AUDIT_PATHS.v2,
  },
];

function RegionCardIcon({ option }: { option: RegionOption }) {
  return (
    <div className="mb-5 flex items-center justify-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${option.accentSoftClass}`}
      >
        <span className="text-3xl" aria-hidden>
          {option.icon}
        </span>
      </div>
    </div>
  );
}

function UKBankingAuditCard({ option }: { option: RegionOption }) {
  const router = useRouter();
  const [version, setVersion] = useState<UkVersion>("v2");

  const openDashboard = () => {
    router.push(UK_BANKING_PATHS[version]);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative mb-3">
        <div className="flex justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${option.accentSoftClass}`}
          >
            <span className="text-2xl" aria-hidden>
              {option.icon}
            </span>
          </div>
        </div>
        <select
          id="uk-audit-version"
          value={version}
          onChange={(e) => setVersion(e.target.value as UkVersion)}
          className="absolute right-0 top-0 h-7 w-[6.25rem] cursor-pointer rounded-md border border-slate-200 bg-slate-50/90 py-0 pl-2 pr-6 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 hover:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20"
          aria-label="UK Banking Audit version"
        >
          <option value="v2">v2 — latest</option>
          <option value="v1">v1</option>
        </select>
      </div>

      <h2 className="text-center text-[1.7rem] font-bold leading-tight text-slate-900">{option.title}</h2>
      <p className="mt-1 text-center text-sm text-slate-500">Choose dashboard to continue</p>

      <button
        type="button"
        onClick={openDashboard}
        className="mt-4 min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Open dashboard
      </button>
    </div>
  );
}

function SoftwareAuditCard({ option }: { option: RegionOption }) {
  const router = useRouter();
  const [version, setVersion] = useState<SoftwareAuditVersion>("v2");

  const openDashboard = () => {
    router.push(SOFTWARE_AUDIT_PATHS[version]);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative mb-3">
        <div className="flex justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${option.accentSoftClass}`}
          >
            <span className="text-2xl" aria-hidden>
              {option.icon}
            </span>
          </div>
        </div>
        <select
          id="software-audit-version"
          value={version}
          onChange={(e) => setVersion(e.target.value as SoftwareAuditVersion)}
          className="absolute right-0 top-0 h-7 w-[6.75rem] cursor-pointer rounded-md border border-slate-200 bg-slate-50/90 py-0 pl-2 pr-6 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 hover:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20"
          aria-label="Software Audit version"
        >
          <option value="v2">v2 — latest</option>
          <option value="v1-2">v1-2</option>
          <option value="v1-1">v1-1</option>
        </select>
      </div>

      <h2 className="text-center text-[1.7rem] font-bold leading-tight text-slate-900">{option.title}</h2>
      <p className="mt-1 text-center text-sm text-slate-500">Choose dashboard to continue</p>

      <button
        type="button"
        onClick={openDashboard}
        className="mt-4 min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Open dashboard
      </button>
    </div>
  );
}

function RegionCard({ option }: { option: RegionOption }) {
  if (option.id === "uk-banking-audit") {
    return <UKBankingAuditCard option={option} />;
  }
  if (option.id === "software-audit") {
    return <SoftwareAuditCard option={option} />;
  }

  return (
    <Link
      href={option.href}
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <RegionCardIcon option={option} />
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
