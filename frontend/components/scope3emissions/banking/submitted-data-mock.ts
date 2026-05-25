import type {
  BankControlRegisterRow,
  BankEvidenceReviewState,
  BankSubmittedDataArtifact,
  BankSubmittedDataPage,
  BankSubmittedDataRecord,
  BankSubmittedDataSectorRollup,
  BorrowerRow,
} from "./types";

const LINEAGE: BankSubmittedDataPage["lineage"] = [
  { step: 1, label: "Intake & virus scan", detail: "Borrower portal, supplier room, or SFTP drop — SHA-256 logged in evidence index." },
  { step: 2, label: "Metadata & control mapping", detail: "Category tags, PCAF option, and control IDs (C-BAX-*) linked before QA queue." },
  { step: 3, label: "Credit / ESG review", detail: "RM + ESG analyst sign-off; clarifications looped to counterparty contact." },
  { step: 4, label: "Inventory lock & calculation", detail: "Accepted packages cited in FY25 PCAF run calc-fy25-q3-v4.2 and BRSR Principle 6 workbook." },
  { step: 5, label: "Assurance & disclosure", detail: "PBC bundle for limited assurance; hashes cross-checked in Compliance & Audit register." },
];

type UpstreamSupplierSeed = {
  id: string;
  name: string;
  supply: string;
  category: string;
  spendCr: number;
  tco2e: number;
};

function hashSeed(id: string, salt: string): string {
  let h = 0;
  const s = `${id}:${salt}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(12, "0").slice(0, 12);
}

function reviewForBorrower(b: BorrowerRow, variant: number): BankEvidenceReviewState {
  if (!b.brsrDisclosed && b.pcafScore >= 4) return variant % 2 === 0 ? "Clarification requested" : "Under review";
  if (b.brsrDisclosed && b.pcafScore <= 2) return "Indexed — accepted";
  if (b.brsrDisclosed) return variant % 3 === 0 ? "Under review" : "Indexed — accepted";
  return "Under review";
}

function isoDaysAgo(days: number, hour = 10): string {
  const d = new Date(Date.UTC(2025, 10, 15 - days, hour, 30, 0));
  return d.toISOString().replace(".000Z", "+05:30");
}

function buildDrilldown(
  b: BorrowerRow,
  pkgSuffix: string,
  pcafOption: string,
): BankSubmittedDataRecord["drilldown"] {
  return {
    evidencePackageVersion: `FY25.${b.id}.${pkgSuffix}`,
    inventoryObjectLockId: `inv-lock-fy25-${b.id}-${pkgSuffix}`,
    calculationEngineJobPath: `s3://baxb-pcaf-prod/runs/fy25-q3/v4.2/jobs/${b.id}_${pkgSuffix}.json`,
    gwpStandard: "AR6 (100-year)",
    emissionFactorRegistryVersion: "BAXB-EF-REG-2025-09",
    boundaryAndPeriodNote: `Operational control boundary — FY25 (Apr 2024–Mar 2025). Financed attribution ${b.attributionFactorPct}% on ${b.facilityType}, maturity ${b.maturity}.`,
    dataQualityRationale: `PCAF Option ${pcafOption} — ${b.brsrDisclosed ? "reported" : "proxy-augmented"} Scope 1+2; score ${b.pcafScore} at index.`,
    pcafOption,
    pcafScoreAtSubmission: b.pcafScore,
    attributionFactorPct: b.attributionFactorPct,
    facilityRefs: [`${b.facilityType} — ${b.maturity}`, `RM sector: ${b.rmFocusSector}`],
    activityLineRefs: [
      {
        activityClass: "Financed emissions — attributed Scope 1+2",
        inventoryJobId: `job-cat15-${b.id}`,
        coveredTCO2eApprox: b.attributedTCO2e,
        gwpSet: "AR6",
        emissionFactorRegistryVersion: "BAXB-EF-REG-2025-09",
      },
    ],
    regulatoryCrosswalk: [
      { instrument: "SEBI BRSR Core", clauseOrSection: "Principle 6 — KPI 1", relevance: "Financed emissions intensity" },
      { instrument: "PCAF Global GHG Standard", clauseOrSection: "Ch. 8 — Business loans", relevance: "Attribution methodology" },
      { instrument: "RBI Climate Risk Disclosure", clauseOrSection: "Annex — financed emissions", relevance: "Portfolio coverage narrative" },
    ],
    versionHistory: [
      { at: isoDaysAgo(42), actor: "Counterparty — ESG portal", event: "Initial upload" },
      { at: isoDaysAgo(38), actor: "ESG Operations — QA", event: "Virus scan + metadata tagged" },
      { at: isoDaysAgo(35), actor: "Credit Risk — ESG screen", event: "Linked to control C-BAX-01" },
    ],
    legalRetention: {
      minRetentionYears: 10,
      storageTier: "WORM — Mumbai DC + cross-region replica",
      jurisdictionNote: "India DPDP + RBI record-keeping; EU branch read-only mirror where applicable.",
    },
    attestations: b.brsrDisclosed
      ? [
          {
            signerName: "Chief Sustainability Officer",
            signerTitle: "CSO / Company Secretary",
            signedAt: isoDaysAgo(40, 14),
            scopeStatement: "Scope 1+2 figures in this package are complete and fairly stated for FY25 operational boundary.",
          },
        ]
      : undefined,
    clarificationsRaised:
      !b.brsrDisclosed && b.pcafScore >= 4
        ? ["Provide FY25 BRSR filing receipt or notarized disclosure timeline.", "Attach facility-level electricity bills for top 3 sites."]
        : undefined,
    technicalContact: {
      name: "ESG Reporting Desk",
      email: `esg.reporting@${b.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) || "counterparty"}.in`,
    },
  };
}

