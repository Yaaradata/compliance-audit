"use client";

import { useEffect, useMemo, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { AutomotiveScope3MockData, GeographyEmission } from "./types";
import { COUNTRY_GEO, ISO2_TO_NUMERIC, PLANT_GEO } from "./geography-world-data";
import { formatTCO2e } from "./automotive-ui";

const MAP_W = 1000;
const MAP_H = 500;
/** Local copy in `public/geo/`; CDN fallback if missing (e.g. fresh clone). */
const WORLD_TOPO_URLS = [
  "/geo/countries-110m.json",
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
] as const;

async function fetchWorldTopo(): Promise<WorldAtlas> {
  let lastError: Error | null = null;
  for (const url of WORLD_TOPO_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Map data failed (${res.status})`);
      return (await res.json()) as WorldAtlas;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error("Could not load world map data");
}

type WorldAtlas = {
  objects: { countries: Parameters<typeof feature>[1] };
};

type CountryPath = {
  key: string;
  id: string;
  d: string;
  name: string;
  row?: GeographyEmission;
  fill: string;
};

function choroplethFill(intensity: number): string {
  const t = Math.min(1, Math.max(0, intensity));
  const r = Math.round(186 + (3 - 186) * t);
  const g = Math.round(230 + (105 - 230) * t);
  const b = Math.round(253 + (154 - 253) * t);
  return `rgb(${r},${g},${b})`;
}

function buildMapLayers(
  worldTopo: WorldAtlas,
  emissionsByNumeric: Map<string, GeographyEmission>,
  maxT: number,
) {
  const countries = feature(
    worldTopo as unknown as Parameters<typeof feature>[0],
    worldTopo.objects.countries,
  ) as unknown as FeatureCollection<Geometry>;
  const projection = geoEquirectangular().fitExtent(
    [
      [8, 8],
      [MAP_W - 8, MAP_H - 8],
    ],
    countries,
  );
  const pathGen = geoPath(projection);

  const countryPaths: CountryPath[] = [];
  for (let i = 0; i < countries.features.length; i++) {
    const f = countries.features[i];
    const id = String(f.id ?? "");
    const name =
      (f.properties as { name?: string } | null)?.name ?? (id || `region-${i}`);
    const row = emissionsByNumeric.get(id);
    const d = pathGen(f);
    if (!d) continue;
    const intensity = row ? row.tCO2e / maxT : 0;
    countryPaths.push({
      key: id ? `country-${id}-${name}` : `country-${i}-${name}`,
      id,
      d,
      name,
      row,
      fill: row ? choroplethFill(intensity) : "#f8fafc",
    });
  }

  const project = (lon: number, lat: number) => {
    const p = projection([lon, lat]);
    return p ? { x: p[0], y: p[1] } : { x: 0, y: 0 };
  };

  return { countryPaths, project };
}

export function WorldGeographyMap({
  geography,
  plants,
  className = "h-[min(440px,58vh)] min-h-[320px] w-full",
}: {
  geography: AutomotiveScope3MockData["geography"];
  plants: string[];
  className?: string;
}) {
  const [worldTopo, setWorldTopo] = useState<WorldAtlas | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWorldTopo()
      .then((data) => {
        if (!cancelled) setWorldTopo(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Could not load world map data");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxT = useMemo(() => Math.max(...geography.map((g) => g.tCO2e), 1), [geography]);
  const total = useMemo(() => geography.reduce((a, g) => a + g.tCO2e, 0), [geography]);

  const emissionsByNumeric = useMemo(() => {
    const m = new Map<string, GeographyEmission>();
    for (const g of geography) {
      const num = ISO2_TO_NUMERIC[g.iso];
      if (num) m.set(num, g);
    }
    return m;
  }, [geography]);

  const { countryPaths, project } = useMemo(() => {
    if (!worldTopo) {
      return {
        countryPaths: [] as CountryPath[],
        project: () => ({ x: 0, y: 0 }),
      };
    }
    return buildMapLayers(worldTopo, emissionsByNumeric, maxT);
  }, [worldTopo, emissionsByNumeric, maxT]);

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 text-sm text-rose-800 ${className}`}
        role="alert"
      >
        {loadError}
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-full w-full rounded-xl"
        role="img"
        aria-label="World emissions map"
        aria-busy={!worldTopo}
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#oceanGrad)" rx={8} />

        {!worldTopo ? (
          <text x={MAP_W / 2} y={MAP_H / 2} textAnchor="middle" fontSize={14} fill="#64748b">
            Loading world map…
          </text>
        ) : (
          <>
            <g>
              {countryPaths.map((c) => (
                <path
                  key={c.key}
                  d={c.d}
                  fill={c.fill}
                  stroke="#94a3b8"
                  strokeWidth={0.35}
                  strokeLinejoin="round"
                >
                  <title>
                    {c.name}
                    {c.row
                      ? `\n${formatTCO2e(c.row.tCO2e, true)} · ${c.row.supplierCount} suppliers`
                      : "\nNo attributed Scope 3 in FY25 mock"}
                  </title>
                </path>
              ))}
            </g>

            {geography.map((g) => {
              const geo = COUNTRY_GEO[g.iso];
              if (!geo) return null;
              const { x, y } = project(geo.lon, geo.lat);
              const r = 8 + (g.tCO2e / maxT) * 22;
              const share = total > 0 ? ((g.tCO2e / total) * 100).toFixed(1) : "0";
              const opacity = 0.35 + (g.tCO2e / maxT) * 0.5;
              return (
                <g key={g.iso} className="pointer-events-none">
                  <circle cx={x} cy={y} r={r + 3} fill="#0369a1" fillOpacity={opacity * 0.3} />
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="#0e7490"
                    fillOpacity={opacity}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                  <text x={x} y={y + r + 11} textAnchor="middle" fontSize={9} fontWeight={700} fill="#0f172a">
                    {g.iso}
                  </text>
                  <title>
                    {g.country}
                    {"\n"}
                    {formatTCO2e(g.tCO2e, true)} ({share}%)
                    {"\n"}
                    {g.supplierCount} suppliers · Grid {g.gridIntensityKgPerKwh} kg/kWh
                  </title>
                </g>
              );
            })}

            {plants.map((p) => {
              const pt = PLANT_GEO[p];
              if (!pt) return null;
              const { x, y } = project(pt.lon, pt.lat);
              return (
                <g key={p}>
                  <rect
                    x={x - 5}
                    y={y - 5}
                    width={10}
                    height={10}
                    fill="#ea580c"
                    stroke="#fff"
                    strokeWidth={1.5}
                    rx={1}
                  />
                  <text x={x + 8} y={y + 3} fontSize={9} fontWeight={700} fill="#c2410c">
                    {p}
                  </text>
                  <title>BMM plant — {p}</title>
                </g>
              );
            })}
          </>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-[10px] text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-5 rounded-sm border border-slate-400"
            style={{ background: "linear-gradient(90deg,#bae6fd,#0369a1)" }}
            aria-hidden
          />
          Country shade = attributed tCO₂e
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-sky-800 bg-sky-500/40" aria-hidden />
          Bubble size = attributed tCO₂e
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#ea580c]" aria-hidden />
          Square = manufacturing plant
        </span>
        <span>Natural Earth 110m · equirectangular · FY25 supplier geography</span>
      </div>
    </div>
  );
}
