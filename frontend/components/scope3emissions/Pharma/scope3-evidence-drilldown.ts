import type {
  SubmittedEvidenceArtifact,
  SubmittedEvidenceDrilldown,
  SubmittedEvidenceRecord,
} from "./types";

function artifactEnrichment(a: SubmittedEvidenceArtifact): SubmittedEvidenceArtifact {
  const ext = a.fileName.split(".").pop()?.toLowerCase();
  const virusScan: SubmittedEvidenceArtifact["virusScan"] = ext === "xml" || ext === "csv" ? "Clean" : "Clean";
  let contentSummary = "Binary / structured attachment in governed evidence store.";
  if (ext === "pdf") contentSummary = "Signed or narrative PDF — verify digital signature chain where applicable.";
  if (ext === "xlsx" || ext === "csv") contentSummary = "Structured quantitative attachment — reconcile totals to inventory job outputs.";
  if (ext === "zip") contentSummary = "Bundled attachments — spot-check inner manifest vs. index row.";
  if (ext === "xml") contentSummary = "Machine-readable manifest or configuration — compare hash to deployment artifact.";
  return { ...a, contentSummary, virusScan };
}

function baseDrill(r: SubmittedEvidenceRecord): SubmittedEvidenceDrilldown {
  const cats = r.scope3CategoryIds.join(",");
  return {
    evidencePackageVersion: "idx-2025.11.2",
    inventoryObjectLockId: "FY25-SCOPE3-OBJ-LOCK-2025-11-20",
    calculationEngineJobPath: `/lakehouse/gold/scope3/evidence_packages/${r.id.replace(/-/g, "_").toLowerCase()}`,
    gwpStandard: "IPCC AR6 (100-year GWP)",
    emissionFactorRegistryVersion: "EF-registry-v2025.09",
    boundaryAndPeriodNote: `${r.reportingPeriodLabel}: indexed under Sun Pharma Research Ltd operational control boundary (see EV-2025-0301). Categories touched: ${cats}.`,
    dataQualityRationale: `Submitter asserts "${r.intendedDataQualityTier}" tier under the GHG Protocol Scope 3 data-quality hierarchy. Reviewer confirms: (1) source matches activity class, (2) EF/GWP versions match lock, (3) no double counting vs. upstream supplier invoices already in Cat. 1.`,
    activityLineRefs: r.scope3CategoryIds.slice(0, 3).map((cid, i) => ({
      activityClass: `SCOPE3-CAT${cid}-PURCHASED_GOODS-${r.id.slice(-4)}`,
      inventoryJobId: `calc-fy25-cat${cid}-run${String(i + 1).padStart(2, "0")}`,
      coveredTCO2eApprox: cid === 1 ? 42000 + i * 8000 : cid === 4 ? 12000 + i * 4000 : undefined,
      gwpSet: "IPCC AR6 (100-year GWP)",
      emissionFactorRegistryVersion: "EF-registry-v2025.09",
    })),
    regulatoryCrosswalk: [
      {
        instrument: "SEBI BRSR Core",
        clauseOrSection: "Principle 6 — Energy & emissions (Scope 3)",
        relevance: "Supports BRSR narrative where category is material and evidence is cited in assurance annex.",
      },
      {
        instrument: "GHG Protocol — Corporate Value Chain (Scope 3)",
        clauseOrSection: "Ch. 7 — Requirements for GHG information",
        relevance: "Data quality, transparency, and documentation expectations for inventory assurance.",
      },
    ],
    versionHistory: [
      { at: r.submittedAt, actor: r.submitterOrg, event: "Original submission timestamp (source system)" },
      { at: r.indexedAt, actor: "Evidence index service", event: "SHA-256 manifest row written; object ACL set to audit-read" },
    ],
    legalRetention: {
      minRetentionYears: 8,
      storageTier: "IN-MUM-1 / encrypted object + WORM snapshot (yearly)",
      jurisdictionNote: "India-listed entity — SEBI LODR + Companies Act 2013 preservation; tax assessment overlap per finance policy TR-11.",
    },
  };
}