function borrowerPackages(b: BorrowerRow, idx: number): BankSubmittedDataRecord[] {
  const baseId = `BAX-EV-${b.id.toUpperCase()}`;
  const reviews = [reviewForBorrower(b, 0), reviewForBorrower(b, 1), reviewForBorrower(b, 2)];
  const templates: {
    suffix: string;
    title: string;
    categories: number[];
    controls: string[];
    channel: BankSubmittedDataRecord["channel"];
    tier: BankSubmittedDataRecord["intendedDataQualityTier"];
    assertion: string;
    focus: string;
    artifacts: BankSubmittedDataArtifact[];
    pcafOption: string;
  }[] = [
    {
      suffix: "AR",
      title: `FY25 audited annual report + BRSR Principle 6 extract — ${b.name}`,
      categories: [15],
      controls: ["C-BAX-01", "C-BAX-04"],
      channel: "Borrower ESG portal",
      tier: "Primary",
      assertion: `Scope 1+2 of ${(b.scope12TCO2e / 1e6).toFixed(2)} MtCO₂e for FY25 with limited assurance on energy & GHG appendix; BRSR ${b.brsrDisclosed ? "filed" : "not yet filed"}.`,
      focus: `Tie AR page refs to ${b.facilityType}; reconcile attribution ${b.attributionFactorPct}% to ₹${b.loanOutstandingINRCr} cr outstanding.`,
      artifacts: [
        {
          fileName: `${b.name.replace(/\s+/g, "_")}_Annual_Report_FY25.pdf`,
          format: "PDF",
          sizeLabel: "8.4 MB",
          sha256Prefix: hashSeed(b.id, "ar"),
          contentSummary: "Auditor-signed AR with GHG inventory note and BRSR Core KPI table.",
          virusScan: "Clean",
        },
        {
          fileName: "BRSR_P6_environmental_disclosure.xlsx",
          format: "XLSX",
          sizeLabel: "1.1 MB",
          sha256Prefix: hashSeed(b.id, "brsr"),
        },
      ],
      pcafOption: "1",
    },
    {
      suffix: "INV",
      title: `Scope 1+2 inventory workbook + assurance opinion — ${b.name}`,
      categories: [15],
      controls: ["C-BAX-02", "C-BAX-05"],
      channel: "Secure SFTP — PCAF inbox",
      tier: "Primary",
      assertion: `Plant-level FY25 activity data; market-based Scope 2 where RE certificates attached; PCAF data quality score ${b.pcafScore}.`,
      focus: `EF vintage must match BAXB-EF-REG-2025-09; sample intensity ${b.emissionIntensity} tCO₂e/₹cr vs attributed ${(b.attributedTCO2e / 1000).toFixed(0)} kt.`,
      artifacts: [
        {
          fileName: "GHG_inventory_FY25_site_level.xlsx",
          format: "XLSX",
          sizeLabel: "3.6 MB",
          sha256Prefix: hashSeed(b.id, "inv"),
          contentSummary: "Site-level fuels, electricity, process emissions with allocation keys.",
        },
        {
          fileName: "limited_assurance_opinion_GHG.pdf",
          format: "PDF",
          sizeLabel: "420 KB",
          sha256Prefix: hashSeed(b.id, "assure"),
          virusScan: "Clean",
        },
      ],
      pcafOption: b.pcafScore <= 2 ? "1" : "2",
    },
  ];

  if (b.sbtiCommitted || b.engagement === "Committed to Transition Plan" || idx % 3 === 0) {
    templates.push({
      suffix: "TP",
      title: `Transition plan & capex schedule — ${b.name}`,
      categories: [15],
      controls: ["C-BAX-07"],
      channel: "Email + checksum registry",
      tier: b.sbtiCommitted ? "Primary" : "Secondary",
      assertion: `${b.sbtiCommitted ? "SBTi-validated" : "Internal"} pathway to 2030; capex linked to bank covenants on ${b.facilityType}.`,
      focus: `Engagement "${b.engagement}" — validate milestones; review red flag "${b.redFlags}".`,
      artifacts: [
        {
          fileName: "transition_plan_FY25-30.pdf",
          format: "PDF",
          sizeLabel: "2.2 MB",
          sha256Prefix: hashSeed(b.id, "tp"),
          contentSummary: "Abatement levers, capex phasing, and financed-emissions sensitivity.",
        },
      ],
      pcafOption: "2",
    });
  }

  if (!b.brsrDisclosed && b.pcafScore >= 4) {
    templates.push({
      suffix: "PROXY",
      title: `Sector EEIO proxy pack + bureau overlay — ${b.name}`,
      categories: [15],
      controls: ["C-BAX-03"],
      channel: "CIBIL / bureau climate overlay",
      tier: "EEIO",
      assertion: `Non-disclosing obligor — EEIO intensity for ${b.sector} applied pending primary data; exposure ₹${b.loanOutstandingINRCr} cr.`,
      focus: "Obtain primary inventory within 90 days per credit policy; document proxy vintage and uncertainty band.",
      artifacts: [
        {
          fileName: "EEIO_proxy_methodology_memo.pdf",
          format: "PDF",
          sizeLabel: "680 KB",
          sha256Prefix: hashSeed(b.id, "eeio"),
        },
        {
          fileName: "bureau_climate_risk_overlay.xml",
          format: "XML",
          sizeLabel: "92 KB",
          sha256Prefix: hashSeed(b.id, "xml"),
        },
      ],
      pcafOption: "4",
    });
  }

  return templates.map((t, vi) => ({
    id: `${baseId}-${t.suffix}`,
    title: t.title,
    stream: "downstream" as const,
    counterpartyKind: "borrower" as const,
    counterpartyId: b.id,
    counterpartyName: b.name,
    sector: b.sector,
    submittedAt: isoDaysAgo(45 - idx * 2 - vi * 3),
    indexedAt: isoDaysAgo(43 - idx * 2 - vi * 3, 15),
    channel: t.channel,
    submitterOrg: b.name,
    submitterRole: "Chief Sustainability Officer",
    scope3CategoryIds: t.categories,
    linkedControlIds: t.controls,
    disclosureUse: ["PCAF Annual Disclosure", "BRSR Principle 6", "RBI climate risk annex"],
    intendedDataQualityTier: t.tier,
    reviewState: reviews[vi % reviews.length] ?? "Under review",
    reviewer: reviews[vi % reviews.length] === "Indexed — accepted" ? "ESG Operations — QA" : "Credit Risk — ESG screen",
    reportingPeriodLabel: "FY25",
    assertionSummary: t.assertion,
    verificationFocus: t.focus,
    artifacts: t.artifacts,
    lineageStep: 1,
    linkedEngagementId: b.engagement !== "Unengaged" ? `eng-${b.id}` : undefined,
    drilldown: buildDrilldown(b, t.suffix, t.pcafOption),
  }));
}

