// ============================================================================
// mockData.js
// High-fidelity mock dataset — AI-Driven Risk & Compliance Platform (MVP)
// Profile: Mid-sized US bank (~$10B–$50B assets) | OCC/Fed/FDIC regulated
// Window: 13 weeks ending 2026-04-25
// ============================================================================

const mockData = (() => {

  // ──────────────────────────────────────────────────────────────────────────
  // Deterministic PRNG (mulberry32) — reproducible demos
  // ──────────────────────────────────────────────────────────────────────────
  const seeded = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const rng = seeded(20260425);
  const rand = () => rng();
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const ibetween = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const fbetween = (a, b) => a + rand() * (b - a);

  // ──────────────────────────────────────────────────────────────────────────
  // Time helpers — 13-week window ending Saturday 2026-04-25
  // weeksAgo: 0 = current week, 12 = oldest week
  // ──────────────────────────────────────────────────────────────────────────
  const ANCHOR = new Date('2026-04-25T18:00:00Z');
  const DAY_MS = 86400000;
  const isoAt = (weeksAgo, dayInWeek = 0, hour = null, min = null) => {
    const d = new Date(ANCHOR.getTime() - weeksAgo * 7 * DAY_MS - dayInWeek * DAY_MS);
    d.setUTCHours(hour ?? ibetween(7, 19), min ?? ibetween(0, 59), ibetween(0, 59), 0);
    return d.toISOString();
  };
  const dateOnly = (weeksAgo, dayInWeek = 0) =>
    new Date(ANCHOR.getTime() - weeksAgo * 7 * DAY_MS - dayInWeek * DAY_MS)
      .toISOString().slice(0, 10);
  const pad = (n, w = 6) => String(n).padStart(w, '0');
  const uuid = (prefix, n) => `${prefix}-${pad(n)}`;
  const sha256ish = () => Array.from({ length: 8 }, () =>
    Math.floor(rand() * 0xffffffff).toString(16).padStart(8, '0')).join('');

  // ──────────────────────────────────────────────────────────────────────────
  // Lookup constants
  // ──────────────────────────────────────────────────────────────────────────
  const SOURCE_SYSTEMS_BY_PROCESS = {
    'PROC-WP':  ['payment_hub', 'swift_gateway', 'screening_engine', 'recon_tool'],
    'PROC-CO':  ['crm', 'idv_vendor', 'screening_engine', 'doc_mgmt', 'core_banking'],
    'PROC-AML': ['case_mgmt', 'aml_engine', 'doc_mgmt', 'sar_filing_system'],
    'PROC-VO':  ['vendor_portal', 'contract_mgmt', 'doc_mgmt'],
    'PROC-MV':  ['mrm_repo', 'model_inventory', 'doc_mgmt'],
    'PROC-LO':  ['lms', 'core_banking', 'doc_mgmt', 'appraisal_vendor']
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Risks (10)
  // ──────────────────────────────────────────────────────────────────────────
  const risks = [
    {
      id: 'R-FC-AML',
      name: 'AML Alert Disposition & SAR Filing Risk',
      description: 'Risk that AML alerts are not investigated and dispositioned within regulatory timelines, resulting in late or missed SAR filings and BSA program weaknesses identified during examination.',
      domain: 'financial_crime',
      inherentRating: 'high',
      residualRating: 'high',
      exposureScore: 78,
      trend: 'worsening',
      ownerRole: 'BSA Officer',
      jurisdictions: ['us'],
      linkedControlIds: ['AML-C001', 'AML-C002', 'AML-C003', 'AML-C004', 'AML-C005', 'AML-C006'],
      linkedKriIds: ['KRI-FC-016', 'KRI-FC-017', 'KRI-FC-018', 'KRI-FC-019'],
      linkedAppetiteMetricIds: ['APP-FC-002', 'APP-FC-003']
    },
    {
      id: 'R-FC-OFAC',
      name: 'OFAC Sanctions Screening Failure Risk',
      description: 'Risk of processing payments or onboarding customers in violation of OFAC sanctions, exposing the bank to strict-liability enforcement and significant penalties.',
      domain: 'financial_crime',
      inherentRating: 'high',
      residualRating: 'medium',
      exposureScore: 52,
      trend: 'stable',
      ownerRole: 'Head of Sanctions Compliance',
      jurisdictions: ['us'],
      linkedControlIds: ['WP-C002', 'CO-C005', 'WP-C008'],
      linkedKriIds: ['KRI-FC-001', 'KRI-FC-002', 'KRI-FC-005', 'KRI-FC-010'],
      linkedAppetiteMetricIds: ['APP-FC-001']
    },
    {
      id: 'R-FC-FRAUD',
      name: 'Wire Fraud & Authorised Push Payment Loss Risk',
      description: 'Risk of customer or business email compromise leading to fraudulent wire transfers and direct financial loss.',
      domain: 'financial_crime',
      inherentRating: 'high',
      residualRating: 'medium',
      exposureScore: 58,
      trend: 'worsening',
      ownerRole: 'Head of Fraud Operations',
      jurisdictions: ['us'],
      linkedControlIds: ['WP-C003', 'WP-C005'],
      linkedKriIds: ['KRI-FC-003', 'KRI-FC-004'],
      linkedAppetiteMetricIds: ['APP-FC-004']
    },
    {
      id: 'R-FC-KYC',
      name: 'KYC / CDD Inadequacy Risk',
      description: 'Risk that customer due diligence at onboarding and on refresh is insufficient to support ongoing AML monitoring and EDD obligations.',
      domain: 'financial_crime',
      inherentRating: 'medium',
      residualRating: 'medium',
      exposureScore: 48,
      trend: 'stable',
      ownerRole: 'Head of Financial Crime Compliance',
      jurisdictions: ['us'],
      linkedControlIds: ['CO-C001', 'CO-C002', 'CO-C003', 'CO-C004'],
      linkedKriIds: ['KRI-FC-006', 'KRI-FC-007', 'KRI-FC-009'],
      linkedAppetiteMetricIds: []
    },
    {
      id: 'R-OP-WIRE',
      name: 'Wire Payment Operational Loss Risk',
      description: 'Risk of operational error, unauthorised release, or SoD breach in wire payment processing leading to financial loss or regulatory finding.',
      domain: 'operational',
      inherentRating: 'high',
      residualRating: 'medium',
      exposureScore: 45,
      trend: 'stable',
      ownerRole: 'Head of Payment Operations',
      jurisdictions: ['us'],
      linkedControlIds: ['WP-C001', 'WP-C004', 'WP-C007', 'WP-C009'],
      linkedKriIds: ['KRI-OP-001', 'KRI-OP-002', 'KRI-OP-003', 'KRI-OP-005'],
      linkedAppetiteMetricIds: ['APP-OP-001']
    },
    {
      id: 'R-OP-RECON',
      name: 'Reconciliation Break Risk',
      description: 'Risk of unresolved nostro and GL reconciliation breaks aging beyond tolerance, indicating upstream data quality issues and potential settlement loss.',
      domain: 'operational',
      inherentRating: 'medium',
      residualRating: 'medium',
      exposureScore: 51,
      trend: 'worsening',
      ownerRole: 'Head of Reconciliation Operations',
      jurisdictions: ['us'],
      linkedControlIds: ['WP-C006'],
      linkedKriIds: ['KRI-OP-004'],
      linkedAppetiteMetricIds: ['APP-OP-002']
    },
    {
      id: 'R-MR-VAL',
      name: 'Model Risk — Validation Coverage & Effectiveness',
      description: 'Risk that models in production lack current independent validation evidence, exposing the bank to SR 11-7 findings and reliance on unsound models.',
      domain: 'model',
      inherentRating: 'high',
      residualRating: 'high',
      exposureScore: 72,
      trend: 'worsening',
      ownerRole: 'Head of Model Risk Management',
      jurisdictions: ['us'],
      linkedControlIds: ['MV-C001', 'MV-C002', 'MV-C003', 'MV-C004'],
      linkedKriIds: ['KRI-MR-009', 'KRI-MR-010'],
      linkedAppetiteMetricIds: ['APP-MR-001', 'APP-MR-002']
    },
    {
      id: 'R-MR-AML',
      name: 'AML Model Performance Risk',
      description: 'Risk that AML transaction monitoring scenarios produce excessive false positives or fail to detect typologies, undermining program effectiveness.',
      domain: 'model',
      inherentRating: 'high',
      residualRating: 'medium',
      exposureScore: 56,
      trend: 'worsening',
      ownerRole: 'Head of Model Risk Management',
      jurisdictions: ['us'],
      linkedControlIds: ['MV-C002', 'AML-C001'],
      linkedKriIds: ['KRI-MR-002', 'KRI-MR-006'],
      linkedAppetiteMetricIds: []
    },
    {
      id: 'R-CC-FAIR',
      name: 'Fair Lending & Pricing Disparity Risk',
      description: 'Risk that lending pricing exceptions or underwriting decisions produce disparate impact on protected classes, triggering ECOA/Fair Housing exposure.',
      domain: 'compliance_conduct',
      inherentRating: 'high',
      residualRating: 'medium',
      exposureScore: 49,
      trend: 'stable',
      ownerRole: 'Head of Fair Lending',
      jurisdictions: ['us'],
      linkedControlIds: ['LO-C002', 'LO-C004'],
      linkedKriIds: ['KRI-CC-004'],
      linkedAppetiteMetricIds: ['APP-CC-001']
    },
    {
      id: 'R-TP-VEN',
      name: 'Third-Party / Vendor Concentration & Resilience Risk',
      description: 'Risk that critical third parties fail to meet operational, security, or resilience expectations, with insufficient bank visibility into 4th-party concentration.',
      domain: 'third_party',
      inherentRating: 'high',
      residualRating: 'medium',
      exposureScore: 54,
      trend: 'worsening',
      ownerRole: 'Head of Vendor Management',
      jurisdictions: ['us'],
      linkedControlIds: ['VO-C001', 'VO-C002', 'VO-C003', 'VO-C005'],
      linkedKriIds: ['KRI-TP-003', 'KRI-TP-006'],
      linkedAppetiteMetricIds: ['APP-TP-001']
    }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Regulations (8)
  // ──────────────────────────────────────────────────────────────────────────
  const regulations = [
    { id: 'REG-BSA',           title: 'Bank Secrecy Act / 31 USC §5311 et seq.',                          regulator: 'FinCEN/OCC',  jurisdiction: 'us', effectiveDate: '1970-10-26', version: 24, sourceUrl: 'https://www.fincen.gov/resources/statutes-regulations/bank-secrecy-act' },
    { id: 'REG-OFAC',          title: 'OFAC Regulations / 31 CFR Chapter V',                              regulator: 'OFAC',        jurisdiction: 'us', effectiveDate: '1995-01-01', version: 18, sourceUrl: 'https://ofac.treasury.gov/' },
    { id: 'REG-OCC-TPRM-2023', title: 'OCC Bulletin 2023-17 — Interagency Third-Party Risk Management',   regulator: 'OCC',         jurisdiction: 'us', effectiveDate: '2023-06-09', version: 1,  sourceUrl: 'https://www.occ.gov/news-issuances/bulletins/2023/bulletin-2023-17.html' },
    { id: 'REG-SR-11-7',       title: 'FRB SR 11-7 / OCC 2011-12 — Model Risk Management',                regulator: 'FRB/OCC',     jurisdiction: 'us', effectiveDate: '2011-04-04', version: 3,  sourceUrl: 'https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm' },
    { id: 'REG-FFIEC-BSA',     title: 'FFIEC BSA/AML Examination Manual',                                 regulator: 'FFIEC',       jurisdiction: 'us', effectiveDate: '2014-12-02', version: 12, sourceUrl: 'https://bsaaml.ffiec.gov/manual' },
    { id: 'REG-REG-E',         title: 'Regulation E / 12 CFR 1005 — Electronic Fund Transfers',           regulator: 'CFPB',        jurisdiction: 'us', effectiveDate: '1979-03-30', version: 14, sourceUrl: 'https://www.consumerfinance.gov/' },
    { id: 'REG-ECOA',          title: 'Equal Credit Opportunity Act / Reg B / 12 CFR 1002',               regulator: 'CFPB',        jurisdiction: 'us', effectiveDate: '1974-10-28', version: 16, sourceUrl: 'https://www.consumerfinance.gov/' },
    { id: 'REG-HMDA',          title: 'Home Mortgage Disclosure Act / Reg C / 12 CFR 1003',               regulator: 'CFPB',        jurisdiction: 'us', effectiveDate: '1975-12-31', version: 11, sourceUrl: 'https://www.consumerfinance.gov/' }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Obligations (20) — incl. one thinly covered (OBL-OCC-2023-17-005)
  // ──────────────────────────────────────────────────────────────────────────
  const obligations = [
    { id: 'OBL-BSA-001',           regulationId: 'REG-BSA',           citation: '31 USC §5318(h)',           requirementText: 'Maintain a written BSA/AML compliance program with internal controls, independent testing, designated officer, training, and CDD.', interpretiveStyle: 'rules_based',     evidenceExpectation: 'Board-approved program document, independent test reports, training records, CDD policy.', jurisdiction: 'us', linkedControlIds: ['AML-C001','CO-C001'],                          coverageStatus: 'fully_covered',   coverageScore: 88, effectiveFrom: '1970-10-26', effectiveTo: null, version: 24 },
    { id: 'OBL-BSA-002',           regulationId: 'REG-BSA',           citation: '31 CFR §1020.320',          requirementText: 'File Suspicious Activity Reports within 30 days of initial detection of facts giving rise to suspicion (60 days if no suspect identified).', interpretiveStyle: 'rules_based', evidenceExpectation: 'SAR filing record with timestamp, investigation memo, decision rationale, supervisory approval.', jurisdiction: 'us', linkedControlIds: ['AML-C004','AML-C005'],                          coverageStatus: 'fully_covered',   coverageScore: 82, effectiveFrom: '1996-04-01', effectiveTo: null, version: 8  },
    { id: 'OBL-BSA-003',           regulationId: 'REG-BSA',           citation: '31 CFR §1010.230',          requirementText: 'Identify and verify the beneficial owners of legal entity customers at account opening.', interpretiveStyle: 'rules_based',     evidenceExpectation: 'UBO certification form, identity verification evidence, refresh on trigger events.', jurisdiction: 'us', linkedControlIds: ['CO-C002'],                                       coverageStatus: 'fully_covered',   coverageScore: 79, effectiveFrom: '2018-05-11', effectiveTo: null, version: 3  },
    { id: 'OBL-OFAC-001',          regulationId: 'REG-OFAC',          citation: '31 CFR Chapter V',          requirementText: 'Block or reject transactions involving sanctioned parties; screen against the SDN list and applicable sectoral sanctions.', interpretiveStyle: 'rules_based',     evidenceExpectation: 'Screening event log per transaction, hit disposition, blocked-property records.', jurisdiction: 'us', linkedControlIds: ['WP-C002','CO-C005','WP-C008'],                  coverageStatus: 'fully_covered',   coverageScore: 91, effectiveFrom: '1995-01-01', effectiveTo: null, version: 18 },
    { id: 'OBL-OFAC-003',          regulationId: 'REG-OFAC',          citation: '31 CFR §501.603',           requirementText: 'Report blocked or rejected transactions to OFAC within 10 business days; submit annual filing.', interpretiveStyle: 'rules_based', evidenceExpectation: 'OFAC filing receipt, blocked property workpaper, annual report submission proof.', jurisdiction: 'us', linkedControlIds: ['WP-C008'],                                      coverageStatus: 'thinly_covered',  coverageScore: 68, effectiveFrom: '2003-06-01', effectiveTo: null, version: 5  },
    { id: 'OBL-OCC-2023-17-001',   regulationId: 'REG-OCC-TPRM-2023', citation: 'OCC Bulletin 2023-17 §III', requirementText: 'Perform risk-based due diligence prior to engaging a third party, commensurate with the nature, scope, and risk of the relationship.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Due diligence package, tier rationale, risk assessment, sign-off by accountable owner.', jurisdiction: 'us', linkedControlIds: ['VO-C001','VO-C002'],                            coverageStatus: 'fully_covered',   coverageScore: 84, effectiveFrom: '2023-06-09', effectiveTo: null, version: 1  },
    { id: 'OBL-OCC-2023-17-003',   regulationId: 'REG-OCC-TPRM-2023', citation: 'OCC Bulletin 2023-17 §IV',  requirementText: 'Assess information security and review independent assurance reports (e.g., SOC 2 Type II) on a defined cycle.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Current SOC report on file, gap analysis, remediation tracking, evidence of contractual InfoSec obligations.', jurisdiction: 'us', linkedControlIds: ['VO-C003'],                                       coverageStatus: 'fully_covered',   coverageScore: 76, effectiveFrom: '2023-06-09', effectiveTo: null, version: 1  },
    { id: 'OBL-OCC-2023-17-005',   regulationId: 'REG-OCC-TPRM-2023', citation: 'OCC Bulletin 2023-17 §V',   requirementText: 'Identify and assess material subcontractor (4th-party) relationships used by critical third parties to deliver services.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Disclosed 4th-party inventory per critical vendor, risk assessment of concentration, contractual disclosure obligation.', jurisdiction: 'us', linkedControlIds: ['VO-C005'],                                       coverageStatus: 'thinly_covered',  coverageScore: 42, effectiveFrom: '2023-06-09', effectiveTo: null, version: 1  },
    { id: 'OBL-SR-11-7-001',       regulationId: 'REG-SR-11-7',       citation: 'SR 11-7 §III',              requirementText: 'Maintain a complete model inventory and documented model risk management framework.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Model inventory record per model, MRM policy, evidence of inventory completeness reviews.', jurisdiction: 'us', linkedControlIds: ['MV-C001'],                                       coverageStatus: 'fully_covered',   coverageScore: 78, effectiveFrom: '2011-04-04', effectiveTo: null, version: 3  },
    { id: 'OBL-SR-11-7-002',       regulationId: 'REG-SR-11-7',       citation: 'SR 11-7 §V',                requirementText: 'Independently validate models pre-deployment and on a defined cycle, including outcomes analysis and benchmarking.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Validation report per model with outcomes analysis, benchmarking, conceptual soundness.', jurisdiction: 'us', linkedControlIds: ['MV-C002','MV-C003'],                            coverageStatus: 'thinly_covered',  coverageScore: 61, effectiveFrom: '2011-04-04', effectiveTo: null, version: 3  },
    { id: 'OBL-SR-11-7-003',       regulationId: 'REG-SR-11-7',       citation: 'SR 11-7 §VI',               requirementText: 'Validators must be independent of model developers and owners.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Independence attestation, validator role/reporting line, conflict-of-interest declaration.', jurisdiction: 'us', linkedControlIds: ['MV-C004'],                                       coverageStatus: 'fully_covered',   coverageScore: 81, effectiveFrom: '2011-04-04', effectiveTo: null, version: 3  },
    { id: 'OBL-FFIEC-BSA-001',     regulationId: 'REG-FFIEC-BSA',     citation: 'FFIEC BSA Manual — CDD',    requirementText: 'Maintain a documented customer risk profile and ongoing customer due diligence, including periodic refresh.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Customer risk profile in CRM, refresh trigger log, EDD evidence for higher-risk customers.', jurisdiction: 'us', linkedControlIds: ['CO-C003','CO-C004'],                            coverageStatus: 'fully_covered',   coverageScore: 80, effectiveFrom: '2014-12-02', effectiveTo: null, version: 12 },
    { id: 'OBL-FFIEC-BSA-006',     regulationId: 'REG-FFIEC-BSA',     citation: 'FFIEC BSA Manual — Susp.',  requirementText: 'Maintain risk-based suspicious activity monitoring covering products, services, customers, and geographies.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Scenario coverage map, alert volumes, disposition statistics, SAR conversion analysis.', jurisdiction: 'us', linkedControlIds: ['AML-C001','AML-C002'],                          coverageStatus: 'fully_covered',   coverageScore: 74, effectiveFrom: '2014-12-02', effectiveTo: null, version: 12 },
    { id: 'OBL-FFIEC-BSA-008',     regulationId: 'REG-FFIEC-BSA',     citation: 'FFIEC BSA Manual — Inv.',   requirementText: 'Document investigation, decision, and rationale for each AML alert, with supervisory review where required.', interpretiveStyle: 'rules_based', evidenceExpectation: 'Investigation memo with timestamps, supervisor sign-off, evidence package linked to case.', jurisdiction: 'us', linkedControlIds: ['AML-C003','AML-C006'],                          coverageStatus: 'thinly_covered',  coverageScore: 65, effectiveFrom: '2014-12-02', effectiveTo: null, version: 12 },
    { id: 'OBL-WIRE-DUAL-001',     regulationId: 'REG-OCC-TPRM-2023', citation: 'FFIEC IT Handbook — WPS',   requirementText: 'Implement segregation of duties and dual control over wire transfer authorisation and release.', interpretiveStyle: 'rules_based', evidenceExpectation: 'Maker-checker log per wire, role separation evidence, override exception register.', jurisdiction: 'us', linkedControlIds: ['WP-C001','WP-C004'],                            coverageStatus: 'fully_covered',   coverageScore: 92, effectiveFrom: '2010-01-01', effectiveTo: null, version: 4  },
    { id: 'OBL-WIRE-CALLBACK-001', regulationId: 'REG-OCC-TPRM-2023', citation: 'FFIEC Auth Guidance 2021',  requirementText: 'Apply layered security controls including out-of-band verification for higher-risk wire transactions.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Callback recording or attestation with timestamp and verified phone number; exception register.', jurisdiction: 'us', linkedControlIds: ['WP-C003'],                                       coverageStatus: 'fully_covered',   coverageScore: 71, effectiveFrom: '2021-08-11', effectiveTo: null, version: 1  },
    { id: 'OBL-RECON-001',         regulationId: 'REG-OCC-TPRM-2023', citation: "OCC Comptroller's Hbk",    requirementText: 'Perform timely reconciliation of nostro and GL accounts with documented evidence and aging escalation.', interpretiveStyle: 'principles_based', evidenceExpectation: 'Recon workpaper per cycle, aged-break inventory, escalation log, signed-off variance explanation.', jurisdiction: 'us', linkedControlIds: ['WP-C006'],                                      coverageStatus: 'fully_covered',   coverageScore: 73, effectiveFrom: '2008-01-01', effectiveTo: null, version: 6  },
    { id: 'OBL-ECOA-001',          regulationId: 'REG-ECOA',          citation: '12 CFR 1002.4',             requirementText: 'Prohibit discrimination on prohibited bases in any aspect of a credit transaction.', interpretiveStyle: 'rules_based',     evidenceExpectation: 'Pricing exception logs with rationale, fair-lending review packs, statistical disparity testing.', jurisdiction: 'us', linkedControlIds: ['LO-C002','LO-C004'],                            coverageStatus: 'fully_covered',   coverageScore: 77, effectiveFrom: '1974-10-28', effectiveTo: null, version: 16 },
    { id: 'OBL-ECOA-002',          regulationId: 'REG-ECOA',          citation: '12 CFR 1002.9',             requirementText: 'Provide adverse action notice within 30 days of credit decision when application is denied or terminated.', interpretiveStyle: 'rules_based', evidenceExpectation: 'AAN copy on file, mailing/transmission log, decision date linkage.', jurisdiction: 'us', linkedControlIds: ['LO-C003'],                                       coverageStatus: 'fully_covered',   coverageScore: 86, effectiveFrom: '1974-10-28', effectiveTo: null, version: 16 },
    { id: 'OBL-HMDA-001',          regulationId: 'REG-HMDA',          citation: '12 CFR 1003',               requirementText: 'Collect and report HMDA data points accurately and on time at the loan-application register level.', interpretiveStyle: 'rules_based',     evidenceExpectation: 'LAR file, validation reports, regulator submission receipt, error rate documentation.', jurisdiction: 'us', linkedControlIds: ['LO-C005'],                                       coverageStatus: 'fully_covered',   coverageScore: 70, effectiveFrom: '1975-12-31', effectiveTo: null, version: 11 }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Processes (6) and ProcessSteps
  // ──────────────────────────────────────────────────────────────────────────
  const processes = [
    { id: 'PROC-WP',  name: 'Wire Payments',         description: 'End-to-end domestic and cross-border wire payment lifecycle from instruction through screening, authorisation, release, and reconciliation.', ownerRole: 'Head of Payment Operations',         jurisdictions: ['us'], controlIds: ['WP-C001','WP-C002','WP-C003','WP-C004','WP-C005','WP-C006','WP-C007','WP-C008','WP-C009'],          stepIds: ['STEP-WP-01','STEP-WP-02','STEP-WP-03','STEP-WP-04','STEP-WP-05','STEP-WP-06','STEP-WP-07'], documentedVariantSignature: 'wp-canonical-v3',  variantDriftScore: 18 },
    { id: 'PROC-CO',  name: 'Customer Onboarding',   description: 'Retail and legal-entity onboarding with CIP/CDD, beneficial owner identification, sanctions screening, and account activation.',                ownerRole: 'Head of Onboarding Operations',      jurisdictions: ['us'], controlIds: ['CO-C001','CO-C002','CO-C003','CO-C004','CO-C005','CO-C006'],                                          stepIds: ['STEP-CO-01','STEP-CO-02','STEP-CO-03','STEP-CO-04','STEP-CO-05'],                          documentedVariantSignature: 'co-canonical-v2',  variantDriftScore: 22 },
    { id: 'PROC-AML', name: 'AML Alert Disposition', description: 'Triage, investigation, and disposition of suspicious-activity alerts with supervisory review and SAR decisioning.',                              ownerRole: 'Head of AML Investigations',         jurisdictions: ['us'], controlIds: ['AML-C001','AML-C002','AML-C003','AML-C004','AML-C005','AML-C006'],                                  stepIds: ['STEP-AML-01','STEP-AML-02','STEP-AML-03','STEP-AML-04','STEP-AML-05'],                     documentedVariantSignature: 'aml-canonical-v2', variantDriftScore: 41 },
    { id: 'PROC-VO',  name: 'Vendor Onboarding',     description: 'Tiered third-party onboarding including due diligence, contracting, InfoSec assessment, and 4th-party disclosure.',                              ownerRole: 'Head of Vendor Management',          jurisdictions: ['us'], controlIds: ['VO-C001','VO-C002','VO-C003','VO-C004','VO-C005'],                                                  stepIds: ['STEP-VO-01','STEP-VO-02','STEP-VO-03','STEP-VO-04'],                                       documentedVariantSignature: 'vo-canonical-v1',  variantDriftScore: 14 },
    { id: 'PROC-MV',  name: 'Model Validation',      description: 'Model lifecycle including inventory, validation, re-validation, and outcomes analysis for SR 11-7 alignment.',                                    ownerRole: 'Head of Model Risk Management',      jurisdictions: ['us'], controlIds: ['MV-C001','MV-C002','MV-C003','MV-C004'],                                                            stepIds: ['STEP-MV-01','STEP-MV-02','STEP-MV-03'],                                                    documentedVariantSignature: 'mv-canonical-v1',  variantDriftScore: 28 },
    { id: 'PROC-LO',  name: 'Loan Origination',      description: 'Mortgage and commercial loan origination from application through underwriting, pricing, decisioning, and HMDA reporting.',                       ownerRole: 'Head of Mortgage Operations',        jurisdictions: ['us'], controlIds: ['LO-C001','LO-C002','LO-C003','LO-C004','LO-C005'],                                                  stepIds: ['STEP-LO-01','STEP-LO-02','STEP-LO-03','STEP-LO-04','STEP-LO-05'],                          documentedVariantSignature: 'lo-canonical-v2',  variantDriftScore: 19 }
  ];

  const processSteps = [
    // Wire Payments
    { id: 'STEP-WP-01', processId: 'PROC-WP', stepOrder: 1, name: 'Instruction Capture',           stepType: 'system',     expectedActorRole: 'Front Office RM',         expectedSystem: 'payment_hub' },
    { id: 'STEP-WP-02', processId: 'PROC-WP', stepOrder: 2, name: 'Sanctions & Fraud Screening',   stepType: 'system',     expectedActorRole: 'system',                  expectedSystem: 'screening_engine' },
    { id: 'STEP-WP-03', processId: 'PROC-WP', stepOrder: 3, name: 'Beneficiary Callback',          stepType: 'judgemental', expectedActorRole: 'Wire Ops',                expectedSystem: 'payment_hub' },
    { id: 'STEP-WP-04', processId: 'PROC-WP', stepOrder: 4, name: 'Maker-Checker Authorisation',   stepType: 'judgemental', expectedActorRole: 'Wire Ops Approver',       expectedSystem: 'payment_hub' },
    { id: 'STEP-WP-05', processId: 'PROC-WP', stepOrder: 5, name: 'Release to SWIFT',              stepType: 'system',     expectedActorRole: 'system',                  expectedSystem: 'swift_gateway' },
    { id: 'STEP-WP-06', processId: 'PROC-WP', stepOrder: 6, name: 'Nostro Reconciliation',         stepType: 'system',     expectedActorRole: 'Recon Ops',               expectedSystem: 'recon_tool' },
    { id: 'STEP-WP-07', processId: 'PROC-WP', stepOrder: 7, name: 'Exception / Recall Handling',   stepType: 'judgemental', expectedActorRole: 'Wire Ops',                expectedSystem: 'payment_hub' },
    // Customer Onboarding
    { id: 'STEP-CO-01', processId: 'PROC-CO', stepOrder: 1, name: 'Identity Capture & Verification', stepType: 'system',   expectedActorRole: 'system',                  expectedSystem: 'idv_vendor' },
    { id: 'STEP-CO-02', processId: 'PROC-CO', stepOrder: 2, name: 'Beneficial Owner Identification', stepType: 'judgemental', expectedActorRole: 'Onboarding Ops',         expectedSystem: 'crm' },
    { id: 'STEP-CO-03', processId: 'PROC-CO', stepOrder: 3, name: 'Sanctions / PEP / Adverse Media', stepType: 'system',   expectedActorRole: 'system',                  expectedSystem: 'screening_engine' },
    { id: 'STEP-CO-04', processId: 'PROC-CO', stepOrder: 4, name: 'Risk Rating & EDD Decision',     stepType: 'judgemental', expectedActorRole: 'FCC Analyst',             expectedSystem: 'crm' },
    { id: 'STEP-CO-05', processId: 'PROC-CO', stepOrder: 5, name: 'Account Activation',             stepType: 'system',     expectedActorRole: 'system',                  expectedSystem: 'core_banking' },
    // AML
    { id: 'STEP-AML-01', processId: 'PROC-AML', stepOrder: 1, name: 'Alert Generation',             stepType: 'system',     expectedActorRole: 'system',                  expectedSystem: 'aml_engine' },
    { id: 'STEP-AML-02', processId: 'PROC-AML', stepOrder: 2, name: 'L1 Triage',                    stepType: 'judgemental', expectedActorRole: 'FCC L1 Investigator',     expectedSystem: 'case_mgmt' },
    { id: 'STEP-AML-03', processId: 'PROC-AML', stepOrder: 3, name: 'L2 Investigation',             stepType: 'judgemental', expectedActorRole: 'FCC L2 Investigator',     expectedSystem: 'case_mgmt' },
    { id: 'STEP-AML-04', processId: 'PROC-AML', stepOrder: 4, name: 'L3 / SAR Decision',            stepType: 'judgemental', expectedActorRole: 'BSA Officer',             expectedSystem: 'case_mgmt' },
    { id: 'STEP-AML-05', processId: 'PROC-AML', stepOrder: 5, name: 'SAR Filing',                   stepType: 'system',     expectedActorRole: 'BSA Officer',             expectedSystem: 'sar_filing_system' },
    // Vendor Onboarding
    { id: 'STEP-VO-01', processId: 'PROC-VO', stepOrder: 1, name: 'Tiering & Risk Questionnaire',  stepType: 'judgemental', expectedActorRole: 'Vendor Mgmt',             expectedSystem: 'vendor_portal' },
    { id: 'STEP-VO-02', processId: 'PROC-VO', stepOrder: 2, name: 'Due Diligence Review',          stepType: 'judgemental', expectedActorRole: 'Vendor Mgmt',             expectedSystem: 'vendor_portal' },
    { id: 'STEP-VO-03', processId: 'PROC-VO', stepOrder: 3, name: 'Contracting & InfoSec Sign-off', stepType: 'judgemental', expectedActorRole: 'Procurement / InfoSec',  expectedSystem: 'contract_mgmt' },
    { id: 'STEP-VO-04', processId: 'PROC-VO', stepOrder: 4, name: '4th-Party Disclosure & Activation', stepType: 'judgemental', expectedActorRole: 'Vendor Mgmt',         expectedSystem: 'vendor_portal' },
    // Model Validation
    { id: 'STEP-MV-01', processId: 'PROC-MV', stepOrder: 1, name: 'Model Inventory Entry',          stepType: 'system',     expectedActorRole: 'Model Owner',             expectedSystem: 'model_inventory' },
    { id: 'STEP-MV-02', processId: 'PROC-MV', stepOrder: 2, name: 'Independent Validation',         stepType: 'judgemental', expectedActorRole: 'MRM Validator',           expectedSystem: 'mrm_repo' },
    { id: 'STEP-MV-03', processId: 'PROC-MV', stepOrder: 3, name: 'Outcomes Analysis & Re-Validation', stepType: 'judgemental', expectedActorRole: 'MRM Validator',       expectedSystem: 'mrm_repo' },
    // Loan Origination
    { id: 'STEP-LO-01', processId: 'PROC-LO', stepOrder: 1, name: 'Application Intake',             stepType: 'system',     expectedActorRole: 'Loan Officer',            expectedSystem: 'lms' },
    { id: 'STEP-LO-02', processId: 'PROC-LO', stepOrder: 2, name: 'Underwriting & Pricing',         stepType: 'judgemental', expectedActorRole: 'Underwriter',             expectedSystem: 'lms' },
    { id: 'STEP-LO-03', processId: 'PROC-LO', stepOrder: 3, name: 'Decision & Adverse Action',      stepType: 'judgemental', expectedActorRole: 'Underwriter',             expectedSystem: 'lms' },
    { id: 'STEP-LO-04', processId: 'PROC-LO', stepOrder: 4, name: 'Closing & Disclosure',           stepType: 'judgemental', expectedActorRole: 'Closing Ops',             expectedSystem: 'doc_mgmt' },
    { id: 'STEP-LO-05', processId: 'PROC-LO', stepOrder: 5, name: 'HMDA Reporting',                 stepType: 'system',     expectedActorRole: 'Mortgage Compliance',     expectedSystem: 'lms' }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Controls (30)
  // Two narrative-bearing degrading controls: AML-C002 and WP-C003.
  // Each control's CES/decomposition is set as point-in-time current values;
  // ControlInstance generation produces the time-series that backs them.
  // ──────────────────────────────────────────────────────────────────────────
  const controls = [
    // ─── Wire Payments (9) ───
    { id: 'WP-C001', name: 'Wire Dual-Approval Control',                 description: 'All outgoing wires ≥ $100,000 require maker-checker dual approval by separate authorised users prior to release to SWIFT.',                                processId: 'PROC-WP', processStepId: 'STEP-WP-04', controlType: 'preventive', controlNature: 'automated', frequency: 'per_event',     effectivenessScore: 96, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 99.8, catchRate: 98.0, evidenceCompleteness: 96.5 }, status: 'active', ownerRole: 'Head of Payment Operations',  operatorRole: 'Wire Ops',         obligationIds: ['OBL-WIRE-DUAL-001'],                  riskIds: ['R-OP-WIRE'],                  recentInstanceIds: [] },
    { id: 'WP-C002', name: 'Wire Sanctions Screening Control',           description: 'Pre-release real-time screening of all outgoing wires against OFAC SDN list and applicable sectoral sanctions, with hold-and-investigate on any hit.',     processId: 'PROC-WP', processStepId: 'STEP-WP-02', controlType: 'preventive', controlNature: 'automated', frequency: 'per_event',     effectivenessScore: 91, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 99.9, catchRate: 96.5, evidenceCompleteness: 90.2 }, status: 'active', ownerRole: 'Head of Sanctions Compliance', operatorRole: 'Sanctions Ops',    obligationIds: ['OBL-OFAC-001'],                       riskIds: ['R-FC-OFAC'],                  recentInstanceIds: [] },
    { id: 'WP-C003', name: 'Wire Beneficiary Callback Control',          description: 'For wires above defined threshold or to new beneficiaries, an out-of-band callback is performed against verified phone numbers prior to release; recording or attestation captured.', processId: 'PROC-WP', processStepId: 'STEP-WP-03', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_event', effectivenessScore: 78, effectivenessBand: 'effective_with_obs', effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 99.1, catchRate: 91.0, evidenceCompleteness: 71.5 }, status: 'active', ownerRole: 'Head of Payment Operations',  operatorRole: 'Wire Ops',         obligationIds: ['OBL-WIRE-CALLBACK-001'],              riskIds: ['R-FC-FRAUD'],                 recentInstanceIds: [] },
    { id: 'WP-C004', name: 'Wire Authority Limit Enforcement',           description: 'System enforces approver authority matrix; releases above approver limit are blocked or routed to higher authority.',                                       processId: 'PROC-WP', processStepId: 'STEP-WP-04', controlType: 'preventive', controlNature: 'automated', frequency: 'per_event',     effectivenessScore: 94, effectivenessBand: 'effective',           effectivenessTrend: 'improving', cesDecomposition: { operatingRate: 99.9, catchRate: 95.0, evidenceCompleteness: 94.8 }, status: 'active', ownerRole: 'Head of Payment Operations',  operatorRole: 'Wire Ops',         obligationIds: ['OBL-WIRE-DUAL-001'],                  riskIds: ['R-OP-WIRE'],                  recentInstanceIds: [] },
    { id: 'WP-C005', name: 'Wire Fraud Monitoring Control',              description: 'Real-time fraud scoring on outgoing wires using behavioural and pattern features; high-score wires routed to fraud ops for triage prior to release.',       processId: 'PROC-WP', processStepId: 'STEP-WP-02', controlType: 'detective',  controlNature: 'automated', frequency: 'per_event',     effectivenessScore: 82, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 99.5, catchRate: 78.0, evidenceCompleteness: 86.0 }, status: 'active', ownerRole: 'Head of Fraud Operations',     operatorRole: 'Fraud Ops',        obligationIds: [],                                     riskIds: ['R-FC-FRAUD'],                 recentInstanceIds: [] },
    { id: 'WP-C006', name: 'Nostro Reconciliation Aging Control',        description: 'Daily nostro reconciliation with aging escalation: items > 30 days are escalated to Head of Recon Ops with documented variance explanation.',                processId: 'PROC-WP', processStepId: 'STEP-WP-06', controlType: 'detective',  controlNature: 'itdm',      frequency: 'daily',         effectivenessScore: 75, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 99.0, catchRate: 82.0, evidenceCompleteness: 70.0 }, status: 'active', ownerRole: 'Head of Reconciliation Operations', operatorRole: 'Recon Ops', obligationIds: ['OBL-RECON-001'],                      riskIds: ['R-OP-RECON'],                 recentInstanceIds: [] },
    { id: 'WP-C007', name: 'Wire Exception Aging & SLA Control',         description: 'Daily exception report with SLA enforcement on aged exceptions; items past SLA are escalated to operations leadership.',                                     processId: 'PROC-WP', processStepId: 'STEP-WP-07', controlType: 'detective',  controlNature: 'itdm',      frequency: 'daily',         effectivenessScore: 88, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 98.5, catchRate: 90.0, evidenceCompleteness: 88.0 }, status: 'active', ownerRole: 'Head of Payment Operations',  operatorRole: 'Wire Ops',         obligationIds: [],                                     riskIds: ['R-OP-WIRE'],                  recentInstanceIds: [] },
    { id: 'WP-C008', name: 'OFAC Blocked Property Reporting Control',    description: 'Blocked or rejected transactions are reported to OFAC within 10 business days; annual filing prepared and submitted.',                                       processId: 'PROC-WP', processStepId: 'STEP-WP-07', controlType: 'corrective', controlNature: 'manual',    frequency: 'per_event',     effectivenessScore: 86, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 100.0, catchRate: 92.0, evidenceCompleteness: 80.0 }, status: 'active', ownerRole: 'Head of Sanctions Compliance', operatorRole: 'Sanctions Ops',    obligationIds: ['OBL-OFAC-003'],                       riskIds: ['R-FC-OFAC'],                  recentInstanceIds: [] },
    { id: 'WP-C009', name: 'Wire Recall & Dispute Handling Control',     description: 'Documented playbook for wire recalls and disputes with timely escalation to correspondent and customer.',                                                  processId: 'PROC-WP', processStepId: 'STEP-WP-07', controlType: 'corrective', controlNature: 'manual',    frequency: 'per_event',     effectivenessScore: 80, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 97.0, catchRate: 85.0, evidenceCompleteness: 78.0 }, status: 'active', ownerRole: 'Head of Payment Operations',  operatorRole: 'Wire Ops',         obligationIds: [],                                     riskIds: ['R-OP-WIRE'],                  recentInstanceIds: [] },
    // ─── Customer Onboarding (6) ───
    { id: 'CO-C001', name: 'CIP Identity Verification Control',          description: 'Customer identity is verified using documentary and non-documentary methods at account opening per CIP rules.',                                            processId: 'PROC-CO', processStepId: 'STEP-CO-01', controlType: 'preventive', controlNature: 'automated', frequency: 'per_customer', effectivenessScore: 90, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 99.5, catchRate: 95.0, evidenceCompleteness: 88.0 }, status: 'active', ownerRole: 'Head of Onboarding Operations', operatorRole: 'Onboarding Ops',  obligationIds: ['OBL-BSA-001','OBL-FFIEC-BSA-001'],    riskIds: ['R-FC-KYC'],                   recentInstanceIds: [] },
    { id: 'CO-C002', name: 'Beneficial Owner Identification Control',    description: 'For legal entity customers, beneficial owners are identified, verified, and certified; refresh on trigger events.',                                       processId: 'PROC-CO', processStepId: 'STEP-CO-02', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_customer', effectivenessScore: 79, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 96.0, catchRate: 88.0, evidenceCompleteness: 76.0 }, status: 'active', ownerRole: 'Head of Onboarding Operations', operatorRole: 'Onboarding Ops',  obligationIds: ['OBL-BSA-003'],                        riskIds: ['R-FC-KYC'],                   recentInstanceIds: [] },
    { id: 'CO-C003', name: 'Customer Risk Rating Control',               description: 'Risk rating model assigns customer risk profile (low / med / high) at onboarding driving CDD and EDD pathways.',                                            processId: 'PROC-CO', processStepId: 'STEP-CO-04', controlType: 'preventive', controlNature: 'automated', frequency: 'per_customer', effectivenessScore: 87, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 99.0, catchRate: 90.0, evidenceCompleteness: 88.0 }, status: 'active', ownerRole: 'Head of Financial Crime Compliance', operatorRole: 'FCC Analyst', obligationIds: ['OBL-FFIEC-BSA-001'],                  riskIds: ['R-FC-KYC'],                   recentInstanceIds: [] },
    { id: 'CO-C004', name: 'Enhanced Due Diligence Control',             description: 'High-risk customers undergo EDD review with documented rationale and ongoing monitoring obligations.',                                                    processId: 'PROC-CO', processStepId: 'STEP-CO-04', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_customer', effectivenessScore: 74, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 92.0, catchRate: 85.0, evidenceCompleteness: 70.0 }, status: 'active', ownerRole: 'Head of Financial Crime Compliance', operatorRole: 'FCC Analyst', obligationIds: ['OBL-FFIEC-BSA-001'],                  riskIds: ['R-FC-KYC','R-FC-AML'],        recentInstanceIds: [] },
    { id: 'CO-C005', name: 'Onboarding Sanctions & PEP Screening',       description: 'All new customers screened against sanctions, PEP, and adverse media lists at onboarding with documented disposition of hits.',                            processId: 'PROC-CO', processStepId: 'STEP-CO-03', controlType: 'preventive', controlNature: 'automated', frequency: 'per_customer', effectivenessScore: 89, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 99.8, catchRate: 92.0, evidenceCompleteness: 86.0 }, status: 'active', ownerRole: 'Head of Sanctions Compliance', operatorRole: 'Sanctions Ops',    obligationIds: ['OBL-OFAC-001'],                       riskIds: ['R-FC-OFAC','R-FC-KYC'],       recentInstanceIds: [] },
    { id: 'CO-C006', name: 'PEP Escalation Timeliness Control',          description: 'Identified PEP relationships escalated to senior compliance for sign-off within 1 business day.',                                                          processId: 'PROC-CO', processStepId: 'STEP-CO-04', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_customer', effectivenessScore: 81, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 95.0, catchRate: 88.0, evidenceCompleteness: 82.0 }, status: 'active', ownerRole: 'Head of Financial Crime Compliance', operatorRole: 'FCC Analyst', obligationIds: ['OBL-FFIEC-BSA-001'],                  riskIds: ['R-FC-KYC'],                   recentInstanceIds: [] },
    // ─── AML (6) — AML-C002 is the degrading star ───
    { id: 'AML-C001', name: 'AML Scenario Coverage Review Control',      description: 'Quarterly review of AML scenario coverage against products, customer segments, and geographies; gaps documented and remediated.',                          processId: 'PROC-AML', processStepId: 'STEP-AML-01', controlType: 'detective',  controlNature: 'manual',    frequency: 'quarterly',    effectivenessScore: 78, effectivenessBand: 'effective_with_obs', effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 100.0, catchRate: 80.0, evidenceCompleteness: 76.0 }, status: 'active', ownerRole: 'Head of AML Investigations', operatorRole: 'FCC Quality Assurance', obligationIds: ['OBL-FFIEC-BSA-006'],                 riskIds: ['R-FC-AML','R-MR-AML'],        recentInstanceIds: [] },
    { id: 'AML-C002', name: 'AML Alert Disposition SLA Control',         description: 'L1 alerts dispositioned within 5 business days, L2 within 15, L3 within 30. Operating rate (alerts touched) remains stable but evidence completeness on rushed dispositions has degraded.', processId: 'PROC-AML', processStepId: 'STEP-AML-02', controlType: 'detective', controlNature: 'itdm', frequency: 'per_case', effectivenessScore: 64, effectivenessBand: 'needs_improvement', effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 98.5, catchRate: 71.0, evidenceCompleteness: 58.0 }, status: 'active', ownerRole: 'Head of AML Investigations', operatorRole: 'FCC L1/L2/L3 Investigators', obligationIds: ['OBL-FFIEC-BSA-006','OBL-FFIEC-BSA-008'], riskIds: ['R-FC-AML'],          recentInstanceIds: [] },
    { id: 'AML-C003', name: 'AML Investigation Documentation Standard', description: 'Each alert investigation captures evidence package, decision, and rationale per documentation standard.',                                                  processId: 'PROC-AML', processStepId: 'STEP-AML-03', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_case',     effectivenessScore: 71, effectivenessBand: 'effective_with_obs', effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 96.0, catchRate: 78.0, evidenceCompleteness: 64.0 }, status: 'active', ownerRole: 'Head of AML Investigations', operatorRole: 'FCC L1/L2 Investigators',    obligationIds: ['OBL-FFIEC-BSA-008'],                  riskIds: ['R-FC-AML'],                   recentInstanceIds: [] },
    { id: 'AML-C004', name: 'L3 Escalation & SAR Decision Control',      description: 'L3 cases escalated to BSA Officer for SAR decision with supervisory sign-off; decision rationale documented.',                                            processId: 'PROC-AML', processStepId: 'STEP-AML-04', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_case',     effectivenessScore: 84, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 98.0, catchRate: 88.0, evidenceCompleteness: 82.0 }, status: 'active', ownerRole: 'BSA Officer',                  operatorRole: 'BSA Officer',      obligationIds: ['OBL-BSA-002','OBL-FFIEC-BSA-008'],   riskIds: ['R-FC-AML'],                   recentInstanceIds: [] },
    { id: 'AML-C005', name: 'SAR Filing Timeliness Control',             description: 'SAR filed within 30 days of detection (60 days where no suspect identified), with regulator submission proof.',                                            processId: 'PROC-AML', processStepId: 'STEP-AML-05', controlType: 'preventive', controlNature: 'itdm',      frequency: 'per_case',     effectivenessScore: 92, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 99.5, catchRate: 96.0, evidenceCompleteness: 92.0 }, status: 'active', ownerRole: 'BSA Officer',                  operatorRole: 'BSA Officer',      obligationIds: ['OBL-BSA-002'],                        riskIds: ['R-FC-AML'],                   recentInstanceIds: [] },
    { id: 'AML-C006', name: 'AML QA Sample Review Control',              description: 'Independent quality assurance reviews a risk-based sample of dispositioned alerts each month; findings drive corrective action.',                          processId: 'PROC-AML', processStepId: 'STEP-AML-03', controlType: 'detective',  controlNature: 'manual',    frequency: 'monthly',      effectivenessScore: 76, effectivenessBand: 'effective_with_obs', effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 100.0, catchRate: 80.0, evidenceCompleteness: 72.0 }, status: 'active', ownerRole: 'Head of AML Investigations', operatorRole: 'FCC Quality Assurance', obligationIds: ['OBL-FFIEC-BSA-008'],                  riskIds: ['R-FC-AML'],                   recentInstanceIds: [] },
    // ─── Vendor Onboarding (5) ───
    { id: 'VO-C001', name: 'Vendor Tiering & Risk Assessment Control',   description: 'Vendors tiered by criticality and risk profile prior to engagement; tier drives downstream due diligence depth.',                                          processId: 'PROC-VO', processStepId: 'STEP-VO-01', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_vendor',   effectivenessScore: 85, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 98.0, catchRate: 90.0, evidenceCompleteness: 84.0 }, status: 'active', ownerRole: 'Head of Vendor Management',     operatorRole: 'Vendor Mgmt',     obligationIds: ['OBL-OCC-2023-17-001'],                riskIds: ['R-TP-VEN'],                   recentInstanceIds: [] },
    { id: 'VO-C002', name: 'Vendor Due Diligence Package Control',       description: 'Risk-based due diligence package complete prior to contracting; tier-appropriate evidence gathered.',                                                       processId: 'PROC-VO', processStepId: 'STEP-VO-02', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_vendor',   effectivenessScore: 82, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 95.0, catchRate: 88.0, evidenceCompleteness: 80.0 }, status: 'active', ownerRole: 'Head of Vendor Management',     operatorRole: 'Vendor Mgmt',     obligationIds: ['OBL-OCC-2023-17-001'],                riskIds: ['R-TP-VEN'],                   recentInstanceIds: [] },
    { id: 'VO-C003', name: 'Vendor InfoSec & SOC Review Control',        description: 'InfoSec assessment and current SOC 2 Type II report reviewed before contracting and on annual cycle for Critical vendors.',                                  processId: 'PROC-VO', processStepId: 'STEP-VO-03', controlType: 'detective',  controlNature: 'manual',    frequency: 'annual',       effectivenessScore: 70, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 90.0, catchRate: 78.0, evidenceCompleteness: 66.0 }, status: 'active', ownerRole: 'Head of Vendor Management',     operatorRole: 'InfoSec',         obligationIds: ['OBL-OCC-2023-17-003'],                riskIds: ['R-TP-VEN'],                   recentInstanceIds: [] },
    { id: 'VO-C004', name: 'Vendor Contract Clause Completeness',        description: 'Required contract clauses (audit, data, exit, BCP, breach notification) verified prior to contract signature.',                                            processId: 'PROC-VO', processStepId: 'STEP-VO-03', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_vendor',   effectivenessScore: 86, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 97.0, catchRate: 92.0, evidenceCompleteness: 84.0 }, status: 'active', ownerRole: 'Head of Vendor Management',     operatorRole: 'Procurement',     obligationIds: ['OBL-OCC-2023-17-001'],                riskIds: ['R-TP-VEN'],                   recentInstanceIds: [] },
    { id: 'VO-C005', name: '4th-Party Disclosure & Inventory Control',   description: 'Critical vendors disclose material 4th parties; bank maintains inventory and assesses concentration. Currently the only control mapped to OBL-OCC-2023-17-005, with degrading evidence.',  processId: 'PROC-VO', processStepId: 'STEP-VO-04', controlType: 'detective', controlNature: 'manual', frequency: 'annual', effectivenessScore: 58, effectivenessBand: 'needs_improvement', effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 85.0, catchRate: 65.0, evidenceCompleteness: 55.0 }, status: 'active', ownerRole: 'Head of Vendor Management', operatorRole: 'Vendor Mgmt', obligationIds: ['OBL-OCC-2023-17-005'], riskIds: ['R-TP-VEN'], recentInstanceIds: [] },
    // ─── Model Validation (4) ───
    { id: 'MV-C001', name: 'Model Inventory Completeness Control',       description: 'All models in production are recorded in the model inventory with required metadata and refreshed on cycle.',                                              processId: 'PROC-MV', processStepId: 'STEP-MV-01', controlType: 'preventive', controlNature: 'itdm',      frequency: 'quarterly',    effectivenessScore: 80, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 96.0, catchRate: 84.0, evidenceCompleteness: 80.0 }, status: 'active', ownerRole: 'Head of Model Risk Management', operatorRole: 'Model Owners',   obligationIds: ['OBL-SR-11-7-001'],                    riskIds: ['R-MR-VAL'],                   recentInstanceIds: [] },
    { id: 'MV-C002', name: 'Independent Model Validation Control',       description: 'Pre-deployment and on-cycle validation by independent function with outcomes analysis and benchmarking; sign-off required.',                                processId: 'PROC-MV', processStepId: 'STEP-MV-02', controlType: 'preventive', controlNature: 'manual',    frequency: 'cyclical',     effectivenessScore: 67, effectivenessBand: 'needs_improvement',   effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 78.0, catchRate: 80.0, evidenceCompleteness: 64.0 }, status: 'active', ownerRole: 'Head of Model Risk Management', operatorRole: 'MRM Validators', obligationIds: ['OBL-SR-11-7-002'],                    riskIds: ['R-MR-VAL','R-MR-AML'],        recentInstanceIds: [] },
    { id: 'MV-C003', name: 'Outcomes & Re-Validation Cadence Control',   description: 'Models re-validated on defined cadence with outcomes analysis; past-due re-validations escalated to Head of MRM.',                                          processId: 'PROC-MV', processStepId: 'STEP-MV-03', controlType: 'detective',  controlNature: 'manual',    frequency: 'cyclical',     effectivenessScore: 62, effectivenessBand: 'needs_improvement',   effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 74.0, catchRate: 75.0, evidenceCompleteness: 60.0 }, status: 'active', ownerRole: 'Head of Model Risk Management', operatorRole: 'MRM Validators', obligationIds: ['OBL-SR-11-7-002'],                    riskIds: ['R-MR-VAL'],                   recentInstanceIds: [] },
    { id: 'MV-C004', name: 'Validator Independence Attestation Control', description: 'Validators attest independence from model developers and owners on each validation engagement; conflicts disclosed.',                                     processId: 'PROC-MV', processStepId: 'STEP-MV-02', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_model',    effectivenessScore: 91, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 100.0, catchRate: 92.0, evidenceCompleteness: 88.0 }, status: 'active', ownerRole: 'Head of Model Risk Management', operatorRole: 'MRM Validators', obligationIds: ['OBL-SR-11-7-003'],                    riskIds: ['R-MR-VAL'],                   recentInstanceIds: [] },
    // ─── Loan Origination (5) ───
    { id: 'LO-C001', name: 'Loan Underwriting Standard Control',         description: 'All loans underwritten against approved policy; exceptions documented with justification and senior approval.',                                            processId: 'PROC-LO', processStepId: 'STEP-LO-02', controlType: 'preventive', controlNature: 'itdm',      frequency: 'per_loan',     effectivenessScore: 88, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 98.0, catchRate: 90.0, evidenceCompleteness: 86.0 }, status: 'active', ownerRole: 'Chief Credit Officer',          operatorRole: 'Underwriters',    obligationIds: [],                                     riskIds: [],                              recentInstanceIds: [] },
    { id: 'LO-C002', name: 'Pricing Exception Authority Control',        description: 'Pricing exceptions require manager review and authority sign-off; rationale captured in LMS for fair-lending review.',                                     processId: 'PROC-LO', processStepId: 'STEP-LO-02', controlType: 'preventive', controlNature: 'manual',    frequency: 'per_loan',     effectivenessScore: 81, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 96.0, catchRate: 85.0, evidenceCompleteness: 80.0 }, status: 'active', ownerRole: 'Head of Fair Lending',          operatorRole: 'Branch Managers', obligationIds: ['OBL-ECOA-001'],                       riskIds: ['R-CC-FAIR'],                  recentInstanceIds: [] },
    { id: 'LO-C003', name: 'Adverse Action Notice Timeliness Control',   description: 'AANs issued within 30 days of decision per ECOA; mailing/transmission log retained.',                                                                       processId: 'PROC-LO', processStepId: 'STEP-LO-03', controlType: 'preventive', controlNature: 'itdm',      frequency: 'per_loan',     effectivenessScore: 89, effectivenessBand: 'effective',           effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 98.5, catchRate: 92.0, evidenceCompleteness: 87.0 }, status: 'active', ownerRole: 'Head of Mortgage Operations',   operatorRole: 'Closing Ops',     obligationIds: ['OBL-ECOA-002'],                       riskIds: [],                              recentInstanceIds: [] },
    { id: 'LO-C004', name: 'Fair Lending Disparity Monitoring Control',  description: 'Quarterly statistical disparity testing on pricing exceptions and decisioning across protected classes; findings drive corrective action.',                processId: 'PROC-LO', processStepId: 'STEP-LO-02', controlType: 'detective',  controlNature: 'manual',    frequency: 'quarterly',    effectivenessScore: 78, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'stable',    cesDecomposition: { operatingRate: 100.0, catchRate: 82.0, evidenceCompleteness: 76.0 }, status: 'active', ownerRole: 'Head of Fair Lending',          operatorRole: 'Fair Lending Office', obligationIds: ['OBL-ECOA-001'],                  riskIds: ['R-CC-FAIR'],                  recentInstanceIds: [] },
    { id: 'LO-C005', name: 'HMDA LAR Validation Control',                description: 'Quarterly LAR validation prior to regulatory submission; error rate must remain within tolerance.',                                                          processId: 'PROC-LO', processStepId: 'STEP-LO-05', controlType: 'detective',  controlNature: 'itdm',      frequency: 'quarterly',    effectivenessScore: 76, effectivenessBand: 'effective_with_obs',  effectivenessTrend: 'worsening', cesDecomposition: { operatingRate: 100.0, catchRate: 80.0, evidenceCompleteness: 74.0 }, status: 'active', ownerRole: 'Head of Mortgage Operations',   operatorRole: 'Mortgage Compliance', obligationIds: ['OBL-HMDA-001'],                  riskIds: [],                              recentInstanceIds: [] }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Issues (22) — incl. dominant Capacity cluster
  // ──────────────────────────────────────────────────────────────────────────
  const issues = [
    // ─── Capacity cluster (5 issues — the dominant cluster) ─────────────────
    { id: 'ISS-2026-009', title: 'AML alert backlog exceeds appetite — RED breach',                description: 'AML alert backlog crossed the 5% appetite threshold in week 11 and continues to accelerate. Current 6.4% backlog driven by L1/L2 capacity gap; tied to AML-C002 evidence-completeness degradation.', severity: 'high',   status: 'in_remediation', source: 'self_identified', raisedDate: dateOnly(11, 2), targetCloseDate: dateOnly(-8, 0), actualCloseDate: null, daysOpen: 82,  ownerId: 'ACT-FCC-HEAD',     rootCause: 'Capacity — L1/L2 investigator headcount below volume', rootCauseClusterId: 'CLUSTER-CAPACITY',           relatedControlIds: ['AML-C002','AML-C003'],          relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-AML'],     actionIds: ['ACT-2026-009-01','ACT-2026-009-02'] },
    { id: 'ISS-2026-031', title: 'EDD past-due cases trending into amber',                          description: '11 EDD cases past due >10 BD; pattern aligned with AML capacity stress. Workflow re-prioritisation underway but capacity remains the constraint.',                                          severity: 'medium', status: 'in_remediation', source: 'self_identified', raisedDate: dateOnly(7, 3),  targetCloseDate: dateOnly(-4, 0), actualCloseDate: null, daysOpen: 45,  ownerId: 'ACT-FCC-HEAD',     rootCause: 'Capacity — FCC Analyst pool stretched',                  rootCauseClusterId: 'CLUSTER-CAPACITY',           relatedControlIds: ['CO-C004'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-KYC'],     actionIds: ['ACT-2026-031-01'] },
    { id: 'ISS-2026-040', title: 'Adverse media disposition aging into amber',                      description: '22 adverse-media hits aged >5 BD; same capacity profile as AML/EDD. Routing changes proposed but underlying staffing constraint remains.',                                              severity: 'medium', status: 'in_remediation', source: 'fcc_qa',          raisedDate: dateOnly(5, 1),  targetCloseDate: dateOnly(-2, 0), actualCloseDate: null, daysOpen: 36,  ownerId: 'ACT-FCC-HEAD',     rootCause: 'Capacity — adverse media triage pod under-resourced',     rootCauseClusterId: 'CLUSTER-CAPACITY',           relatedControlIds: ['CO-C005'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-KYC','R-FC-OFAC'], actionIds: ['ACT-2026-040-01'] },
    { id: 'ISS-2026-052', title: 'L3 case aging trending high',                                     description: 'L3 cases open >30 BD reached 12 in week 9, growing weekly. Senior investigator allocation underway. Common driver with broader AML capacity story.',                                  severity: 'medium', status: 'in_remediation', source: 'self_identified', raisedDate: dateOnly(9, 0),  targetCloseDate: dateOnly(-3, 0), actualCloseDate: null, daysOpen: 65,  ownerId: 'ACT-FCC-HEAD',     rootCause: 'Capacity — L3 senior investigator gap on complex cases',  rootCauseClusterId: 'CLUSTER-CAPACITY',           relatedControlIds: ['AML-C002','AML-C004'],          relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-AML'],     actionIds: ['ACT-2026-052-01','ACT-2026-052-02'] },
    { id: 'ISS-2026-051', title: 'Past-due model re-validations',                                   description: 'Five models past their re-validation due date including the AML transaction-monitoring model. MRM capacity cited as root cause; interim use-restriction memos issued for two models.', severity: 'high',   status: 'in_remediation', source: 'self_identified', raisedDate: dateOnly(8, 2),  targetCloseDate: dateOnly(-6, 0), actualCloseDate: null, daysOpen: 60,  ownerId: 'ACT-MRM-HEAD',     rootCause: 'Capacity — MRM validation capacity below cycle demand',   rootCauseClusterId: 'CLUSTER-CAPACITY',           relatedControlIds: ['MV-C002','MV-C003'],            relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-VAL','R-MR-AML'], actionIds: ['ACT-2026-051-01','ACT-2026-051-02'] },
    // ─── Data Quality cluster (4) ───────────────────────────────────────────
    { id: 'ISS-2026-018', title: 'Nostro reconciliation aged break population',                     description: 'Aged items >30 days reached $140K in March driven by malformed remittance from one correspondent. Upstream data quality fix required.',                                            severity: 'medium', status: 'in_remediation', source: 'self_identified', raisedDate: dateOnly(6, 3),  targetCloseDate: dateOnly(-3, 0), actualCloseDate: null, daysOpen: 42,  ownerId: 'ACT-RECON-HEAD',   rootCause: 'Data quality — malformed correspondent remittance',       rootCauseClusterId: 'CLUSTER-DATA-QUALITY',       relatedControlIds: ['WP-C006'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-OP-RECON'],   actionIds: ['ACT-2026-018-01'] },
    { id: 'ISS-2026-046', title: 'HMDA Q1 validation error rate above tolerance',                   description: 'Q1 LAR validation showed 3.4% error rate (amber). Root cause: LMS data-mapping change introduced upstream. Mapping rectified, scrub and retest in progress.',                            severity: 'medium', status: 'in_remediation', source: 'mortgage_compliance', raisedDate: dateOnly(4, 1), targetCloseDate: dateOnly(-5, 0), actualCloseDate: null, daysOpen: 27, ownerId: 'ACT-MORT-HEAD',    rootCause: 'Data quality — LMS data-mapping change',                   rootCauseClusterId: 'CLUSTER-DATA-QUALITY',       relatedControlIds: ['LO-C005'],                       relatedControlInstanceIds: [], relatedRiskIds: [],               actionIds: ['ACT-2026-046-01'] },
    { id: 'ISS-2026-023', title: 'Onboarding UBO certification gaps in legal-entity files',         description: 'Internal Audit sample identified 3/40 files with missing or outdated UBO certification. Process gap on entity refresh; workflow gating proposed.',                                  severity: 'medium', status: 'in_remediation', source: 'internal_audit',  raisedDate: dateOnly(8, 4),  targetCloseDate: dateOnly(-6, 0), actualCloseDate: null, daysOpen: 64,  ownerId: 'ACT-ONBOARD-HEAD', rootCause: 'Data quality — entity refresh process gap',                rootCauseClusterId: 'CLUSTER-DATA-QUALITY',       relatedControlIds: ['CO-C002'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-KYC'],     actionIds: ['ACT-2026-023-01'] },
    { id: 'ISS-2026-038', title: 'Loan Origination — covenant capture gap on commercial bookings',  description: 'Internal Audit identified 3.1% of commercial bookings missing one or more covenants in core. LOS field optionality cited as root cause.',                                            severity: 'medium', status: 'in_remediation', source: 'internal_audit',  raisedDate: dateOnly(6, 1),  targetCloseDate: dateOnly(-4, 0), actualCloseDate: null, daysOpen: 41,  ownerId: 'ACT-COMM-LEND',    rootCause: 'Data quality — LMS field optionality',                     rootCauseClusterId: 'CLUSTER-DATA-QUALITY',       relatedControlIds: ['LO-C001'],                       relatedControlInstanceIds: [], relatedRiskIds: [],               actionIds: ['ACT-2026-038-01'] },
    // ─── Threshold Calibration cluster (3) ──────────────────────────────────
    { id: 'ISS-2025-079', title: 'AML ATL/BTL test — productive alerts in BTL band',                description: 'BTL sample showed 3.8% productive — above 2% green band. Targeted threshold lowering for two scenarios planned after governance review.',                                       severity: 'medium', status: 'in_remediation', source: 'mrm_fcc',         raisedDate: dateOnly(12, 0), targetCloseDate: dateOnly(-2, 0), actualCloseDate: null, daysOpen: 91,  ownerId: 'ACT-MRM-HEAD',     rootCause: 'Threshold calibration — scenario tuning required',         rootCauseClusterId: 'CLUSTER-THRESHOLD-CALIBRATION', relatedControlIds: ['MV-C002','AML-C001'],         relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-AML'],     actionIds: ['ACT-2025-079-01'] },
    { id: 'ISS-2025-072', title: 'AML model — outcomes drift in cross-border typology',             description: 'Annual validation found outcomes drift in cross-border scenario. Scenario tuning + refreshed outcomes review planned.',                                                          severity: 'medium', status: 'in_remediation', source: 'mrm',             raisedDate: dateOnly(12, 4), targetCloseDate: dateOnly(-3, 0), actualCloseDate: null, daysOpen: 95,  ownerId: 'ACT-MRM-HEAD',     rootCause: 'Threshold calibration — typology shift',                   rootCauseClusterId: 'CLUSTER-THRESHOLD-CALIBRATION', relatedControlIds: ['MV-C002'],                     relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-AML'],     actionIds: ['ACT-2025-072-01'] },
    { id: 'ISS-2026-019', title: 'Backtesting breach on retail credit scoring model',               description: 'Outcomes analysis showed performance drift exceeding amber. Recalibration + interim conservative overlay planned.',                                                                  severity: 'medium', status: 'in_remediation', source: 'mrm',             raisedDate: dateOnly(5, 2),  targetCloseDate: dateOnly(-4, 0), actualCloseDate: null, daysOpen: 32,  ownerId: 'ACT-MRM-HEAD',     rootCause: 'Threshold calibration — population shift post rate-change', rootCauseClusterId: 'CLUSTER-THRESHOLD-CALIBRATION', relatedControlIds: ['MV-C002'],                    relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-VAL'],     actionIds: ['ACT-2026-019-01'] },
    // ─── Vendor Delivery cluster (2) ────────────────────────────────────────
    { id: 'ISS-2026-035', title: 'SOC 2 reports stale on two Critical vendors',                     description: 'Two Critical vendors have SOC 2 reports older than 12 months. Contractual escalation initiated and interim controls bridge in place.',                                            severity: 'medium', status: 'in_remediation', source: 'vendor_mgmt',     raisedDate: dateOnly(7, 2),  targetCloseDate: dateOnly(-5, 0), actualCloseDate: null, daysOpen: 50,  ownerId: 'ACT-VENDOR-HEAD',  rootCause: 'Vendor delivery — assurance report delivery slip',         rootCauseClusterId: 'CLUSTER-VENDOR-DELIVERY',    relatedControlIds: ['VO-C003'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-TP-VEN'],     actionIds: ['ACT-2026-035-01'] },
    { id: 'ISS-2025-098', title: 'Vendor 4th-party inventory — completeness below target',          description: 'Critical-vendor 4th-party disclosure at 78% vs target 90%. Disclosure gap with vendors; contractual amendments and scheduled disclosure review planned.',                          severity: 'medium', status: 'in_remediation', source: 'vendor_mgmt',     raisedDate: dateOnly(11, 4), targetCloseDate: dateOnly(-2, 0), actualCloseDate: null, daysOpen: 80,  ownerId: 'ACT-VENDOR-HEAD',  rootCause: 'Vendor delivery — disclosure gap with critical vendors',   rootCauseClusterId: 'CLUSTER-VENDOR-DELIVERY',    relatedControlIds: ['VO-C005'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-TP-VEN'],     actionIds: ['ACT-2025-098-01'] },
    // ─── Documentation Standards cluster (3) ────────────────────────────────
    { id: 'ISS-2026-012', title: 'Wire callback — incomplete documentation pattern',                description: 'Q1 QA found 6/30 sampled callbacks lacked timestamp or recorded number. Documentation standard not enforced; required-field workflow update underway.',                            severity: 'medium', status: 'in_remediation', source: '2lod_qa',         raisedDate: dateOnly(10, 0), targetCloseDate: dateOnly(-1, 0), actualCloseDate: null, daysOpen: 71,  ownerId: 'ACT-PAY-HEAD',     rootCause: 'Documentation standard — required-field gating absent',    rootCauseClusterId: 'CLUSTER-DOCUMENTATION',       relatedControlIds: ['WP-C003'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-FRAUD'],   actionIds: ['ACT-2026-012-01','ACT-2026-012-02'] },
    { id: 'ISS-2025-094', title: 'Wire recall — playbook ambiguity on cross-border recalls',        description: 'IA noted ambiguity in cross-border recall steps. Playbook update + tabletop exercise planned.',                                                                                  severity: 'low',    status: 'in_remediation', source: 'internal_audit',  raisedDate: dateOnly(12, 1), targetCloseDate: dateOnly(-1, 0), actualCloseDate: null, daysOpen: 88,  ownerId: 'ACT-PAY-HEAD',     rootCause: 'Documentation standard — playbook gap',                    rootCauseClusterId: 'CLUSTER-DOCUMENTATION',       relatedControlIds: ['WP-C009'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-OP-WIRE'],    actionIds: ['ACT-2025-094-01'] },
    { id: 'ISS-2026-007', title: 'Sanctions screening — list-load delay during weekend window',     description: 'IA identified list-load delays during weekend windows up to 4 hours. Process change to enforce SLA underway.',                                                                    severity: 'medium', status: 'in_remediation', source: 'internal_audit',  raisedDate: dateOnly(9, 5),  targetCloseDate: dateOnly(-2, 0), actualCloseDate: null, daysOpen: 95,  ownerId: 'ACT-SANC-HEAD',    rootCause: 'Documentation standard — weekend SLA undefined',           rootCauseClusterId: 'CLUSTER-DOCUMENTATION',       relatedControlIds: ['WP-C002'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-FC-OFAC'],    actionIds: ['ACT-2026-007-01'] },
    // ─── Standalone issues (5) ──────────────────────────────────────────────
    { id: 'ISS-2026-014', title: 'Fair lending — pricing-exception disparity drift in Q1',          description: 'Pricing exception disparity ratio drifted toward amber (1.35). Plan: tighten exception authority, add manager review, retraining.',                                                severity: 'medium', status: 'in_remediation', source: 'fair_lending',    raisedDate: dateOnly(6, 4),  targetCloseDate: dateOnly(-7, 0), actualCloseDate: null, daysOpen: 47,  ownerId: 'ACT-FAIR-HEAD',    rootCause: 'Branch-level discretion variability',                       rootCauseClusterId: null,                            relatedControlIds: ['LO-C002','LO-C004'],            relatedControlInstanceIds: [], relatedRiskIds: ['R-CC-FAIR'],    actionIds: ['ACT-2026-014-01'] },
    { id: 'ISS-2026-027', title: 'Vendor tiering — under-tiering pattern for analytics SaaS',       description: 'Tiering review re-classified 4 vendors from Medium to High. Tiering questionnaire ambiguity; update + retro re-tiering planned.',                                                severity: 'medium', status: 'in_remediation', source: 'vendor_mgmt',     raisedDate: dateOnly(7, 0),  targetCloseDate: dateOnly(-6, 0), actualCloseDate: null, daysOpen: 49,  ownerId: 'ACT-VENDOR-HEAD',  rootCause: 'Tiering questionnaire ambiguity',                          rootCauseClusterId: null,                            relatedControlIds: ['VO-C001'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-TP-VEN'],     actionIds: ['ACT-2026-027-01'] },
    { id: 'ISS-2026-029', title: 'AI/ML — fairness findings on small-dollar lending model',         description: 'Validation flagged elevated disparate-impact metric on protected class. Feature reassessment, model retraining, fair-lending sign-off before relaunch.',                          severity: 'high',   status: 'in_remediation', source: 'mrm',             raisedDate: dateOnly(5, 0),  targetCloseDate: dateOnly(-4, 0), actualCloseDate: null, daysOpen: 35,  ownerId: 'ACT-MRM-HEAD',     rootCause: 'Feature interaction with proxy variables',                  rootCauseClusterId: null,                            relatedControlIds: ['MV-C002'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-VAL','R-CC-FAIR'], actionIds: ['ACT-2026-029-01'] },
    { id: 'ISS-2026-044', title: 'Open high-severity MRM findings above tolerance',                 description: 'Open high-severity MRM findings reached 17 vs. tolerance of 5. Prioritisation review with model owners + monthly governance focus.',                                              severity: 'high',   status: 'in_remediation', source: 'internal_audit',  raisedDate: dateOnly(4, 0),  targetCloseDate: dateOnly(-8, 0), actualCloseDate: null, daysOpen: 28,  ownerId: 'ACT-MRM-HEAD',     rootCause: 'Remediation slippage',                                      rootCauseClusterId: null,                            relatedControlIds: ['MV-C003'],                       relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-VAL'],     actionIds: ['ACT-2026-044-01'] },
    { id: 'ISS-2025-088', title: 'AML — typology coverage gap in P2P digital flows',                description: 'Coverage review identified gap on P2P typologies. Build new scenario, validate, deploy.',                                                                                       severity: 'medium', status: 'in_remediation', source: 'self_identified', raisedDate: dateOnly(11, 0), targetCloseDate: dateOnly(-3, 0), actualCloseDate: null, daysOpen: 78,  ownerId: 'ACT-FCC-HEAD',     rootCause: 'Product evolution outpacing scenario coverage',             rootCauseClusterId: null,                            relatedControlIds: ['AML-C001'],                      relatedControlInstanceIds: [], relatedRiskIds: ['R-MR-AML'],     actionIds: ['ACT-2025-088-01'] }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: Root Cause Clusters (5)
  // ──────────────────────────────────────────────────────────────────────────
  const rootCauseClusters = [
    { id: 'CLUSTER-CAPACITY',                name: 'Capacity',                 description: 'Issues sharing the underlying driver of insufficient operating-team capacity vs. volume — concentrated in FCC investigations and MRM validation.', issueIds: ['ISS-2026-009','ISS-2026-031','ISS-2026-040','ISS-2026-052','ISS-2026-051'], severitySkew: 'high_skew',   trend: 'worsening', recommendedActions: ['Surge resourcing in AML L1/L2 pods (success rate 4/5)', 'Workflow re-prioritisation focusing on aged cases', 'Contracted MRM validation capacity through Q3'] },
    { id: 'CLUSTER-DATA-QUALITY',            name: 'Data Quality',             description: 'Issues sharing upstream data-quality root causes — malformed remittance, mapping changes, field optionality, refresh process gaps.',                  issueIds: ['ISS-2026-018','ISS-2026-046','ISS-2026-023','ISS-2026-038'],                 severitySkew: 'medium_skew', trend: 'stable',    recommendedActions: ['Upstream data quality fixes per source system', 'Required-field gating in LMS/CRM workflows', 'Automated reconciliation between source and downstream systems'] },
    { id: 'CLUSTER-THRESHOLD-CALIBRATION',   name: 'Threshold Calibration',    description: 'Model and scenario calibration issues driven by population shifts and typology evolution.',                                                            issueIds: ['ISS-2025-079','ISS-2025-072','ISS-2026-019'],                                  severitySkew: 'medium_skew', trend: 'stable',    recommendedActions: ['Targeted threshold review with governance approval', 'Outcomes-driven scenario tuning cycle'] },
    { id: 'CLUSTER-VENDOR-DELIVERY',         name: 'Vendor Delivery',          description: 'Issues driven by vendor failure to deliver assurance artefacts and disclosure obligations.',                                                              issueIds: ['ISS-2026-035','ISS-2025-098'],                                                  severitySkew: 'medium_skew', trend: 'worsening', recommendedActions: ['Contractual escalation with delivery dates', 'Interim controls bridge for stale assurance', 'Tiered remediation for 4th-party disclosure'] },
    { id: 'CLUSTER-DOCUMENTATION',           name: 'Documentation Standards',  description: 'Issues driven by absent or weak required-field gating and playbook ambiguity.',                                                                          issueIds: ['ISS-2026-012','ISS-2025-094','ISS-2026-007'],                                  severitySkew: 'low_skew',    trend: 'stable',    recommendedActions: ['Required-field workflow gating', 'Playbook revision with tabletop exercise'] }
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // BULK GENERATORS — ControlInstances, Evidence, AuditTrail
  // Patterns are narrative-aware:
  //   AML-C002 and WP-C003 follow the documented degradation curve
  //   Other controls follow stable patterns near their headline CES
  // ──────────────────────────────────────────────────────────────────────────

  const SOURCE_BY_CONTROL = {
    'WP-C001': 'payment_hub',     'WP-C002': 'screening_engine', 'WP-C003': 'payment_hub',
    'WP-C004': 'payment_hub',     'WP-C005': 'fraud_engine',     'WP-C006': 'recon_tool',
    'WP-C007': 'payment_hub',     'WP-C008': 'sanctions_filing', 'WP-C009': 'payment_hub',
    'CO-C001': 'idv_vendor',      'CO-C002': 'crm',              'CO-C003': 'crm',
    'CO-C004': 'crm',             'CO-C005': 'screening_engine', 'CO-C006': 'crm',
    'AML-C001':'aml_engine',      'AML-C002':'case_mgmt',        'AML-C003':'case_mgmt',
    'AML-C004':'case_mgmt',       'AML-C005':'sar_filing_system','AML-C006':'case_mgmt',
    'VO-C001': 'vendor_portal',   'VO-C002': 'vendor_portal',    'VO-C003': 'vendor_portal',
    'VO-C004': 'contract_mgmt',   'VO-C005': 'vendor_portal',
    'MV-C001': 'model_inventory', 'MV-C002': 'mrm_repo',         'MV-C003': 'mrm_repo',
    'MV-C004': 'mrm_repo',
    'LO-C001': 'lms',             'LO-C002': 'lms',              'LO-C003': 'lms',
    'LO-C004': 'lms',             'LO-C005': 'lms'
  };

  const EVIDENCE_TYPE_BY_CONTROL = {
    'WP-C001': 'system_log',     'WP-C002': 'system_log',     'WP-C003': 'recording',
    'WP-C004': 'system_log',     'WP-C005': 'system_log',     'WP-C006': 'document',
    'WP-C007': 'system_log',     'WP-C008': 'document',       'WP-C009': 'document',
    'CO-C001': 'api_response',   'CO-C002': 'document',       'CO-C003': 'computed',
    'CO-C004': 'document',       'CO-C005': 'system_log',     'CO-C006': 'attestation',
    'AML-C001': 'document',      'AML-C002': 'system_log',    'AML-C003': 'document',
    'AML-C004': 'attestation',   'AML-C005': 'document',      'AML-C006': 'document',
    'VO-C001': 'document',       'VO-C002': 'document',       'VO-C003': 'document',
    'VO-C004': 'document',       'VO-C005': 'document',
    'MV-C001': 'system_log',     'MV-C002': 'document',       'MV-C003': 'document',
    'MV-C004': 'attestation',
    'LO-C001': 'document',       'LO-C002': 'document',       'LO-C003': 'document',
    'LO-C004': 'document',       'LO-C005': 'document'
  };

  // Per-week pass rate, evidence completeness, and volume profile
  // weeksAgo runs 0..12 (0 = current week)
  const profileForControl = (controlId, weeksAgo) => {
    // The two narrative degraders: stable operating, declining catch + evidence
    if (controlId === 'AML-C002') {
      const w = 12 - weeksAgo; // 0 oldest .. 12 current
      // Operating rate stable around 98–99%
      const operating = fbetween(0.97, 0.995);
      // Catch rate degrades from 0.92 to 0.66
      const catch_ = 0.92 - (0.26 * (w / 12));
      // Evidence completeness degrades from 0.93 to 0.52
      const evCompleteness = 0.93 - (0.41 * (w / 12));
      const volume = ibetween(28, 48); // alerts per week per the SLA control
      return { operating, catch_, evCompleteness, volume, evidenceProb: evCompleteness, completenessJitter: 0.08 };
    }
    if (controlId === 'WP-C003') {
      const w = 12 - weeksAgo;
      const operating = fbetween(0.985, 0.998);
      const catch_ = 0.95 - (0.06 * (w / 12));
      // Evidence completeness — the "missing timestamps" pattern
      const evCompleteness = 0.92 - (0.22 * (w / 12));
      const volume = ibetween(14, 24);
      return { operating, catch_, evCompleteness, volume, evidenceProb: 0.97, completenessJitter: 0.10 };
    }
    if (controlId === 'AML-C003' || controlId === 'AML-C006') {
      const w = 12 - weeksAgo;
      const operating = fbetween(0.95, 0.99);
      const catch_ = 0.84 - (0.09 * (w / 12));
      const evCompleteness = 0.80 - (0.16 * (w / 12));
      return { operating, catch_, evCompleteness, volume: ibetween(8, 18), evidenceProb: 0.95, completenessJitter: 0.10 };
    }
    if (controlId === 'VO-C005') {
      const w = 12 - weeksAgo;
      return { operating: fbetween(0.82, 0.88), catch_: fbetween(0.62, 0.68), evCompleteness: 0.62 - (0.10 * (w / 12)), volume: ibetween(2, 5), evidenceProb: 0.85, completenessJitter: 0.15 };
    }
    if (controlId === 'MV-C002' || controlId === 'MV-C003') {
      const w = 12 - weeksAgo;
      return { operating: fbetween(0.72, 0.82), catch_: fbetween(0.74, 0.84), evCompleteness: 0.70 - (0.10 * (w / 12)), volume: ibetween(2, 4), evidenceProb: 0.92, completenessJitter: 0.10 };
    }
    if (controlId === 'WP-C006') {
      const w = 12 - weeksAgo;
      return { operating: fbetween(0.97, 0.995), catch_: fbetween(0.78, 0.88), evCompleteness: 0.78 - (0.12 * (w / 12)), volume: ibetween(5, 7), evidenceProb: 0.95, completenessJitter: 0.10 };
    }
    // Default — look at headline CES decomposition for a stable profile
    const c = controls.find(x => x.id === controlId);
    const op = (c?.cesDecomposition?.operatingRate ?? 95) / 100;
    const ca = (c?.cesDecomposition?.catchRate ?? 88) / 100;
    const ev = (c?.cesDecomposition?.evidenceCompleteness ?? 85) / 100;
    // Volume varies by frequency
    let volume = 6;
    switch (c?.frequency) {
      case 'per_event':    volume = ibetween(20, 40); break;
      case 'per_customer': volume = ibetween(15, 30); break;
      case 'per_case':     volume = ibetween(10, 20); break;
      case 'per_loan':     volume = ibetween(8, 16);  break;
      case 'per_vendor':   volume = ibetween(2, 5);   break;
      case 'per_model':    volume = ibetween(1, 3);   break;
      case 'daily':        volume = 7;                break;
      case 'monthly':      volume = ibetween(0, 1);   break;
      case 'quarterly':    volume = ibetween(0, 1);   break;
      case 'annual':       volume = ibetween(0, 1);   break;
      case 'cyclical':     volume = ibetween(1, 2);   break;
      default:             volume = ibetween(5, 12);
    }
    return { operating: op + fbetween(-0.02, 0.005), catch_: ca + fbetween(-0.04, 0.04), evCompleteness: ev + fbetween(-0.05, 0.05), volume, evidenceProb: 0.96, completenessJitter: 0.06 };
  };

  // ── Generate ControlInstances + Evidence + per-instance AuditTrail ────────
  const controlInstances = [];
  const evidence = [];
  const auditTrail = [];

  let ciCounter = 0;
  let evCounter = 0;
  let evtCounter = 0;
  let pxCounter = 0; // process executions are referenced by stepExecutionId / processExecutionId

  controls.forEach(control => {
    const sourceSystem = SOURCE_BY_CONTROL[control.id];
    const evType = EVIDENCE_TYPE_BY_CONTROL[control.id];
    const recent = [];
    for (let weeksAgo = 12; weeksAgo >= 0; weeksAgo--) {
      const profile = profileForControl(control.id, weeksAgo);
      for (let v = 0; v < profile.volume; v++) {
        const day = ibetween(0, 6);
        const ts = isoAt(weeksAgo, day);
        const expectedToFire = true;
        const fired = rand() < profile.operating;
        const caught = fired ? (rand() < profile.catch_ ? 'true' : 'false') : 'na';
        const exception = fired && caught === 'false';
        const isOverride = fired && rand() < 0.005;

        // Evidence handling
        const hasEvidence = fired && rand() < profile.evidenceProb;
        const evidenceIds = [];
        let completenessScore = 100;

        if (hasEvidence) {
          const completeness = Math.max(35, Math.min(100,
            Math.round(profile.evCompleteness * 100 + fbetween(-profile.completenessJitter, profile.completenessJitter) * 100)));
          completenessScore = completeness;
          evCounter++;
          const evId = uuid('EV', evCounter);
          const evRec = {
            id: evId,
            controlInstanceIds: [],
            type: evType,
            sourceSystem,
            timestamp: ts,
            ingestedAt: ts,
            payloadUri: `s3://evidence-bucket/${sourceSystem}/${dateOnly(weeksAgo, day)}/${evId}.${evType === 'document' ? 'pdf' : evType === 'recording' ? 'wav' : 'json'}`,
            hash: sha256ish(),
            hashVerified: true,
            completenessScore: completeness,
            collectionMethod: control.controlNature === 'automated' ? 'auto' : 'manual',
            linkedStepExecutionId: `STEPEX-${pad(ciCounter + 1)}`,
            retentionClass: 'regulatory'
          };
          evidence.push(evRec);
          evidenceIds.push(evId);
        }

        ciCounter++;
        pxCounter++;
        const instanceId = uuid('CI', ciCounter);
        const stepExecId = `STEPEX-${pad(ciCounter)}`;
        const processExecId = `PX-${pad(pxCounter)}`;

        // Back-link evidence to instance
        if (evidenceIds.length) {
          evidence[evidence.length - 1].controlInstanceIds.push(instanceId);
        }

        const status = isOverride ? 'override'
                      : !fired       ? 'pending'
                      : exception    ? 'exception'
                      :                'pass';

        const instance = {
          id: instanceId,
          controlId: control.id,
          controlVersion: 1,
          stepExecutionId: stepExecId,
          processExecutionId: processExecId,
          timestamp: ts,
          expectedToFire,
          fired,
          caughtWhatDesigned: caught,
          status,
          exceptionDisposition: exception ? (rand() < 0.6 ? 'resolved' : rand() < 0.5 ? 'escalated' : 'pending') : (isOverride ? 'override' : null),
          operatorId: control.controlNature === 'automated' ? 'ACT-SYS' : pick(['ACT-OPS-A','ACT-OPS-B','ACT-FCC-L1','ACT-FCC-L2','ACT-MRM','ACT-VENDOR','ACT-UW']),
          evidenceIds,
          latencyMs: control.controlNature === 'automated' ? ibetween(40, 600) : ibetween(2_000, 120_000),
          overrideReason: isOverride ? 'Time-critical client request — head of ops approved' : null
        };
        controlInstances.push(instance);
        if (recent.length < 10) recent.push(instanceId);

        // Audit events for each instance
        evtCounter++;
        auditTrail.push({
          id: uuid('EVT', evtCounter),
          timestamp: ts,
          actorId: instance.operatorId,
          actorType: control.controlNature === 'automated' ? 'system' : 'user',
          eventType: 'control_instance.fired',
          entityType: 'ControlInstance',
          entityId: instanceId,
          before: null,
          after: { status, fired, caughtWhatDesigned: caught },
          metadata: { controlId: control.id, sourceSystem, latencyMs: instance.latencyMs },
          relatedEventIds: []
        });

        if (hasEvidence) {
          evtCounter++;
          auditTrail.push({
            id: uuid('EVT', evtCounter),
            timestamp: ts,
            actorId: instance.operatorId,
            actorType: control.controlNature === 'automated' ? 'system' : 'user',
            eventType: 'evidence.captured',
            entityType: 'Evidence',
            entityId: evidenceIds[0],
            before: null,
            after: { hash: evidence[evidence.length - 1].hash, completenessScore },
            metadata: { controlInstanceId: instanceId, sourceSystem, type: evType },
            relatedEventIds: [`EVT-${pad(evtCounter - 1)}`]
          });
        }

        if (exception) {
          evtCounter++;
          auditTrail.push({
            id: uuid('EVT', evtCounter),
            timestamp: ts,
            actorId: instance.operatorId,
            actorType: 'user',
            eventType: 'control_instance.exception_raised',
            entityType: 'ControlInstance',
            entityId: instanceId,
            before: null,
            after: { exceptionDisposition: instance.exceptionDisposition },
            metadata: { controlId: control.id, severity: rand() < 0.3 ? 'high' : 'medium' },
            relatedEventIds: [`EVT-${pad(evtCounter - 1 - (hasEvidence ? 1 : 0))}`]
          });
        }
      }
    }
    control.recentInstanceIds = recent;
  });

  // Link issues to specific failing control instances (the demo's empirical thread)
  const failuresFor = (controlId, n) => controlInstances
    .filter(ci => ci.controlId === controlId && (ci.status === 'exception' || ci.status === 'override' || (ci.evidenceIds.length === 0)))
    .slice(-n)
    .map(ci => ci.id);

  issues.forEach(issue => {
    const linked = [];
    issue.relatedControlIds.forEach(cid => linked.push(...failuresFor(cid, 3)));
    issue.relatedControlInstanceIds = linked.slice(0, 8);
  });

  // ── Issue lifecycle audit events ──────────────────────────────────────────
  issues.forEach(issue => {
    evtCounter++;
    auditTrail.push({
      id: uuid('EVT', evtCounter),
      timestamp: isoAt(Math.floor((new Date(ANCHOR.getTime() - new Date(issue.raisedDate + 'T12:00:00Z').getTime()) / (7 * DAY_MS))), 0),
      actorId: issue.ownerId,
      actorType: 'user',
      eventType: 'issue.created',
      entityType: 'Issue',
      entityId: issue.id,
      before: null,
      after: { severity: issue.severity, status: 'open', source: issue.source },
      metadata: { rootCauseClusterId: issue.rootCauseClusterId, relatedControlIds: issue.relatedControlIds },
      relatedEventIds: []
    });
    // 2–4 lifecycle updates per issue
    const updates = ibetween(2, 4);
    for (let u = 0; u < updates; u++) {
      evtCounter++;
      auditTrail.push({
        id: uuid('EVT', evtCounter),
        timestamp: isoAt(ibetween(0, 8), ibetween(0, 6)),
        actorId: issue.ownerId,
        actorType: 'user',
        eventType: u === updates - 1 ? 'issue.status_changed' : 'issue.updated',
        entityType: 'Issue',
        entityId: issue.id,
        before: { status: 'open' },
        after: { status: 'in_remediation', daysOpen: issue.daysOpen },
        metadata: { note: 'Action plan progress update' },
        relatedEventIds: []
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // ENTITY: AI Insights (18) — drives the demo's anomaly + "what changed" + RCA
  // ──────────────────────────────────────────────────────────────────────────
  const aiInsights = [
    // ─── Anomaly detection ───
    {
      id: 'AI-INS-001',
      type: 'anomaly',
      title: 'AML alert backlog acceleration outside seasonal pattern',
      summary: 'Backlog growth rate over the last 3 weeks is 2.4× the 3-year seasonal envelope for this period. Current trajectory projects red appetite breach within 6 days.',
      confidence: 0.97,
      modelId: 'anomaly-detector-v3.2',
      modelVersion: '3.2.1',
      generatedAt: isoAt(0, 1),
      personaRelevance: ['cro','risk_lead'],
      screenRelevance: ['risk_posture_cockpit','what_changed','issue_intelligence'],
      sourceRecordIds: ['KRI-FC-016','ISS-2026-009','APP-FC-002'],
      counterfactual: 'If L1/L2 throughput were 12% higher week-over-week, backlog would remain in amber band.',
      relatedEntityIds: ['R-FC-AML','AML-C002'],
      severity: 'high',
      acted: false
    },
    {
      id: 'AI-INS-002',
      type: 'anomaly',
      title: 'Wire callback evidence completeness pattern',
      summary: 'Pattern detected: missing timestamp/recorded-number fields on callback evidence accelerated from 4% to 28% over 13 weeks. Operating rate is unchanged — controls are firing but evidence quality is degrading.',
      confidence: 0.94,
      modelId: 'evidence-quality-detector-v2',
      modelVersion: '2.4.0',
      generatedAt: isoAt(0, 2),
      personaRelevance: ['risk_lead','auditor'],
      screenRelevance: ['control_universe','evidence_workbench'],
      sourceRecordIds: ['ISS-2026-012'],
      counterfactual: 'Required-field gating in payment_hub would eliminate ~85% of incomplete evidence records.',
      relatedEntityIds: ['WP-C003'],
      severity: 'medium',
      acted: false
    },
    {
      id: 'AI-INS-003',
      type: 'anomaly',
      title: 'Vendor 4th-party disclosure stagnation',
      summary: 'Disclosure completeness for Critical vendors flat at 78% for 11 consecutive weeks despite contractual amendment campaign. Underlying signal: vendor non-response, not bank process gap.',
      confidence: 0.86,
      modelId: 'anomaly-detector-v3.2',
      modelVersion: '3.2.1',
      generatedAt: isoAt(1, 3),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['obligation_coverage_map','issue_intelligence'],
      sourceRecordIds: ['ISS-2025-098','OBL-OCC-2023-17-005'],
      counterfactual: 'Contractual escalation to legal would unblock ~60% based on vendor cohort benchmarks.',
      relatedEntityIds: ['VO-C005'],
      severity: 'medium',
      acted: false
    },
    // ─── What-changed summaries (weekly) ───
    {
      id: 'AI-INS-004',
      type: 'what_changed',
      title: 'Week of 2026-04-19: Risk exposure rose 6 points',
      summary: 'Enterprise RES rose from 58 to 64 (amber). Concentrated in Financial Crime (▲9, driven by AML backlog crossing red on Tuesday) and Model Risk (▲8, driven by 5 re-validations now past due). Wire and Credit domains stable. No changes in Tech & Cyber or Compliance & Conduct.',
      confidence: 0.99,
      modelId: 'narrative-generator-v4',
      modelVersion: '4.1.0',
      generatedAt: isoAt(0, 0),
      personaRelevance: ['cro'],
      screenRelevance: ['what_changed','risk_posture_cockpit'],
      sourceRecordIds: ['R-FC-AML','R-MR-VAL','APP-FC-002','APP-MR-001'],
      counterfactual: null,
      relatedEntityIds: ['R-FC-AML','R-MR-VAL'],
      severity: 'high',
      acted: false
    },
    {
      id: 'AI-INS-005',
      type: 'what_changed',
      title: 'Week of 2026-04-12: AML KRIs deteriorated; Credit improved',
      summary: 'AML alert backlog moved from amber to red. EDD past-due cases now 11 (amber). Credit policy-exception rate declined 0.4 pts (improving). Wire fraud loss flat.',
      confidence: 0.98,
      modelId: 'narrative-generator-v4',
      modelVersion: '4.1.0',
      generatedAt: isoAt(1, 0),
      personaRelevance: ['cro'],
      screenRelevance: ['what_changed'],
      sourceRecordIds: ['R-FC-AML','APP-FC-002'],
      counterfactual: null,
      relatedEntityIds: ['R-FC-AML'],
      severity: 'medium',
      acted: false
    },
    // ─── Root cause inference ───
    {
      id: 'AI-INS-006',
      type: 'root_cause_inference',
      title: 'Capacity is the dominant root cause across 5 issues spanning AML and Model Risk',
      summary: 'Five open issues across AML investigations and MRM — superficially in different functions — share a computed root-cause signature: insufficient operating-team capacity vs. volume. Pattern matches 4 historical clusters. Surge resourcing was the successful remediation in 4 of 5 prior cases.',
      confidence: 0.92,
      modelId: 'rca-cluster-engine-v2',
      modelVersion: '2.3.0',
      generatedAt: isoAt(0, 3),
      personaRelevance: ['cro','risk_lead'],
      screenRelevance: ['issue_intelligence','risk_posture_cockpit'],
      sourceRecordIds: ['ISS-2026-009','ISS-2026-031','ISS-2026-040','ISS-2026-052','ISS-2026-051'],
      counterfactual: 'If FCC L2 + MRM headcount were +8 in aggregate, model projects all 5 issues into recovery within 9 weeks.',
      relatedEntityIds: ['CLUSTER-CAPACITY'],
      severity: 'high',
      acted: false
    },
    {
      id: 'AI-INS-007',
      type: 'root_cause_inference',
      title: 'Documentation-standard cluster: 3 issues share absent required-field gating',
      summary: 'Wire callback documentation, sanctions weekend SLA, and wire recall playbook share a common root-cause signature: absent or weak required-field/SLA gating. Workflow gating remediation has succeeded in 3/3 prior cases.',
      confidence: 0.84,
      modelId: 'rca-cluster-engine-v2',
      modelVersion: '2.3.0',
      generatedAt: isoAt(2, 1),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['issue_intelligence'],
      sourceRecordIds: ['ISS-2026-012','ISS-2025-094','ISS-2026-007'],
      counterfactual: null,
      relatedEntityIds: ['CLUSTER-DOCUMENTATION'],
      severity: 'medium',
      acted: false
    },
    // ─── Predictive ───
    {
      id: 'AI-INS-008',
      type: 'predictive',
      title: 'Model Risk RES projected to breach red by week 14',
      summary: 'On current trajectory, Model Risk RES projects to breach the red appetite threshold within 7–10 days. Driver: continued slippage on the 5 past-due re-validations + 2 expected to enter past-due status this week.',
      confidence: 0.88,
      modelId: 'predictive-projector-v1',
      modelVersion: '1.6.0',
      generatedAt: isoAt(0, 1),
      personaRelevance: ['cro'],
      screenRelevance: ['risk_posture_cockpit','emerging_risks'],
      sourceRecordIds: ['R-MR-VAL','APP-MR-001','ISS-2026-051'],
      counterfactual: 'Closing 2 of the 5 past-due re-validations within 5 days delays projected breach by 4 weeks.',
      relatedEntityIds: ['R-MR-VAL'],
      severity: 'high',
      acted: false
    },
    {
      id: 'AI-INS-009',
      type: 'predictive',
      title: 'AML-C002 effectiveness decay projects below 60 within 2 weeks',
      summary: 'AML Disposition SLA Control CES has fallen from 88 to 64 over 13 weeks driven entirely by evidence completeness decay. Projection: drop below 60 (Ineffective band) within 2 weeks if capacity intervention does not occur.',
      confidence: 0.91,
      modelId: 'predictive-projector-v1',
      modelVersion: '1.6.0',
      generatedAt: isoAt(0, 2),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['control_universe'],
      sourceRecordIds: ['AML-C002'],
      counterfactual: null,
      relatedEntityIds: ['AML-C002'],
      severity: 'high',
      acted: false
    },
    // ─── Reg change impact ───
    {
      id: 'AI-INS-010',
      type: 'reg_change_impact',
      title: 'Draft impact assessment: hypothetical OCC TPRM update',
      summary: 'Simulated regulatory change: proposed enhancement to OBL-OCC-2023-17-005 (4th-party material disclosure). Lineage trace: 1 obligation → 1 control (VO-C005) → 1 process (Vendor Onboarding) → 12 active vendor relationships affected. Coverage gap exposed: only 1 control mapped to this obligation, currently in Needs Improvement band.',
      confidence: 0.95,
      modelId: 'reg-change-impact-v1',
      modelVersion: '1.2.0',
      generatedAt: isoAt(1, 4),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['obligation_coverage_map'],
      sourceRecordIds: ['OBL-OCC-2023-17-005','VO-C005'],
      counterfactual: null,
      relatedEntityIds: ['OBL-OCC-2023-17-005'],
      severity: 'medium',
      acted: false
    },
    // ─── Drift on platform's own AI ───
    {
      id: 'AI-INS-011',
      type: 'meta_control_drift',
      title: 'Anomaly detector drift within tolerance',
      summary: 'Anomaly detector v3.2 false-positive rate stable at 6.8% over the last 30 days, within the 8% tolerance. No drift action required.',
      confidence: 1.00,
      modelId: 'meta-monitor-v1',
      modelVersion: '1.1.0',
      generatedAt: isoAt(0, 0),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['control_universe'],
      sourceRecordIds: [],
      counterfactual: null,
      relatedEntityIds: [],
      severity: 'low',
      acted: false
    },
    // ─── Audit / evidence insights ───
    {
      id: 'AI-INS-012',
      type: 'evidence_pattern',
      title: 'Evidence pattern: 14 wire callbacks in March missing required fields',
      summary: 'Population query identifies 14 callback evidence records with completenessScore < 70. All from Pod B; concentrated on Tuesday/Wednesday afternoon shifts. Pattern signature consistent with rushed handling, not system fault.',
      confidence: 0.89,
      modelId: 'evidence-quality-detector-v2',
      modelVersion: '2.4.0',
      generatedAt: isoAt(2, 4),
      personaRelevance: ['auditor'],
      screenRelevance: ['evidence_workbench','reperformance_console'],
      sourceRecordIds: [],
      counterfactual: null,
      relatedEntityIds: ['WP-C003','ISS-2026-012'],
      severity: 'medium',
      acted: false
    },
    {
      id: 'AI-INS-013',
      type: 'evidence_pattern',
      title: 'AML investigation memos shortened by 32% in week 11',
      summary: 'Average documentation length per AML disposition fell 32% in week 11 vs. 8-week baseline. Correlates with backlog acceleration. Indicates rushed handling on under-resourced cases.',
      confidence: 0.83,
      modelId: 'evidence-quality-detector-v2',
      modelVersion: '2.4.0',
      generatedAt: isoAt(1, 5),
      personaRelevance: ['auditor','risk_lead'],
      screenRelevance: ['evidence_workbench','control_universe'],
      sourceRecordIds: ['AML-C003'],
      counterfactual: null,
      relatedEntityIds: ['AML-C002','AML-C003'],
      severity: 'medium',
      acted: false
    },
    {
      id: 'AI-INS-014',
      type: 'thematic_root_cause',
      title: 'Cross-cluster signal: capacity stress correlates with documentation decay',
      summary: 'Two of the largest clusters (Capacity, Documentation Standards) share a correlated trend over the last 8 weeks. Hypothesis: capacity stress is causing documentation shortcuts. Recommend treating documentation-standard issues as derivative of the capacity remediation.',
      confidence: 0.78,
      modelId: 'thematic-rca-v1',
      modelVersion: '1.0.4',
      generatedAt: isoAt(1, 0),
      personaRelevance: ['risk_lead','cro'],
      screenRelevance: ['issue_intelligence','risk_posture_cockpit'],
      sourceRecordIds: [],
      counterfactual: null,
      relatedEntityIds: ['CLUSTER-CAPACITY','CLUSTER-DOCUMENTATION'],
      severity: 'medium',
      acted: false
    },
    // ─── Process-level insights ───
    {
      id: 'AI-INS-015',
      type: 'process_drift',
      title: 'AML disposition process: novel variant detected (skipped L2 → L3)',
      summary: '7% of dispositions in the last 4 weeks bypassed L2 review and routed directly L1 → L3. Variant is undocumented. Likely capacity-driven workaround; review against AML-C002 design condition needed.',
      confidence: 0.91,
      modelId: 'process-mining-v3',
      modelVersion: '3.1.0',
      generatedAt: isoAt(0, 4),
      personaRelevance: ['risk_lead','auditor'],
      screenRelevance: ['control_universe','reperformance_console'],
      sourceRecordIds: [],
      counterfactual: null,
      relatedEntityIds: ['PROC-AML','AML-C002'],
      severity: 'medium',
      acted: false
    },
    {
      id: 'AI-INS-016',
      type: 'predictive',
      title: 'AML appetite breach probability: 96% within 5 days at current rate',
      summary: 'Combining backlog growth, capacity stress signals, and historical analogs, AML appetite breach probability at 96% within 5 business days absent capacity intervention.',
      confidence: 0.94,
      modelId: 'predictive-projector-v1',
      modelVersion: '1.6.0',
      generatedAt: isoAt(0, 0),
      personaRelevance: ['cro'],
      screenRelevance: ['risk_posture_cockpit'],
      sourceRecordIds: ['R-FC-AML','APP-FC-002'],
      counterfactual: null,
      relatedEntityIds: ['R-FC-AML'],
      severity: 'high',
      acted: false
    },
    {
      id: 'AI-INS-017',
      type: 'thematic_root_cause',
      title: 'Recommended remediation: apply Capacity-cluster surge playbook',
      summary: 'Past remediation pattern (4 of 5 successful) suggests: (1) +8 FCC L2 surge (contracted) for 12 weeks, (2) MRM validation contractor through Q3, (3) workflow re-prioritisation gating cases by appetite-impact. Estimated time to AML appetite recovery: 9 weeks.',
      confidence: 0.87,
      modelId: 'remediation-recommender-v2',
      modelVersion: '2.1.0',
      generatedAt: isoAt(0, 1),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['issue_intelligence'],
      sourceRecordIds: [],
      counterfactual: null,
      relatedEntityIds: ['CLUSTER-CAPACITY'],
      severity: 'high',
      acted: false
    },
    {
      id: 'AI-INS-018',
      type: 'obligation_coverage',
      title: 'Thinly covered obligation: OBL-OCC-2023-17-005 mapped to single weak control',
      summary: 'OBL-OCC-2023-17-005 (4th-party subcontractor disclosure) is currently mitigated by a single control (VO-C005) which is in Needs Improvement (CES 58, worsening). Recommend (a) supplemental control on the bank side, (b) escalation on disclosure gap, (c) interim risk acceptance from Vendor Risk Committee.',
      confidence: 0.96,
      modelId: 'coverage-gap-detector-v1',
      modelVersion: '1.3.0',
      generatedAt: isoAt(2, 0),
      personaRelevance: ['risk_lead'],
      screenRelevance: ['obligation_coverage_map'],
      sourceRecordIds: ['OBL-OCC-2023-17-005','VO-C005'],
      counterfactual: null,
      relatedEntityIds: ['OBL-OCC-2023-17-005'],
      severity: 'medium',
      acted: false
    }
  ];

  // ── AI-insight audit events ──────────────────────────────────────────────
  aiInsights.forEach(ins => {
    evtCounter++;
    auditTrail.push({
      id: uuid('EVT', evtCounter),
      timestamp: ins.generatedAt,
      actorId: 'ACT-AI-' + (ins.modelId || 'platform'),
      actorType: 'ai_agent',
      eventType: 'ai_insight.generated',
      entityType: 'AIInsight',
      entityId: ins.id,
      before: null,
      after: { type: ins.type, severity: ins.severity, confidence: ins.confidence },
      metadata: { modelId: ins.modelId, modelVersion: ins.modelVersion, sourceRecordIds: ins.sourceRecordIds },
      relatedEventIds: []
    });
  });

  // ── Appetite breach + KRI threshold events for the demo's headline beats ──
  const appetiteBeats = [
    { metricId: 'APP-FC-002', weeksAgo: 11, day: 2, eventType: 'appetite.breached',  before: { band: 'amber' }, after: { band: 'red',   value: 5.2 }, note: 'AML alert backlog crossed 5% threshold' },
    { metricId: 'APP-MR-001', weeksAgo: 8,  day: 4, eventType: 'appetite.breached',  before: { band: 'amber' }, after: { band: 'red',   value: 5    }, note: 'Past-due model re-validations crossed tolerance' },
    { metricId: 'APP-MR-002', weeksAgo: 6,  day: 1, eventType: 'appetite.breached',  before: { band: 'amber' }, after: { band: 'red',   value: 16   }, note: 'Open high-severity MRM findings crossed 15' },
    { metricId: 'APP-OP-002', weeksAgo: 7,  day: 0, eventType: 'appetite.threshold', before: { band: 'green' }, after: { band: 'amber', value: 95   }, note: 'Aged nostro reconciling items entered amber band' },
    { metricId: 'APP-CC-001', weeksAgo: 5,  day: 3, eventType: 'appetite.threshold', before: { band: 'green' }, after: { band: 'amber', value: 1.35 }, note: 'Pricing-exception disparity ratio entered amber' },
    { metricId: 'APP-CC-003', weeksAgo: 4,  day: 1, eventType: 'appetite.threshold', before: { band: 'green' }, after: { band: 'amber', value: 3.4  }, note: 'HMDA validation error rate entered amber' }
  ];
  appetiteBeats.forEach(beat => {
    evtCounter++;
    auditTrail.push({
      id: uuid('EVT', evtCounter),
      timestamp: isoAt(beat.weeksAgo, beat.day),
      actorId: 'ACT-SYS',
      actorType: 'system',
      eventType: beat.eventType,
      entityType: 'AppetiteMetric',
      entityId: beat.metricId,
      before: beat.before,
      after: beat.after,
      metadata: { note: beat.note },
      relatedEventIds: []
    });
  });

  // ── Drill-activity events (synthetic user activity for time-travel realism)
  const drillSeed = ibetween(60, 100);
  for (let i = 0; i < drillSeed; i++) {
    evtCounter++;
    const target = pick([
      { type: 'Risk',       id: pick(risks).id },
      { type: 'Control',    id: pick(controls).id },
      { type: 'Issue',      id: pick(issues).id },
      { type: 'Obligation', id: pick(obligations).id }
    ]);
    auditTrail.push({
      id: uuid('EVT', evtCounter),
      timestamp: isoAt(ibetween(0, 12), ibetween(0, 6)),
      actorId: pick(['ACT-CRO','ACT-CCO','ACT-AUDIT-MGR','ACT-FCC-HEAD','ACT-MRM-HEAD','ACT-VENDOR-HEAD']),
      actorType: 'user',
      eventType: 'drill.opened',
      entityType: target.type,
      entityId: target.id,
      before: null,
      after: null,
      metadata: { fromScreen: pick(['risk_posture_cockpit','what_changed','control_universe','obligation_coverage_map','issue_intelligence','evidence_workbench']) },
      relatedEventIds: []
    });
  }

  // Sort audit trail chronologically
  auditTrail.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // ──────────────────────────────────────────────────────────────────────────
  return {
    risks,
    controls,
    obligations,
    regulations,
    processes,
    processSteps,
    controlInstances,
    evidence,
    issues,
    rootCauseClusters,
    aiInsights,
    auditTrail
  };
})();

export default mockData;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mockData;
}