function drillFor(r: SubmittedEvidenceRecord): SubmittedEvidenceDrilldown {
  const b = baseDrill(r);
  switch (r.id) {
    case "EV-2025-0142":
      return {
        ...b,
        evidencePackageVersion: "idx-2025.11.2+pcf-api",
        samplingPlan: {
          populationDescription: "All FY25 purchase order lines for paracetamol API (grade USP) from APIchem Dahej site",
          sampleSizeRule: "MUS: 22 PO lines stratified by quarter + 100% of top 5 by spend",
          materialityNote: "Combined sampled lines represent ~61% of Cat. 1 APIchem tCO₂e in workbook v3.4.",
        },
        activityLineRefs: [
          {
            activityClass: "CAT1-RAW_MATERIAL-API-PARACETAMOL",
            inventoryJobId: "calc-fy25-cat1-api-014",
            coveredTCO2eApprox: 118200,
            gwpSet: "IPCC AR6 (100-year GWP)",
            emissionFactorRegistryVersion: "supplier-specific-PCF-v4.2",
          },
          {
            activityClass: "CAT2-CAPITAL_GOODS-PLANT_EXPANSION",
            inventoryJobId: "calc-fy25-cat2-capex-003",
            coveredTCO2eApprox: 8200,
            gwpSet: "IPCC AR6 (100-year GWP)",
            emissionFactorRegistryVersion: "EEIO-IND-2024-v2",
          },
        ],
        attestations: [
          {
            signerName: "Dr. Meera Krishnan",
            signerTitle: "VP Quality & ESG, APIchem India Pvt Ltd",
            signedAt: "2025-10-27",
            scopeStatement:
              "I attest that the PCF model boundaries match supplied mass and energy data for FY25 through 2025-09-30 and that renewable electricity certificates are unretired elsewhere.",
          },
        ],
        technicalContact: {
          name: "Rahul Menon",
          email: "esg.data@apichem.example.com",
          phone: "+91-22-555-0142",
        },
        linkedAiInsightIds: ["ai-1"],
        relatedComplianceAlertIds: ["ca2"],
      };
    case "EV-2025-0160":
      return {
        ...b,
        clarificationsRaised: [
          "Provide lot-level chain-of-custody for recycled PP lots covering PO PW-2025-1180–1194 (weeks 40–44).",
          "Confirm certificate scope table lists blister-grade resin SKU codes explicitly.",
        ],
        samplingPlan: {
          populationDescription: "All PP resin receipts tagged ISCC in FY25 Q3",
          sampleSizeRule: "Random sample n=14 from 118 lots; expand if any lot fails trace",
          materialityNote: "PackWell represents ~4.2% of Cat. 1 packaging mass; uncertainty drives BRSR plastics narrative.",
        },
        linkedAiInsightIds: ["ai-1"],
        technicalContact: { name: "Neha Desai", email: "sustainability@packwell.example.com" },
      };
    case "EV-2025-0098":
      return {
        ...b,
        activityLineRefs: [
          {
            activityClass: "CAT4-UPSTREAM_LOGISTICS-TKM",
            inventoryJobId: "calc-fy25-cat4-bdart-01",
            coveredTCO2eApprox: 61200,
            gwpSet: "IPCC AR6 (100-year GWP)",
            emissionFactorRegistryVersion: "GLEC-2024-conversion-v1",
          },
          {
            activityClass: "CAT9-DOWNSTREAM-DISTRIBUTION",
            inventoryJobId: "calc-fy25-cat9-dd-02",
            coveredTCO2eApprox: 21400,
            gwpSet: "IPCC AR6 (100-year GWP)",
            emissionFactorRegistryVersion: "supplier-primary-v3",
          },
        ],
        regulatoryCrosswalk: [
          ...b.regulatoryCrosswalk,
          {
            instrument: "CDP — Transportation",
            clauseOrSection: "C8.2 / logistics emissions",
            relevance: "Primary logistics factors and QA trail for downstream reporting.",
          },
        ],
        technicalContact: { name: "Karan Bose", email: "greenfreight@bluedart.example.com", phone: "+91-80-555-2200" },
      };
    case "EV-2025-0211":
      return {
        ...b,
        clarificationsRaised: [
          "Attach telematics coverage map vs. claimed primary km %.",
          "Provide driver training completion IDs referenced in S3-C-06 remediation tracker.",
        ],
        relatedComplianceAlertIds: ["ca4", "ca5"],
        linkedAiInsightIds: ["ai-2"],
        samplingPlan: {
          populationDescription: "October 2025 hazmat FTL trips with SunPharma waybill prefix SP-HZ",
          sampleSizeRule: "All trips > 500 km + random 10% of shorter hauls",
          materialityNote: "ChemLogistics carries ~9% of Cat. 4 inventory mass; deficiency on S3-C-04 flagged in controls.",
        },
      };
    case "EV-2025-0188":
      return {
        ...b,
        relatedExportConsignmentIds: ["cb1"],
        linkedAiInsightIds: ["ai-1"],
        relatedComplianceAlertIds: ["ca1", "ca5"],
        attestations: [
          {
            signerName: "Priya Nair",
            signerTitle: "Export Compliance Manager, SealFlex Export Packaging Pvt Ltd",
            signedAt: "2025-10-29",
            scopeStatement:
              "I attest that laminate masses and EF selections match physical shipment IN-API-0328 and that the embedded emissions workbook was prepared using the DGFT pilot template v3.",
          },
        ],
        samplingPlan: {
          populationDescription: "Single consignment batch IN-API-0328 (full enumeration)",
          sampleSizeRule: "N/A — 100% shipment-level pack",
          materialityNote: "Pilot disclosure cell; tied to Trade Compliance sign-off queue.",
        },
      };
    case "EV-2024-0990":
      return {
        ...b,
        supersededByEvidenceId: "EV-2025-0301",
        versionHistory: [
          ...b.versionHistory,
          { at: "2025-05-19T14:00:00+05:30", actor: "Head of Sustainability", event: "Superseded — organisational boundary JV update" },
        ],
      };
    case "EV-2025-0301":
      return {
        ...b,
        supersedesEvidenceId: "EV-2024-0990",
        attestations: [
          {
            signerName: "Board ESG Committee (delegated)",
            signerTitle: "Chair — Risk & Reputation",
            signedAt: "2025-05-18",
            scopeStatement:
              "Committee confirms operational control assessment for downstream logistics JV and category materiality refresh for FY25 inventory lock.",
          },
        ],
      };
    case "EV-2025-0224":
      return {
        ...b,
        clarificationsRaised: [
          "External LCA peer review letter required before elevating from secondary to primary tier.",
          "Clarify EO emission factor uncertainty bands used in draft model sheet tab EO-ASSUMP.",
        ],
        linkedAiInsightIds: ["ai-3"],
      };
    case "EV-2025-0354":
      return {
        ...b,
        relatedComplianceAlertIds: ["ca7"],
        samplingPlan: {
          populationDescription: "All maize starch PO lines to AgriFeed FY25",
          sampleSizeRule: "100% FLAG questionnaire + risk screen for top 80% by spend",
          materialityNote: "Aligns to SBTi FLAG annex and executive alert ca7.",
        },
      };
    default:
      return b;
  }
}

export function mergeSubmittedEvidencesDeep(rows: SubmittedEvidenceRecord[]): SubmittedEvidenceRecord[] {
  return rows.map((r) => ({
    ...r,
    drilldown: drillFor(r),
    artifacts: r.artifacts.map(artifactEnrichment),
  }));
}