function upstreamPackages(suppliers: UpstreamSupplierSeed[]): BankSubmittedDataRecord[] {
  const catMap: Record<string, number[]> = {
    "Cat 1": [1],
    "Cat 2": [2],
    "Cat 3": [3],
    "Cat 6": [6],
    "Cat 8": [8],
    Scope: [2, 3],
  };

  return suppliers.flatMap((s, i) => {
    const cats = catMap[s.category] ?? [1];
    const accepted = i % 4 !== 2;
    return [
      {
        id: `BAX-EV-UP-${s.id}`,
        title: `Supplier emissions disclosure — ${s.supply} (${s.name})`,
        stream: "upstream" as const,
        counterpartyKind: "supplier" as const,
        counterpartyId: s.id,
        counterpartyName: s.name,
        sector: "Bank operations — upstream",
        submittedAt: isoDaysAgo(30 - i),
        indexedAt: isoDaysAgo(28 - i, 16),
        channel: i % 2 === 0 ? "Supplier sustainability portal" : "Secure SFTP — PCAF inbox",
        submitterOrg: s.name,
        submitterRole: "Vendor sustainability lead",
        scope3CategoryIds: cats,
        linkedControlIds: ["C-BAX-10", "C-BAX-11"],
        disclosureUse: ["Operational Scope 3 — Categories 1–8", "Branch network carbon account"],
        intendedDataQualityTier: accepted ? "Primary" : "Secondary",
        reviewState: accepted ? "Indexed — accepted" : "Under review",
        reviewer: accepted ? "Procurement ESG — QA" : "Facilities — reviewer",
        reportingPeriodLabel: "FY25",
        assertionSummary: `FY25 emissions attributable to ${s.supply}: ${(s.tco2e / 1000).toFixed(1)} ktCO₂e; spend ₹${s.spendCr} cr on contract FY25.`,
        verificationFocus: `Match invoice PO lines to activity class; confirm category ${s.category} mapping in upstream inventory.`,
        artifacts: [
          {
            fileName: `${s.id}_emissions_statement_FY25.pdf`,
            format: "PDF",
            sizeLabel: "1.8 MB",
            sha256Prefix: hashSeed(s.id, "stmt"),
            contentSummary: `Contract-level disclosure for ${s.supply}.`,
            virusScan: "Clean",
          },
          {
            fileName: `${s.id}_activity_data_FY25.csv`,
            format: "CSV",
            sizeLabel: "240 KB",
            sha256Prefix: hashSeed(s.id, "csv"),
          },
        ],
        lineageStep: 2,
        drilldown: {
          evidencePackageVersion: `FY25.up.${s.id}`,
          inventoryObjectLockId: `inv-lock-upstream-${s.id}`,
          calculationEngineJobPath: `s3://baxb-ops-scope3/runs/fy25-q3/upstream/${s.id}.json`,
          gwpStandard: "AR6 (100-year)",
          emissionFactorRegistryVersion: "BAXB-EF-REG-2025-09",
          boundaryAndPeriodNote: "Bank operational boundary — supplier-specific activity allocated by spend.",
          dataQualityRationale: "Supplier-reported where available; otherwise spend-based EEIO with contract uplift.",
          activityLineRefs: [
            {
              activityClass: s.supply,
              inventoryJobId: `job-up-${s.id}`,
              coveredTCO2eApprox: s.tco2e,
              gwpSet: "AR6",
              emissionFactorRegistryVersion: "BAXB-EF-REG-2025-09",
            },
          ],
          regulatoryCrosswalk: [
            { instrument: "GHG Protocol Corporate Standard", clauseOrSection: "Scope 3 — Category " + cats[0], relevance: s.supply },
            { instrument: "BRSR Principle 6", clauseOrSection: "Upstream emissions narrative", relevance: "Bank own operations" },
          ],
          versionHistory: [
            { at: isoDaysAgo(30 - i), actor: s.name, event: "Portal upload" },
            { at: isoDaysAgo(28 - i), actor: "Procurement ESG", event: "Indexed for upstream run" },
          ],
          legalRetention: {
            minRetentionYears: 7,
            storageTier: "Standard — encrypted object store",
            jurisdictionNote: "Procurement contract retention schedule.",
          },
        },
      },
    ];
  });
}

