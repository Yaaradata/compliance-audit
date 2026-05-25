import { MOCK_SUPPLIERS } from "./mockData-suppliers";
import { SCOPE3_TOTAL_TCO2E } from "./mockData";
import type { ValueChainMockData } from "./value-chain-types";
import { attachValueChainDrills } from "./value-chain-drills";

const UPSTREAM = 1_172_000;
const DOWNSTREAM = 3_648_000;
const UP_PCT = Math.round((UPSTREAM / SCOPE3_TOTAL_TCO2E) * 1000) / 10;
const DOWN_PCT = Math.round((DOWNSTREAM / SCOPE3_TOTAL_TCO2E) * 1000) / 10;

const base: ValueChainMockData = {
  hero: {
    companyTicker: "BMM",
    upstreamEntities: MOCK_SUPPLIERS.filter((s) => s.tier === 1)
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        note: `${s.components[0] ?? "Components"} · ${s.country} · ${(s.tCO2e / 1000).toFixed(0)}k tCO₂e`,
      })),
    downstreamEntities: [
      { name: "BMM Nex EV", note: "BEV platform — Cat 11 grid-charging mix 62% India retail." },
      { name: "BMM Urban ICE", note: "Compact ICE — highest FY25 production volume share." },
      { name: "BMM Cross Hybrid", note: "Hybrid — bridges ICE use phase with smaller battery pack." },
      { name: "BMM Fleet LCV", note: "Fleet LCV — 220k km lifetime; dominates downstream mass." },
      { name: "EU export trims", note: "Lower grid intensity — separate Cat 11 assumption set." },
    ],
    upstreamPctScope3: UP_PCT,
    downstreamPctScope3: DOWN_PCT,
    upstreamTCO2e: UPSTREAM,
    downstreamTCO2e: DOWNSTREAM,
    tagline:
      "An OEM's product is the vehicle. What happens in the supply chain and over the vehicle lifetime is where most Scope 3 sits — use phase alone is ~73% of this inventory.",
    flowLeftLabel: "Materials & logistics INTO plants",
    flowRightLabel: "Use phase & end-of-life AFTER sale",
  },
  upstream: {
    headerTitle: "Upstream — Supply chain & inbound logistics",
    sublabel: "OEM as BUYER | Scope 3 Categories 1–7",
    pctScope3: UP_PCT,
    totalTCO2e: UPSTREAM,
    categories: [
      { id: "c1", label: "Cat 1: Purchased goods & services", tco2e: 892_000, flagLabel: "72% primary-data target" },
      { id: "c4", label: "Cat 4: Upstream transportation", tco2e: 198_000, flagLabel: "Air freight 5.6% of inbound" },
      { id: "c2", label: "Cat 2: Capital goods", tco2e: 28_000 },
      { id: "c5", label: "Cat 5: Waste in operations", tco2e: 42_000 },
      { id: "c6", label: "Cat 6: Business travel", tco2e: 8_000 },
      { id: "c7", label: "Cat 7: Employee commuting", tco2e: 4_000 },
    ],
    suppliers: MOCK_SUPPLIERS.filter((s) => s.tier === 1)
      .slice(0, 6)
      .map((s) => ({
        supplier: s.name,
        supply: s.components.join(", ").slice(0, 40),
        spendCr: s.spendINRCr ?? Math.round(s.tCO2e / 420),
        tco2e: s.tCO2e,
        category: "Cat 1",
      })),
    supplierNote: "Tier 1 supplier PCFs and spend-based factors roll into Cat 1; inbound freight is Cat 4.",
    decarbSignals: [
      { label: "Tier 1 suppliers with verified PCF", value: "58%" },
      { label: "Recycled content in aluminium stampings", value: "18% mass" },
      { label: "Sea vs air inbound (battery cells)", value: "94% sea FY25" },
    ],
    supplierTargetProgress: { label: "Supplier engagement SBTi coverage", pctAchieved: 41 },
  },
  downstream: {
    headerTitle: "Downstream — Use phase & end-of-life",
    sublabel: "OEM as SELLER | Categories 9, 11, 12",
    pctScope3: DOWN_PCT,
    totalTCO2e: DOWNSTREAM,
    segments: [
      { id: "m1", label: "BMM Nex EV", unitsProduced: 99_968, tco2e: 802_000, pctFleet: 22, dataQualityScore: 2.8 },
      { id: "m2", label: "BMM Urban ICE", unitsProduced: 118_712, tco2e: 1_240_000, pctFleet: 34, dataQualityScore: 3.2 },
      { id: "m3", label: "BMM Cross Hybrid", unitsProduced: 56_232, tco2e: 657_000, pctFleet: 18, dataQualityScore: 3.0 },
      { id: "m4", label: "BMM Fleet LCV", unitsProduced: 37_488, tco2e: 949_000, pctFleet: 26, dataQualityScore: 3.6 },
    ],
    sectorPoints: [
      { sector: "India retail", volumeUnits: 214_200, intensityPerVehicle: 14.2, models: 3, quadrant: "TR", fill: "#ef4444" },
      { sector: "India fleet LCV", volumeUnits: 37_488, intensityPerVehicle: 18.6, models: 1, quadrant: "TR", fill: "#f97316" },
      { sector: "EU export", volumeUnits: 28_400, intensityPerVehicle: 9.8, models: 2, quadrant: "BR", fill: "#22c55e" },
      { sector: "ASEAN export", volumeUnits: 18_512, intensityPerVehicle: 11.4, models: 2, quadrant: "BL", fill: "#fbbf24" },
    ],
    quadrantLabels: [
      { key: "TR", title: "HIGH VOLUME + HIGH INTENSITY", subtitle: "Cat 11 focus — models & markets" },
      { key: "TL", title: "LOW VOLUME + HIGH INTENSITY", subtitle: "Niche trims — watch assumptions" },
      { key: "BR", title: "HIGH VOLUME + LOWER INTENSITY", subtitle: "EV / export opportunity" },
      { key: "BL", title: "LOW VOLUME + LOWER INTENSITY", subtitle: "Monitor" },
    ],
    models: [
      {
        id: "m4",
        name: "BMM Fleet LCV",
        lifetimeKm: 220_000,
        gridKgPerKwh: 0.82,
        usePhaseTCO2e: 912_000,
        unitsSoldFY: 37_488,
        attributedTCO2e: 949_000,
        dataQualityScore: 3.6,
        dataQualityLabel: "Proxy — fleet km model",
      },
      {
        id: "m1",
        name: "BMM Nex EV",
        lifetimeKm: 150_000,
        gridKgPerKwh: 0.82,
        usePhaseTCO2e: 771_000,
        unitsSoldFY: 95_500,
        attributedTCO2e: 771_000,
        dataQualityScore: 2.4,
        dataQualityLabel: "ICCT memo + sales split",
      },
    ],
    attributionBoxTitle: "How use-phase (Cat 11) is attributed to each model",
    attributionIntro: "Select a vehicle line to see lifetime km, grid, and volume assumptions used in the FY25 inventory.",
    iceDominant: {
      title: "ICE / hybrid use phase",
      tco2e: 2_412_000,
      pctFleet: 52,
      narrative: ["Fuel combustion proxy", "WLTP + real-world uplift"],
      intensityLabel: "tCO₂e per vehicle sold",
      statusLabel: "Largest absolute block",
      statusTone: "red",
    },
    evGrowing: {
      title: "BEV use phase",
      tco2e: 1_092_000,
      pctFleet: 22,
      narrative: ["Grid-charging mix", "Battery size by trim"],
      intensityLabel: "Improves with renewable PPAs",
      statusLabel: "Fastest decarb lever",
      statusTone: "green",
    },
    hybridBridge: {
      title: "Hybrid bridge",
      tco2e: 620_000,
      pctFleet: 18,
      narrative: ["Dual energy share", "Transition portfolio"],
      intensityLabel: "Moderate intensity",
      statusLabel: "Transitional",
      statusTone: "amber",
    },
    netPositionLine:
      "Decarbonisation requires EV mix, supplier PCF, and use-phase assumptions to move together — Cat 11 cannot be optimised in isolation from Cat 1 battery supply.",
  },
  engagement: {
    funnelTitle: "Supplier PCF engagement funnel (Tier 1)",
    stages: [
      { id: "s1", title: "Tier 1 in scope", subtitle: "By emissions", count: 8, pctOfPrior: 100 },
      { id: "s2", title: "PCF requested", subtitle: "Wave 1–2", count: 8, pctOfPrior: 100 },
      { id: "s3", title: "PCF received", subtitle: "Any version", count: 6, pctOfPrior: 75 },
      { id: "s4", title: "Verified PCF", subtitle: "Assurance-ready", count: 4, pctOfPrior: 67 },
      { id: "s5", title: "SBTi or net-zero commit", subtitle: "Supplier target", count: 3, pctOfPrior: 75 },
    ],
    insightLineA: "Cathode Materials Ltd remains non-compliant — blocks Wave 1 battery coverage.",
    insightLineB: "Target: 75% of Tier 1 emissions covered by valid PCF by FY26 close.",
  },
  trend: {
    points: [
      { fy: "FY22", downstreamActual: 4_120_000, downstreamTarget: 4_000_000, upstreamActual: 1_280_000, upstreamTarget: 1_200_000 },
      { fy: "FY23", downstreamActual: 4_280_000, downstreamTarget: 3_850_000, upstreamActual: 1_240_000, upstreamTarget: 1_150_000 },
      { fy: "FY24", downstreamActual: 4_050_000, downstreamTarget: 3_600_000, upstreamActual: 1_200_000, upstreamTarget: 1_100_000 },
      { fy: "FY25", downstreamActual: DOWNSTREAM, downstreamTarget: 3_200_000, upstreamActual: UPSTREAM, upstreamTarget: 980_000 },
      { fy: "FY26", downstreamActual: 3_420_000, downstreamTarget: 2_900_000, upstreamActual: 1_050_000, upstreamTarget: 920_000 },
      { fy: "FY27", downstreamActual: 3_100_000, downstreamTarget: 2_500_000, upstreamActual: 980_000, upstreamTarget: 860_000 },
    ],
    annotations: [
      { fy: "FY24", text: "ICCT grid factor refresh — Cat 11 restatement", tone: "up" },
      { fy: "FY25", text: "EV mix 32% — use-phase model update", tone: "down" },
    ],
    gapLabel: "FY25 downstream gap vs glide path",
    gapTCO2e: DOWNSTREAM - 3_200_000,
    footerLines: [
      "Upstream glide path tied to supplier PCF programme and logistics mode shift.",
      "Downstream path assumes EV share 45% by FY27 and fleet telematics for LCV.",
    ],
  },
};

export const valueChainMockData = attachValueChainDrills(base);
