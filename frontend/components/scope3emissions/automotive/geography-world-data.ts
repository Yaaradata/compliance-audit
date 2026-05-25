import type { GeographyEmission } from "./types";

/** ISO 3166-1 alpha-2 → numeric (world-atlas `countries-110m` feature id). */
export const ISO2_TO_NUMERIC: Record<string, string> = {
  IN: "356",
  CN: "156",
  KR: "410",
  DE: "276",
  AU: "036",
  IT: "380",
  TW: "158",
  BE: "056",
  MY: "458",
  JP: "392",
  FR: "250",
  US: "840",
  GB: "826",
};

/** ISO 3166-1 alpha-2 → alpha-3 for Plotly choropleth. */
export const ISO2_TO_ISO3: Record<string, string> = {
  IN: "IND",
  CN: "CHN",
  KR: "KOR",
  DE: "DEU",
  AU: "AUS",
  IT: "ITA",
  TW: "TWN",
  BE: "BEL",
  MY: "MYS",
  JP: "JPN",
  FR: "FRA",
  US: "USA",
  GB: "GBR",
};

/** Country centroids for bubble overlay (lat, lon). */
export const COUNTRY_GEO: Record<string, { lat: number; lon: number; label: string }> = {
  IN: { lat: 22.5, lon: 79, label: "India" },
  CN: { lat: 35, lon: 105, label: "China" },
  KR: { lat: 36.5, lon: 127.5, label: "South Korea" },
  DE: { lat: 51.2, lon: 10.5, label: "Germany" },
  AU: { lat: -25, lon: 134, label: "Australia" },
  IT: { lat: 42.8, lon: 12.5, label: "Italy" },
  TW: { lat: 23.7, lon: 121, label: "Taiwan" },
  BE: { lat: 50.5, lon: 4.5, label: "Belgium" },
  MY: { lat: 4.2, lon: 102, label: "Malaysia" },
  JP: { lat: 36.2, lon: 138.3, label: "Japan" },
  FR: { lat: 46.5, lon: 2.5, label: "France" },
};

export const PLANT_GEO: Record<string, { lat: number; lon: number; label: string }> = {
  Pune: { lat: 18.52, lon: 73.86, label: "Pune" },
  Chennai: { lat: 13.08, lon: 80.27, label: "Chennai" },
  Sanand: { lat: 22.99, lon: 72.38, label: "Sanand" },
};

export function geographyPlotPayload(geography: GeographyEmission[], plants: string[]) {
  const locations = geography.map((g) => ISO2_TO_ISO3[g.iso] ?? g.iso);
  const z = geography.map((g) => g.tCO2e);
  const text = geography.map(
    (g) =>
      `${g.country}<br>${(g.tCO2e / 1_000_000).toFixed(2)} Mt<br>${g.supplierCount} suppliers<br>Grid ${g.gridIntensityKgPerKwh} kg/kWh`,
  );

  const bubbleLats: number[] = [];
  const bubbleLons: number[] = [];
  const bubbleText: string[] = [];
  const bubbleSize: number[] = [];
  const maxT = Math.max(...geography.map((g) => g.tCO2e), 1);

  for (const g of geography) {
    const geo = COUNTRY_GEO[g.iso];
    if (!geo) continue;
    bubbleLats.push(geo.lat);
    bubbleLons.push(geo.lon);
    bubbleText.push(`${geo.label}: ${(g.tCO2e / 1_000_000).toFixed(2)} Mt CO₂e`);
    bubbleSize.push(12 + (g.tCO2e / maxT) * 38);
  }

  const plantLats = plants.map((p) => PLANT_GEO[p]?.lat).filter((v): v is number => v != null);
  const plantLons = plants.map((p) => PLANT_GEO[p]?.lon).filter((v): v is number => v != null);
  const plantLabels = plants.filter((p) => PLANT_GEO[p]);

  return { locations, z, text, bubbleLats, bubbleLons, bubbleText, bubbleSize, plantLats, plantLons, plantLabels };
}