function internalPackages(): BankSubmittedDataRecord[] {
  return [
    {
      id: "BAX-EV-INT-001",
      title: "FY25 branch network electricity master data — consolidated utility bills",
      stream: "internal",
      counterpartyKind: "internal",
      counterpartyId: "baxb-ops",
      counterpartyName: "Bharatiya Axis Bank Ltd — Facilities",
      sector: "Bank operations — internal",
      submittedAt: isoDaysAgo(20),
      indexedAt: isoDaysAgo(18, 11),
      channel: "Internal — ESG / Credit",
      submitterOrg: "Bharatiya Axis Bank Ltd",
      submitterRole: "Head of Facilities & Workplace",
      scope3CategoryIds: [3, 8],
      linkedControlIds: ["C-BAX-12"],
      disclosureUse: ["Operational Scope 2/3 bridge", "BRSR energy intensity"],
      intendedDataQualityTier: "Primary",
      reviewState: "Indexed — accepted",
      reviewer: "ESG Operations",
      reportingPeriodLabel: "FY25",
      assertionSummary: "Consolidated kWh from 1,180 branches; 28% renewable (PPA + green tariff); residual T&D losses modelled.",
      verificationFocus: "Reconcile to utility invoice sample n=45; confirm RE certificate bundle matches PPA registry.",
      artifacts: [
        {
          fileName: "branch_electricity_master_FY25.xlsx",
          format: "XLSX",
          sizeLabel: "12 MB",
          sha256Prefix: "f1a2b3c4d5e6",
          contentSummary: "Branch-level kWh, tariff, and RE attribution flags.",
        },
        {
          fileName: "RE_certificate_bundle_Q1-Q4.zip",
          format: "ZIP",
          sizeLabel: "4.2 MB",
          sha256Prefix: "a9b8c7d6e5f4",
          virusScan: "Clean",
        },
      ],
      lineageStep: 4,
      drilldown: {
        evidencePackageVersion: "FY25.internal.elec",
        inventoryObjectLockId: "inv-lock-internal-electricity",
        calculationEngineJobPath: "s3://baxb-ops-scope3/runs/fy25-q3/internal/branch_electricity.json",
        gwpStandard: "AR6 (100-year)",
        emissionFactorRegistryVersion: "CEA grid factors 2024 + market-based instruments",
        boundaryAndPeriodNote: "India operational control — all domestic branches FY25.",
        dataQualityRationale: "Primary meter data where smart metering available; estimated proration for legacy branches.",
        activityLineRefs: [
          {
            activityClass: "Purchased electricity — branches",
            inventoryJobId: "job-cat3-electricity",
            coveredTCO2eApprox: 7200000,
            gwpSet: "AR6",
            emissionFactorRegistryVersion: "CEA-2024",
          },
        ],
        regulatoryCrosswalk: [
          { instrument: "BRSR Core", clauseOrSection: "Energy consumption KPI", relevance: "Branch network" },
        ],
        versionHistory: [{ at: isoDaysAgo(20), actor: "Facilities", event: "Submitted to ESG index" }],
        legalRetention: { minRetentionYears: 8, storageTier: "WORM", jurisdictionNote: "RBI record-keeping." },
      },
    },
    {
      id: "BAX-EV-INT-002",
      title: "FY25 business travel — TMC consolidated emissions (Air India / IndiGo)",
      stream: "internal",
      counterpartyKind: "internal",
      counterpartyId: "baxb-travel",
      counterpartyName: "Bharatiya Axis Bank Ltd — Corporate Services",
      sector: "Bank operations — internal",
      submittedAt: isoDaysAgo(15),
      indexedAt: isoDaysAgo(14, 9),
      channel: "Assurance PBC bundle",
      submitterOrg: "Bharatiya Axis Bank Ltd",
      submitterRole: "Corporate Travel Manager",
      scope3CategoryIds: [6],
      linkedControlIds: ["C-BAX-13"],
      disclosureUse: ["Category 6 workbook", "CDP FS — business travel"],
      intendedDataQualityTier: "Primary",
      reviewState: "Under review",
      reviewer: "ESG Analytics",
      reportingPeriodLabel: "FY25",
      assertionSummary: "Defra-aligned factors per segment; 22% YoY uplift flagged in travel policy v2025.03.",
      verificationFocus: "Match PNR list to HR headcount mobility policy; confirm class-of-service uplift.",
      artifacts: [
        {
          fileName: "TMC_emissions_extract_FY25.csv",
          format: "CSV",
          sizeLabel: "2.1 MB",
          sha256Prefix: "travel99aa11",
        },
        {
          fileName: "travel_policy_carbon_budget_FY25.pdf",
          format: "PDF",
          sizeLabel: "890 KB",
          sha256Prefix: "pol22bb33cc",
        },
      ],
      lineageStep: 2,
      drilldown: {
        evidencePackageVersion: "FY25.internal.travel",
        inventoryObjectLockId: "inv-lock-internal-travel",
        calculationEngineJobPath: "s3://baxb-ops-scope3/runs/fy25-q3/internal/travel.json",
        gwpStandard: "AR6 (100-year)",
        emissionFactorRegistryVersion: "DEFRA 2024 + airline-specific RFI",
        boundaryAndPeriodNote: "All domestic and short-haul international employee travel FY25.",
        dataQualityRationale: "Primary TMC data; radiative forcing index applied per bank policy.",
        activityLineRefs: [
          {
            activityClass: "Business travel — air",
            inventoryJobId: "job-cat6-travel",
            coveredTCO2eApprox: 1800000,
            gwpSet: "AR6",
            emissionFactorRegistryVersion: "DEFRA-2024",
          },
        ],
        regulatoryCrosswalk: [{ instrument: "GHG Protocol", clauseOrSection: "Category 6", relevance: "Business travel" }],
        versionHistory: [{ at: isoDaysAgo(15), actor: "Corporate Services", event: "PBC upload" }],
        legalRetention: { minRetentionYears: 7, storageTier: "Standard", jurisdictionNote: "Internal audit trail." },
      },
    },
  ];
}

