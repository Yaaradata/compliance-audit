"use client";

import type { ReactNode } from "react";
import type { GlobalFilters } from "./types";
import { scope3SelectClass, scope3ToolbarSurface } from "../Pharma/scope3-ui";

export function GlobalFiltersBar({
  filters,
  options,
  onChange,
}: {
  filters: GlobalFilters;
  options: {
    vehicleModels: string[];
    suppliers: string[];
    geographies: string[];
    periods: string[];
    plants: string[];
    powertrains: string[];
    comparePeriods: string[];
  };
  onChange: (next: GlobalFilters) => void;
}) {
  return (
    <div className={scope3ToolbarSurface}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <FilterField label="Vehicle model">
          <select className={scope3SelectClass} value={filters.vehicleModel} onChange={(e) => onChange({ ...filters, vehicleModel: e.target.value })}>
            {options.vehicleModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Powertrain">
          <select className={scope3SelectClass} value={filters.powertrain} onChange={(e) => onChange({ ...filters, powertrain: e.target.value })}>
            {options.powertrains.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Plant">
          <select className={scope3SelectClass} value={filters.plant} onChange={(e) => onChange({ ...filters, plant: e.target.value })}>
            {options.plants.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Supplier">
          <select className={scope3SelectClass} value={filters.supplier} onChange={(e) => onChange({ ...filters, supplier: e.target.value })}>
            {options.suppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Geography">
          <select className={scope3SelectClass} value={filters.geography} onChange={(e) => onChange({ ...filters, geography: e.target.value })}>
            {options.geographies.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Period">
          <select className={scope3SelectClass} value={filters.period} onChange={(e) => onChange({ ...filters, period: e.target.value })}>
            {options.periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Compare">
          <select className={scope3SelectClass} value={filters.comparePeriod} onChange={(e) => onChange({ ...filters, comparePeriod: e.target.value })}>
            {options.comparePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FilterField>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">{label}</span>
      {children}
    </label>
  );
}

export const defaultGlobalFilters: GlobalFilters = {
  vehicleModel: "All models",
  supplier: "All suppliers",
  geography: "All regions",
  period: "FY2024-25",
  plant: "All plants",
  powertrain: "All powertrains",
  comparePeriod: "None",
};

const DEFAULTS = defaultGlobalFilters;

export function countActiveFilters(filters: GlobalFilters): number {
  return (Object.keys(DEFAULTS) as (keyof GlobalFilters)[]).filter((k) => filters[k] !== DEFAULTS[k]).length;
}

/** Short labels for collapsed toolbar chips. */
export function activeFilterChips(filters: GlobalFilters): { key: keyof GlobalFilters; label: string; value: string }[] {
  const entries: { key: keyof GlobalFilters; label: string }[] = [
    { key: "period", label: "Period" },
    { key: "vehicleModel", label: "Model" },
    { key: "powertrain", label: "Powertrain" },
    { key: "plant", label: "Plant" },
    { key: "supplier", label: "Supplier" },
    { key: "geography", label: "Region" },
    { key: "comparePeriod", label: "Compare" },
  ];
  return entries
    .filter(({ key }) => filters[key] !== DEFAULTS[key])
    .map(({ key, label }) => ({ key, label, value: filters[key] }));
}
