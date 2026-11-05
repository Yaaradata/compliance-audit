/** v8 risk appetite metrics: 50 metrics, each with values for Jun–Nov 2026. */
import { V8_CONFIG } from "../config";
import type { RAM, RAMValue, SmfRef } from "../types";

type Seed = {
  id: string;
  name: string;
  unit: string;
  limit: number;
  tolerance: number;
  lowerIsWorse?: boolean;
  zeroTolerance?: boolean;
  values: readonly [number, number, number, number, number, number];
};

type CategorySeed = { categoryId: string; owner: string; smf?: SmfRef; rams: Seed[] };

const CATEGORIES: CategorySeed[] = [
  {
    categoryId: "credit",
    owner: "Head of Credit Risk",
    smf: "SMF4",
    rams: [
      { id: "RAM-CR-01", name: "Portfolio delinquency", unit: "%", limit: 2.5, tolerance: 3.5, values: [2.1, 2.2, 2.3, 2.4, 2.6, 2.3] },
      { id: "RAM-CR-02", name: "NPL ratio", unit: "%", limit: 2.5, tolerance: 3.5, values: [1.1, 1.1, 1.2, 1.2, 1.2, 1.2] },
      { id: "RAM-CR-03", name: "Watchlist names", unit: "names", limit: 50, tolerance: 75, values: [21, 22, 22, 24, 25, 23] },
      { id: "RAM-CR-04", name: "Top-10 counterparty limit utilisation", unit: "%", limit: 85, tolerance: 100, values: [64, 65, 66, 67, 69, 68] },
      { id: "RAM-CR-05", name: "Model validation findings overdue", unit: "findings", limit: 0, tolerance: 2, values: [0, 0, 0, 0, 0, 0] },
    ],
  },
  {
    categoryId: "market",
    owner: "Head of Market Risk",
    rams: [
      { id: "RAM-MK-01", name: "VaR utilisation", unit: "%", limit: 85, tolerance: 100, values: [68, 70, 71, 74, 73, 72] },
      { id: "RAM-MK-02", name: "Hedge effectiveness", unit: "%", limit: 90, tolerance: 80, lowerIsWorse: true, values: [97, 96, 96, 95, 96, 96] },
      { id: "RAM-MK-03", name: "Stressed VaR utilisation", unit: "%", limit: 85, tolerance: 100, values: [66, 67, 69, 71, 71, 70] },
      { id: "RAM-MK-04", name: "IRRBB EVE sensitivity to Tier 1", unit: "%", limit: 10, tolerance: 15, values: [5.8, 5.9, 6.1, 6.3, 6.2, 6.2] },
      { id: "RAM-MK-05", name: "FX open position to limit", unit: "%", limit: 80, tolerance: 100, values: [52, 48, 57, 61, 58, 55] },
    ],
  },
  {
    categoryId: "liquidity",
    owner: "Group Treasurer",
    smf: "SMF2",
    rams: [
      { id: "RAM-LQ-01", name: "Liquidity coverage ratio (regulatory minimum 100%)", unit: "%", limit: 120, tolerance: 105, lowerIsWorse: true, values: [155, 153, 152, 150, 149, 148] },
      { id: "RAM-LQ-02", name: "Net stable funding ratio", unit: "%", limit: 110, tolerance: 105, lowerIsWorse: true, values: [119, 119, 118, 118, 118, 118] },
      { id: "RAM-LQ-03", name: "Survival horizon under stress", unit: "days", limit: 90, tolerance: 60, lowerIsWorse: true, values: [131, 129, 128, 126, 125, 124] },
      { id: "RAM-LQ-04", name: "Top-20 depositor concentration", unit: "%", limit: 15, tolerance: 20, values: [10.4, 10.6, 10.7, 10.9, 11.0, 11.0] },
      { id: "RAM-LQ-05", name: "Asset encumbrance", unit: "%", limit: 25, tolerance: 35, values: [17, 17, 18, 18, 18, 18] },
    ],
  },
  {
    categoryId: "conduct",
    owner: "Head of Conduct Risk",
    smf: "SMF16",
    rams: [
      { id: "RAM-CD-01", name: "FOS overturn rate", unit: "%", limit: 15, tolerance: 20, values: [13, 12, 12, 13, 12, 12] },
      { id: "RAM-CD-02", name: "Complaints per 1,000 customers", unit: "per 1,000", limit: 5, tolerance: 7, values: [3.4, 3.3, 3.3, 3.2, 3.2, 3.2] },
      { id: "RAM-CD-03", name: "Complaints closed within 8 weeks", unit: "%", limit: 95, tolerance: 90, lowerIsWorse: true, values: [96, 97, 97, 97, 97, 97] },
      { id: "RAM-CD-04", name: "Vulnerable customer QA pass rate", unit: "%", limit: 95, tolerance: 90, lowerIsWorse: true, values: [96, 96, 96.5, 97, 96.5, 96.5] },
      { id: "RAM-CD-05", name: "Product fair value reviews overdue", unit: "reviews", limit: 0, tolerance: 2, values: [0, 0, 0, 0, 0, 0] },
    ],
  },
  {
    categoryId: "climate",
    owner: "Head of Climate Risk",
    rams: [
      { id: "RAM-CL-01", name: "High-transition-risk sector lending", unit: "%", limit: 8, tolerance: 10, values: [7.1, 7.0, 7.0, 6.9, 6.8, 6.8] },
      { id: "RAM-CL-02", name: "Mortgage collateral in high flood-risk areas", unit: "%", limit: 5, tolerance: 8, values: [3.2, 3.2, 3.1, 3.1, 3.1, 3.1] },
      { id: "RAM-CL-03", name: "Transition plan milestones on track", unit: "%", limit: 90, tolerance: 80, lowerIsWorse: true, values: [92, 92, 93, 93, 94, 94] },
      { id: "RAM-CL-04", name: "Climate disclosure actions overdue", unit: "actions", limit: 0, tolerance: 2, values: [0, 0, 0, 0, 0, 0] },
      { id: "RAM-CL-05", name: "Age of scenario pathway refresh", unit: "months", limit: 12, tolerance: 18, values: [0, 1, 2, 3, 4, 5] },
    ],
  },
  {
    categoryId: "fincrime",
    owner: "Head of Financial Crime Compliance",
    smf: "SMF17",
    rams: [
      { id: "RAM-FC-01", name: "Sanctions breaches", unit: "breaches", limit: 0, tolerance: 0, zeroTolerance: true, values: [0, 0, 0, 0, 0, 0] },
      { id: "RAM-FC-02", name: "KYC refresh backlog on high-risk relationships", unit: "cases", limit: 1000, tolerance: 5000, values: [4210, 4240, 4270, 4310, 4350, 4380] },
      { id: "RAM-FC-03", name: "AML alert backlog above SLA", unit: "%", limit: 5, tolerance: 8, values: [4.6, 4.8, 5.1, 5.4, 5.9, 6.4] },
      { id: "RAM-FC-04", name: "TM alerts closed within SLA", unit: "%", limit: 95, tolerance: 80, lowerIsWorse: true, values: [93, 92, 91, 89, 88, 86] },
      { id: "RAM-FC-05", name: "EDD completed on time", unit: "%", limit: 98, tolerance: 90, lowerIsWorse: true, values: [96, 96, 95, 95, 94, 93] },
      { id: "RAM-FC-06", name: "High-risk reviews overdue", unit: "%", limit: 5, tolerance: 20, values: [12, 13, 14, 15, 16, 17] },
      { id: "RAM-FC-07", name: "Sanctions screening coverage", unit: "%", limit: 99.5, tolerance: 99, lowerIsWorse: true, values: [99.9, 99.9, 99.9, 99.9, 99.9, 99.9] },
      { id: "RAM-FC-08", name: "SARs filed on time", unit: "%", limit: 98, tolerance: 95, lowerIsWorse: true, values: [99.4, 99.3, 99.3, 99.2, 99.1, 99.1] },
    ],
  },
  {
    categoryId: "opsres",
    owner: "Head of Operational Resilience",
    rams: [
      { id: "RAM-OR-01", name: "Important business services within impact tolerance", unit: "of 3 services", limit: 3, tolerance: 2, lowerIsWorse: true, values: [3, 3, 3, 3, 3, 3] },
      { id: "RAM-OR-02", name: "Severe scenario tests completed", unit: "%", limit: 90, tolerance: 75, lowerIsWorse: true, values: [91, 92, 93, 94, 96, 96] },
      { id: "RAM-OR-03", name: "Material outsourcing assessments overdue", unit: "assessments", limit: 0, tolerance: 3, values: [0, 0, 0, 0, 0, 0] },
      { id: "RAM-OR-04", name: "Change failure rate", unit: "%", limit: 10, tolerance: 15, values: [6.1, 6.0, 6.3, 6.2, 6.8, 6.4] },
      { id: "RAM-OR-05", name: "Payments platform availability", unit: "%", limit: 99.9, tolerance: 99.5, lowerIsWorse: true, values: [99.97, 99.98, 99.96, 99.97, 99.92, 99.96] },
    ],
  },
  {
    categoryId: "cyber",
    owner: "Head of Information Security",
    smf: "SMF24",
    rams: [
      { id: "RAM-CY-01", name: "Critical vulnerabilities open", unit: "open", limit: 0, tolerance: 2, values: [0, 0, 4, 4, 3, 3] },
      { id: "RAM-CY-02", name: "Mean time to patch critical vulnerabilities", unit: "hours", limit: 168, tolerance: 336, values: [120, 132, 384, 408, 432, 432] },
      { id: "RAM-CY-03", name: "MFA coverage", unit: "%", limit: 99.5, tolerance: 99, lowerIsWorse: true, values: [99.6, 99.6, 99.6, 99.7, 99.7, 99.7] },
      { id: "RAM-CY-04", name: "Phishing simulation click rate", unit: "%", limit: 8, tolerance: 12, values: [6.8, 6.6, 6.5, 6.4, 6.2, 6.1] },
      { id: "RAM-CY-05", name: "Endpoint detection coverage", unit: "%", limit: 98, tolerance: 95, lowerIsWorse: true, values: [98.3, 98.4, 98.4, 98.5, 98.6, 98.6] },
      { id: "RAM-CY-06", name: "Backup restore tests passed", unit: "%", limit: 95, tolerance: 90, lowerIsWorse: true, values: [96, 96, 97, 97, 97, 97] },
      { id: "RAM-CY-07", name: "Privileged access reviews overdue", unit: "reviews", limit: 0, tolerance: 5, values: [0, 0, 1, 1, 2, 2] },
    ],
  },
  {
    categoryId: "regulatory",
    owner: "Head of Regulatory Affairs",
    smf: "SMF16",
    rams: [
      { id: "RAM-RG-01", name: "Open regulatory findings", unit: "findings", limit: 0, tolerance: 2, values: [0, 0, 0, 0, 0, 0] },
      { id: "RAM-RG-02", name: "Regulatory actions overdue", unit: "actions", limit: 0, tolerance: 2, values: [0, 0, 0, 0, 0, 0] },
      { id: "RAM-RG-03", name: "Regulatory returns on time", unit: "%", limit: 100, tolerance: 98, lowerIsWorse: true, values: [100, 100, 100, 100, 100, 100] },
      { id: "RAM-RG-04", name: "Regulatory change assessments overdue", unit: "assessments", limit: 0, tolerance: 3, values: [0, 0, 0, 0, 0, 0] },
      { id: "RAM-RG-05", name: "SM&CR attestations on time", unit: "%", limit: 100, tolerance: 95, lowerIsWorse: true, values: [100, 100, 100, 100, 100, 100] },
    ],
  },
];

export const RAMS: RAM[] = CATEGORIES.flatMap(({ categoryId, owner, smf, rams }) =>
  rams.map((seed) => ({
    id: seed.id,
    name: seed.name,
    categoryId,
    unit: seed.unit,
    limit: seed.limit,
    tolerance: seed.tolerance,
    direction: seed.lowerIsWorse ? ("lowerIsWorse" as const) : ("higherIsWorse" as const),
    zeroTolerance: seed.zeroTolerance ?? false,
    owner,
    ...(smf ? { smf } : {}),
  })),
);

export const RAM_VALUES: RAMValue[] = CATEGORIES.flatMap(({ rams }) =>
  rams.flatMap((seed) =>
    seed.values.map((value, i) => ({ ramId: seed.id, period: V8_CONFIG.periods[i], value })),
  ),
);
