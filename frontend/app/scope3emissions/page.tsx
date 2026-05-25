"use client";

import { useRouter } from "next/navigation";

type Scope3Vertical = {
  id: string;
  title: string;
  icon: string;
  accentSoftClass: string;
  description: string;
  href: string;
};

const VERTICALS: Scope3Vertical[] = [
  {
    id: "pharma",
    title: "Pharma",
    icon: "💊",
    accentSoftClass: "bg-teal-50 ring-teal-100",
    description:
      "India Scope 3 workspace — inventory, suppliers, controls, AI insights, and BRSR-oriented reporting.",
    href: "/scope3emissions/Pharma",
  },
  {
    id: "banking",
    title: "Banking",
    icon: "🏦",
    accentSoftClass: "bg-blue-50 ring-blue-100",
    description:
      "Financed Scope 3, operational emissions, climate risk, green finance, and regulatory controls.",
    href: "/scope3emissions/banking",
  },
  {
    id: "automotive",
    title: "Automotive",
    icon: "🚗",
    accentSoftClass: "bg-emerald-50 ring-emerald-100",
    description:
      "Lifecycle emissions, supply chain intelligence, intensity ratios, and decarbonisation pathways.",
    href: "/scope3emissions/automotive",
  },
];

function VerticalCardIcon({ vertical }: { vertical: Scope3Vertical }) {
  return (
    <div className="mb-5 flex items-center justify-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${vertical.accentSoftClass}`}
      >
        <span className="text-3xl" aria-hidden>
          {vertical.icon}
        </span>
      </div>
    </div>
  );
}

function Scope3VerticalCard({ vertical }: { vertical: Scope3Vertical }) {
  const router = useRouter();

  const openDashboard = () => {
    router.push(vertical.href);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <VerticalCardIcon vertical={vertical} />
      <h2 className="text-center text-[1.7rem] font-bold leading-tight text-slate-900">
        {vertical.title}
      </h2>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500">{vertical.description}</p>
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

export default function Scope3EmissionsHubPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Scope 3 Emissions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Select an industry vertical to open the ESG control-tower workspace.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {VERTICALS.map((vertical) => (
            <Scope3VerticalCard key={vertical.id} vertical={vertical} />
          ))}
        </section>
      </div>
    </main>
  );
}