function buildSectorRollups(records: BankSubmittedDataRecord[], borrowers: BorrowerRow[]): BankSubmittedDataSectorRollup[] {
  const sectorBorrowerCount = new Map<string, number>();
  for (const b of borrowers) sectorBorrowerCount.set(b.sector, (sectorBorrowerCount.get(b.sector) ?? 0) + 1);

  const bySector = new Map<string, BankSubmittedDataSectorRollup>();

  for (const r of records) {
    if (r.stream === "internal") continue;
    const sector = r.stream === "upstream" ? "Bank operations — upstream" : r.sector;
    const cur =
      bySector.get(sector) ??
      ({
        sector,
        upstreamPackages: 0,
        downstreamPackages: 0,
        acceptedPackages: 0,
        openReviewPackages: 0,
        companiesWithSubmission: 0,
        companiesInSector: sectorBorrowerCount.get(sector) ?? 0,
        attributedTCO2eCovered: 0,
      } satisfies BankSubmittedDataSectorRollup);

    if (r.stream === "upstream") cur.upstreamPackages += 1;
    else cur.downstreamPackages += 1;
    if (r.reviewState === "Indexed — accepted") cur.acceptedPackages += 1;
    else if (r.reviewState !== "Superseded by resubmission") cur.openReviewPackages += 1;

    bySector.set(sector, cur);
  }

  const companiesSubmitted = new Map<string, Set<string>>();
  for (const r of records) {
    if (r.stream !== "downstream") continue;
    const set = companiesSubmitted.get(r.sector) ?? new Set();
    set.add(r.counterpartyId);
    companiesSubmitted.set(r.sector, set);
  }

  for (const [sector, rollup] of bySector) {
    rollup.companiesWithSubmission = companiesSubmitted.get(sector)?.size ?? 0;
    rollup.companiesInSector = sectorBorrowerCount.get(sector) ?? rollup.companiesInSector;
    const sectorBorrowers = borrowers.filter((b) => b.sector === sector);
    const submittedIds = companiesSubmitted.get(sector) ?? new Set();
    rollup.attributedTCO2eCovered = sectorBorrowers
      .filter((b) => submittedIds.has(b.id))
      .reduce((s, b) => s + b.attributedTCO2e, 0);
  }

  return Array.from(bySector.values()).sort((a, b) => b.attributedTCO2eCovered - a.attributedTCO2eCovered);
}

export function buildBankSubmittedDataPage(
  borrowers: BorrowerRow[],
  upstreamSuppliers: UpstreamSupplierSeed[],
  _controls: BankControlRegisterRow[],
): BankSubmittedDataPage {
  const downstream = borrowers.flatMap((b, i) => borrowerPackages(b, i));
  const upstream = upstreamPackages(upstreamSuppliers);
  const internal = internalPackages();
  const records = [...downstream, ...upstream, ...internal];

  return {
    records,
    sectorRollups: buildSectorRollups(records, borrowers),
    lineage: LINEAGE,
  };
}

export function upstreamSuppliersFromMock(
  suppliers: { supplier: string; supply: string; category: string; spendCr: number; tco2e: number }[],
): UpstreamSupplierSeed[] {
  return suppliers.map((s, i) => ({
    id: `sup-${i + 1}`,
    name: s.supplier,
    supply: s.supply,
    category: s.category,
    spendCr: s.spendCr,
    tco2e: s.tco2e,
  }));
}
