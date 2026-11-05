/**
 * v8 recorded ratings for the last three reviews, used to compute trend.
 * Cyber has been red since August and Financial Crime amber since April 2026
 * (DOMAIN_HISTORY). Credit went amber in October on delinquency and recovered in November.
 */
import type { RatingColour, RatingDriver, RatingSnapshot } from "../types";

const CYBER_DRIVERS: RatingDriver[] = [
  { type: "ram", id: "RAM-CY-01", label: "Critical vulnerabilities open" },
  { type: "ram", id: "RAM-CY-02", label: "Mean time to patch critical vulnerabilities" },
  { type: "control", id: "CY-C001", label: "Critical Vulnerability Patching" },
];

const FINCRIME_DRIVERS: RatingDriver[] = [
  { type: "ram", id: "RAM-FC-02", label: "KYC refresh backlog on high-risk relationships" },
  { type: "ram", id: "RAM-FC-03", label: "AML alert backlog above SLA" },
];

const row = (
  entity: string,
  period: string,
  colour: RatingColour,
  drivers: RatingDriver[] = [],
): RatingSnapshot => ({ entity, period, colour, drivers });

const STEADY_GREEN = ["market", "liquidity", "conduct", "climate", "opsres", "regulatory"];
const PERIODS = ["2026-09", "2026-10", "2026-11"];

export const RATING_SNAPSHOTS: RatingSnapshot[] = PERIODS.flatMap((period) => [
  row("firm", period, "red", [{ type: "ram", id: "RAM-CY-01", label: "Cyber & Information Security" }]),
  row("cyber", period, "red", [
    ...CYBER_DRIVERS,
    ...(period === "2026-11"
      ? [{ type: "incident" as const, id: "INC-2026-041", label: "Exploit attempt on unpatched perimeter vulnerability" }]
      : []),
  ]),
  row("fincrime", period, "amber", FINCRIME_DRIVERS),
  period === "2026-10"
    ? row("credit", period, "amber", [{ type: "ram", id: "RAM-CR-01", label: "Portfolio delinquency" }])
    : row("credit", period, "green"),
  ...STEADY_GREEN.map((entity) => row(entity, period, "green")),
]);
