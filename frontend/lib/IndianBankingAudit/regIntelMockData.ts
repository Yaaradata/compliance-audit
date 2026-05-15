/**
 * Regulatory Intelligence Inbox — mock data (ORI V1 Pass 2 seed; **V2 Pass 2** real-instrument migration).
 * Source of truth: `components/IndianBankingAudit/REG_INTEL_SPEC.md` §7–§9, V2 §§16–18.
 */

export type RegSource = 'RBI' | 'FIU-IND' | 'CERT-IN' | 'MOF' | 'SEBI' | 'NPCI';

export type SyncSourceStatus = 'fresh' | 'stale' | 'syncing' | 'error';

export interface SyncSourceState {
  source: RegSource;
  last_synced_at: string;
  status: SyncSourceStatus;
  records_pulled_today: number;
}

/** V2 Pass 5 — demo per-source sync row for the authenticity strip. */
export const syncStateSeed: SyncSourceState[] = [
  { source: 'RBI', last_synced_at: '2026-05-14T09:32:00+05:30', status: 'fresh', records_pulled_today: 4 },
  { source: 'FIU-IND', last_synced_at: '2026-05-14T09:30:00+05:30', status: 'fresh', records_pulled_today: 0 },
  { source: 'CERT-IN', last_synced_at: '2026-05-14T09:28:00+05:30', status: 'fresh', records_pulled_today: 0 },
  { source: 'SEBI', last_synced_at: '2026-05-14T08:45:00+05:30', status: 'fresh', records_pulled_today: 0 },
  { source: 'NPCI', last_synced_at: '2026-05-14T09:15:00+05:30', status: 'fresh', records_pulled_today: 1 },
  { source: 'MOF', last_synced_at: '2026-05-13T18:00:00+05:30', status: 'stale', records_pulled_today: 0 },
];

export type InstrumentType =
  | 'MASTER DIRECTION AMENDMENT'
  | 'CIRCULAR'
  | 'GUIDANCE NOTE'
  | 'DIRECTION'
  | 'DRAFT DIRECTION'
  | 'PEER ENFORCEMENT SIGNAL'
  | 'OPERATIONAL CIRCULAR';

export type GovernanceTrack = 'emergency' | 'expedited' | 'standard' | 'advisory';

export type RegStage = 'acknowledge' | 'assess' | 'assign' | 'implement' | 'certify' | 'closed';

export type HitlStatus = 'pending' | 'approved' | 'rejected';

export type CoverageStatus = 'uncovered' | 'partial' | 'covered' | 'unknown';

export interface ObligationRecord {
  id: string;
  text: string;
  domain: string;
  effective_date: string;
  confidence: number;
  hitl_status: HitlStatus;
  coverage_status: CoverageStatus;
  linked_controls: string[];
  linked_control_ces: number | null;
  reviewer: string | null;
  reviewed_at: string | null;
  /** V2 — paragraph anchor in source instrument (e.g. Para 38(a)). */
  cited_paragraph: string;
  /** V2 — verbatim excerpt from source for demo / Source Document Viewer. */
  cited_paragraph_text: string;
}

export interface RegAlertRecord {
  id: string;
  source: RegSource | 'IBA';
  source_label: string;
  instrument_type: InstrumentType;
  instrument_name: string;
  instrument_ref: string;
  publication_date: string;
  effective_date: string | null;
  days_to_effective: number | null;
  consultation_deadline: string | null;
  materiality_score: number;
  materiality_reason: string;
  escalation_tier: 1 | 2 | 3 | 4;
  governance_track: GovernanceTrack;
  stage: RegStage;
  stage_index: 1 | 2 | 3 | 4 | 5;
  obligations_total: number;
  obligations_approved: number;
  obligations_pending_hitl: number;
  uncovered_count: number;
  partial_count: number;
  covered_count: number;
  pas_created: number;
  pas_closed: number;
  accountable_sm: string;
  accountable_sm_role: string;
  domain: string;
  penalty_exposure: string[];
  is_peer_signal: boolean;
  peer_penalty_amount: string | null;
  peer_similarity_pct: number | null;
  peer_similar_to: string | null;
  obligations: ObligationRecord[];
  ai_narrative: string;
  ai_citations: number;
  ai_model: string;
  source_url: string;
  unread: boolean;
  /** V2 */
  issuing_authority: string;
  signatory_role: string;
  legal_basis: string | null;
  last_synced_at: string;
  source_verified: boolean;
  source_hash: string;
  para_anchors: string[];
  key_provisions: string[];
}

export interface KPISummary {
  total_in_flight: number;
  pending_cco_ack: number;
  effective_within_30_days: number;
  uncovered_obligations: number;
  pending_hitl: number;
  mtta_hours: number;
  mttc_days: number;
  sources_active: string[];
}

/** V2 — ingest / sync status strip (Pass 5). */
export interface SyncState {
  sources_status: Record<string, { last_synced_at: string; status: string; records_pulled: number }>;
  is_syncing: boolean;
  last_global_sync: string;
}

export const alerts: RegAlertRecord[] = [
  {
    id: 'REG-ALERT-2026-0047',
    source: 'RBI',
    source_label: 'Reserve Bank of India',
    instrument_type: 'MASTER DIRECTION AMENDMENT',
    instrument_name:
      'Reserve Bank of India (Know Your Customer (KYC)) (Amendment) Directions, 2025',
    instrument_ref: 'RBI/2025-26/51 DOR.AML.REC.30/14.01.001/2025-26',
    publication_date: '2025-06-12',
    effective_date: '2026-01-01',
    days_to_effective: -133,
    consultation_deadline: null,
    materiality_score: 88,
    materiality_reason:
      'Bank-wide KYC programme change. Sets the 1-year periodic update window for low-risk customers and mandates 3 advance intimations + 3 reminders with audit trail. Implementation deadline January 1, 2026 has passed — RE must demonstrate compliance evidence.',
    escalation_tier: 1,
    governance_track: 'expedited',
    stage: 'implement',
    stage_index: 4,
    obligations_total: 3,
    obligations_approved: 3,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 1,
    covered_count: 2,
    pas_created: 2,
    pas_closed: 1,
    accountable_sm: 'Priya Patel',
    accountable_sm_role: 'Head of Financial Crime Compliance',
    domain: 'AML / KYC',
    penalty_exposure: ['s.47A', 'PMLA'],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Chief General Manager, RBI',
    legal_basis: 'Sections 35A and 56 of the Banking Regulation Act, 1949 read with PMLA, 2002',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xa1b2c3d4e5f6',
    para_anchors: ['Para 38', 'Para 38(a)', 'Para 38(e)'],
    key_provisions: [
      'Periodic KYC update window extended to 1 year from due date or June 30, 2026 — whichever is later — for low-risk individual customers.',
      'REs to issue at least 3 advance intimations including 1 by letter before the periodic KYC due date.',
      'REs to issue 3 reminders including 1 by letter after the due date.',
      'Audit trail of all intimations and reminders to be maintained in RE systems against each customer.',
      'Implementation deadline: January 1, 2026.',
    ],
    obligations: [
      {
        id: 'OBL-RBI-KYC-047-A',
        text: 'REs shall complete periodic updation of KYC for low-risk individual customers within one year of the due date or by June 30, 2026, whichever is later. Accounts of such customers shall be subjected to regular monitoring.',
        domain: 'AML / KYC',
        effective_date: '2026-01-01',
        confidence: 94,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['AML-C001'],
        linked_control_ces: 82,
        reviewer: 'Sophie Williams',
        reviewed_at: '2026-05-10T14:22:00Z',
        cited_paragraph: 'Para 38(a)',
        cited_paragraph_text:
          'The Regulated Entity (RE) shall complete the periodic updation of KYC within one year of its falling due for KYC or upto June 30, 2026, whichever is later.',
      },
      {
        id: 'OBL-RBI-KYC-047-B',
        text: 'REs shall issue at least three advance intimations, including at least one by letter, at appropriate intervals prior to the due date of periodic updation of KYC. Communications shall outline KYC instructions, escalation mechanism for help, and consequences of non-update.',
        domain: 'AML / KYC',
        effective_date: '2026-01-01',
        confidence: 91,
        hitl_status: 'approved',
        coverage_status: 'partial',
        linked_controls: ['AML-C004'],
        linked_control_ces: 71,
        reviewer: 'Marcus L.',
        reviewed_at: '2026-05-11T09:05:00Z',
        cited_paragraph: 'Para 38(e)',
        cited_paragraph_text:
          'The RE shall intimate its customers, in advance, to update their KYC. Prior to the due date of periodic updation of KYC, the RE shall give at least three advance intimations, including at least one intimation by letter, at appropriate intervals to its customers.',
      },
      {
        id: 'OBL-RBI-KYC-047-C',
        text: 'REs shall maintain a record of advance intimations and reminders against each customer in their systems for audit trail. The ultimate responsibility for periodic KYC updation remains with the bank concerned.',
        domain: 'AML / KYC',
        effective_date: '2026-01-01',
        confidence: 89,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['AML-C001', 'AML-C007'],
        linked_control_ces: 84,
        reviewer: 'Priya Patel',
        reviewed_at: '2026-05-12T16:42:00Z',
        cited_paragraph: 'Para 38(e)',
        cited_paragraph_text:
          'Issue of such advance intimation/reminder shall be duly recorded in the RE\'s system against each customer for audit trail.',
      },
    ],
    ai_narrative:
      'The RBI KYC (Amendment) Directions, 2025 dated June 12, 2025 introduce a structured periodic-KYC reminder regime that has now reached its January 1, 2026 implementation deadline [Pack §38(a)]. The bank\'s three extracted obligations are all approved by ORM; CTRL-AML-C004 remains at CES 71 — short of the 78 internal target — and a preventive action is in flight to bring the reminder-by-letter pipeline above target [Pack §38(e)]. With the effective date now in the past, the RBI focus shifts to evidence of compliance during the next AFI — the assigned PA closes the audit-trail recording gap which would otherwise show up as a Section 47A(1)(c) finding [Pack §38(e)].',
    ai_citations: 3,
    ai_model: 'narrative-generator-v4.1',
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/reserve-bank-of-india-know-your-customer-kyc-amendment-directions-2025',
    unread: false,
  },
  {
    id: 'REG-ALERT-2026-0061',
    source: 'RBI',
    source_label: 'Reserve Bank of India',
    instrument_type: 'MASTER DIRECTION AMENDMENT',
    instrument_name:
      'Major MD Consolidation — RBI (Commercial Banks – Know Your Customer) Directions, 2025 + 9 sectoral KYC MDs (3500 instruments → 238 MDs)',
    instrument_ref: 'RBI/DOR/2025-26/238-series',
    publication_date: '2025-11-28',
    effective_date: '2025-11-28',
    days_to_effective: -167,
    consultation_deadline: null,
    materiality_score: 95,
    materiality_reason:
      'Bank-wide regulatory framework consolidation — 3500 circulars/directions condensed into 238 MDs, 9445 circulars formally withdrawn. Every internal policy, SOP and control mapping referencing the pre-2025 circulars needs re-anchoring. Highest-impact regulatory event of the year.',
    escalation_tier: 1,
    governance_track: 'expedited',
    stage: 'assess',
    stage_index: 2,
    obligations_total: 4,
    obligations_approved: 2,
    obligations_pending_hitl: 2,
    uncovered_count: 1,
    partial_count: 2,
    covered_count: 1,
    pas_created: 6,
    pas_closed: 2,
    accountable_sm: 'Sandeep Rao',
    accountable_sm_role: 'Chief Risk Officer',
    domain: 'Regulatory Framework',
    penalty_exposure: ['s.47A'],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Executive Director, RBI',
    legal_basis: 'Banking Regulation Act, 1949; RBI Act, 1934; PMLA, 2002; FEMA, 1999',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xb2c3d4e5f6a1',
    para_anchors: ['Para 1', 'Para 3', 'Para 5'],
    key_provisions: [
      'Consolidates approximately 3500 circulars and directions into 238 Master Directions.',
      '9445 circulars formally withdrawn on November 28, 2025.',
      '10 sectoral KYC Master Directions replace the single 2016 KYC MD — separate MDs for commercial banks, NBFCs, payments banks, cooperative banks etc.',
      'Aadhaar reiterated as not mandatory for general KYC except for Section 7 Aadhaar Act benefits.',
      'Facial gestures (blinking, smiling) not mandatory for liveness check in V-CIP.',
    ],
    obligations: [
      {
        id: 'OBL-RBI-CB-KYC-001',
        text: 'Commercial banks shall align all internal KYC SOPs, policy documents, and control mappings to the new RBI (Commercial Banks — Know Your Customer) Directions, 2025, replacing all references to the repealed 2016 Master Direction.',
        domain: 'AML / KYC',
        effective_date: '2025-11-28',
        confidence: 92,
        hitl_status: 'approved',
        coverage_status: 'partial',
        linked_controls: ['AML-C001', 'AML-C002', 'AML-C006'],
        linked_control_ces: 68,
        reviewer: 'Priya Patel',
        reviewed_at: '2025-12-15T11:00:00Z',
        cited_paragraph: 'Para 1',
        cited_paragraph_text:
          'These Directions shall be called the Reserve Bank of India (Commercial Banks – Know Your Customer) Directions, 2025.',
      },
      {
        id: 'OBL-RBI-CB-KYC-002',
        text: 'V-CIP liveness checks shall not mandate specific facial gestures such as eye-blinking, smiling, or frowning. Liveness verification may use approved alternative biometric signals.',
        domain: 'AML / KYC',
        effective_date: '2025-11-28',
        confidence: 88,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['AML-C012'],
        linked_control_ces: 86,
        reviewer: 'Marcus L.',
        reviewed_at: '2025-12-18T10:30:00Z',
        cited_paragraph: 'Para 3',
        cited_paragraph_text:
          'Making specific facial gestures, like blinking of eyes, smiling, frowning, etc. is not mandatory for liveness check.',
      },
      {
        id: 'OBL-RBI-CB-KYC-003',
        text: 'All references to pre-2025 KYC circulars in inter-departmental policy, audit checklists, and ORM control matrices must be remapped to the appropriate paragraph in the new Master Direction.',
        domain: 'Regulatory Framework',
        effective_date: '2026-03-31',
        confidence: 79,
        hitl_status: 'pending',
        coverage_status: 'uncovered',
        linked_controls: [],
        linked_control_ces: null,
        reviewer: null,
        reviewed_at: null,
        cited_paragraph: 'Para 5',
        cited_paragraph_text:
          'The provisions of this Master Direction shall apply to all branches and subsidiaries of the bank in India, and to overseas branches and subsidiaries to the extent permitted by local law.',
      },
      {
        id: 'OBL-RBI-CB-KYC-004',
        text: 'Inspection and concurrent audit programmes shall update test scripts to reference 2025 MD paragraph numbers; legacy references to the 2016 MD shall be retained only in the audit trail of historical findings.',
        domain: 'Regulatory Framework',
        effective_date: '2026-03-31',
        confidence: 74,
        hitl_status: 'pending',
        coverage_status: 'partial',
        linked_controls: ['AUD-C003'],
        linked_control_ces: 72,
        reviewer: null,
        reviewed_at: null,
        cited_paragraph: 'Para 5',
        cited_paragraph_text:
          'Internal audit and concurrent audit of the bank shall, while testing KYC compliance, reference the latest applicable Master Direction.',
      },
    ],
    ai_narrative:
      'On November 28, 2025, RBI executed the largest regulatory consolidation in the Indian banking framework\'s recent history: 3500 circulars and directions were collapsed into 238 Master Directions, and 9445 circulars were formally withdrawn the same day [Pack §1]. The 2016 KYC MD is gone — replaced by 10 sector-specific MDs, of which the RBI (Commercial Banks — Know Your Customer) Directions, 2025 applies to this bank [Pack §1]. ORM\'s first-pass shows two obligations still awaiting HITL review and one uncovered policy-remapping obligation that the audit committee has flagged as high-priority before the next AFI [Pack §5]. Six preventive actions are in flight; the most critical is the policy-library remapping which closes the audit-trail gap that would otherwise surface as a Section 47A finding.',
    ai_citations: 3,
    ai_model: 'narrative-generator-v4.1',
    source_url: 'https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx',
    unread: true,
  },
  {
    id: 'REG-ALERT-2026-0028',
    source: 'RBI',
    source_label: 'Reserve Bank of India',
    instrument_type: 'DIRECTION',
    instrument_name: 'Reserve Bank of India (Digital Lending) Directions, 2025',
    instrument_ref: 'RBI/DOR/2025-26/120 DoR.STR.REC.51/21.07.001/2025-26',
    publication_date: '2025-05-08',
    effective_date: '2025-11-01',
    days_to_effective: -194,
    consultation_deadline: null,
    materiality_score: 90,
    materiality_reason:
      'Repeals the 2022 Digital Lending Guidelines and 2023 Default Loss Guarantee Guidelines. Para 6 (multi-lender LSP arrangements) and Para 17 (DLA reporting to RBI via CIMS — CCO certification mandatory) are bank-impacting. KFS-before-acceptance, cooling-off period, and direct-disbursal requirements affect the digital lending book.',
    escalation_tier: 1,
    governance_track: 'expedited',
    stage: 'certify',
    stage_index: 5,
    obligations_total: 3,
    obligations_approved: 3,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 0,
    covered_count: 3,
    pas_created: 5,
    pas_closed: 5,
    accountable_sm: 'Priya Patel',
    accountable_sm_role: 'Head of Financial Crime Compliance',
    domain: 'Digital Lending',
    penalty_exposure: ['s.47A'],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Chief General Manager, RBI',
    legal_basis:
      'Sections 21, 35A and 56 of the Banking Regulation Act, 1949; Section 45JA of the RBI Act, 1934',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xc3d4e5f6a1b2',
    para_anchors: ['Para 6', 'Para 8', 'Para 17'],
    key_provisions: [
      'Repeals 2022 Digital Lending Guidelines and 2023 DLG Guidelines.',
      'Para 6 effective November 1, 2025 — multi-lender LSP arrangements must show neutral, unbiased loan-offer view including unmatched lenders.',
      'Para 17 effective June 15, 2025 — DLAs must be reported to RBI on CIMS portal with CCO certification.',
      'KFS (Key Fact Statement) must be shown at offer stage, not disbursal stage.',
      'Direct disbursal to borrower bank account only; no LSP pass-through accounts.',
      'Cooling-off period without penalty as defined in RE loan policy.',
    ],
    obligations: [
      {
        id: 'OBL-RBI-DL-001',
        text: 'Multi-lender LSP arrangements must display all matched loan offers (and unmatched lender names) with RE name, sanctioned amount, tenor, APR, monthly repayment, penal charges, and a link to each KFS, enabling fair comparison without dark patterns or LSP product promotion.',
        domain: 'Digital Lending',
        effective_date: '2025-11-01',
        confidence: 95,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['LEN-C014'],
        linked_control_ces: 88,
        reviewer: 'Priya Patel',
        reviewed_at: '2025-10-15T11:20:00Z',
        cited_paragraph: 'Para 6',
        cited_paragraph_text:
          'The digital view of loan offers from matching lenders shall include the name(s) of the RE(s) extending the loan offer, amount and tenor of loan, APR, monthly repayment obligation and penal charges (if applicable), in a way which enables the borrower to make a fair comparison between various offers. A link to the KFS shall also be provided in respect of each of the RE.',
      },
      {
        id: 'OBL-RBI-DL-002',
        text: 'REs shall report information on all DLAs engaged by them to the RBI on the Centralised Information Management System (CIMS) portal. The Chief Compliance Officer is responsible for certifying that data submitted is correct and that DLAs comply with applicable regulatory requirements.',
        domain: 'Digital Lending',
        effective_date: '2025-06-15',
        confidence: 96,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['LEN-C017'],
        linked_control_ces: 90,
        reviewer: 'Priya Patel',
        reviewed_at: '2025-06-10T14:00:00Z',
        cited_paragraph: 'Para 17',
        cited_paragraph_text:
          'REs shall report to the RBI information about all the Digital Lending Apps engaged by them, in the prescribed format. The Chief Compliance Officer (or other officer designated by the RE) shall be responsible for certifying that data submitted on DLAs via CIMS portal is correct and that DLAs are complying with the applicable law and regulatory requirements.',
      },
      {
        id: 'OBL-RBI-DL-003',
        text: 'REs must provide a Key Fact Statement (KFS) to the borrower before the loan contract is executed, in accordance with the KFS Circular dated April 15, 2024. Where LSPs operate matching across multiple REs, a KFS menu must be displayed at the offer stage.',
        domain: 'Digital Lending',
        effective_date: '2025-05-08',
        confidence: 94,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['LEN-C012'],
        linked_control_ces: 85,
        reviewer: 'Marcus L.',
        reviewed_at: '2025-05-15T09:00:00Z',
        cited_paragraph: 'Para 8',
        cited_paragraph_text:
          'REs shall provide a Key Fact Statement (KFS) to the borrower before the loan contract is executed in accordance with the Key Facts Statement (KFS) for Loans and Advances dated April 15, 2024.',
      },
    ],
    ai_narrative:
      'The Digital Lending Directions 2025 are bank-effective in full as of November 1, 2025 [Pack §6]. All three extracted obligations are approved and covered with CES above the internal 80 target. Five preventive actions — CIMS DLA reporting integration, KFS-at-offer pipeline, LSP contract uplift, multi-lender display logic, and cooling-off configuration — are closed. The certification stage is the only remaining step: the CCO must sign the Section 17 attestation that DLA data submitted to CIMS is correct and that all DLAs comply with the applicable regulatory requirements [Pack §17].',
    ai_citations: 3,
    ai_model: 'narrative-generator-v4.1',
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/reserve-bank-of-india-digital-lending-directions-2025',
    unread: false,
  },
  {
    id: 'REG-ALERT-2026-0043',
    source: 'FIU-IND',
    source_label: 'Financial Intelligence Unit — India',
    instrument_type: 'GUIDANCE NOTE',
    instrument_name:
      'PMLA STR Reporting Framework — FINgate 2.0 Portal Migration & Designated Director / Principal Officer Regime',
    instrument_ref: 'FIU-IND PMLA Section 12 / PML (Maintenance of Records) Rules, 2005',
    publication_date: '2024-03-15',
    effective_date: '2024-06-01',
    days_to_effective: -712,
    consultation_deadline: null,
    materiality_score: 86,
    materiality_reason:
      'STR filing within 7 working days of suspicion conclusion is a strict legal obligation under PMLA. Section 13 of PMLA permits monetary penalty up to ₹1 lakh per unreported transaction. FINgate 2.0 migration affects every STR submission workflow.',
    escalation_tier: 1,
    governance_track: 'standard',
    stage: 'assign',
    stage_index: 3,
    obligations_total: 3,
    obligations_approved: 3,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 2,
    covered_count: 1,
    pas_created: 3,
    pas_closed: 1,
    accountable_sm: 'Rahul Mehta',
    accountable_sm_role: 'MLRO and Principal Officer',
    domain: 'AML / STR',
    penalty_exposure: ['PMLA'],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Financial Intelligence Unit — India (FIU-IND), Ministry of Finance',
    signatory_role: 'Director, FIU-IND',
    legal_basis:
      'Prevention of Money Laundering Act, 2002 (Section 12 and Section 13); PML (Maintenance of Records) Rules, 2005',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xd4e5f6a1b2c3',
    para_anchors: ['Rule 7', 'Rule 8', 'Rule 9'],
    key_provisions: [
      'STRs to be filed within 7 working days of conclusion of suspicion.',
      'Submissions via FINgate 2.0 portal (succeeded FINnet 1.0).',
      'Designated Director (senior management) and Principal Officer roles mandatory.',
      'PML Rule 9 — records retained for at least 5 years.',
      'Section 13 PMLA penalty up to ₹1 lakh per unreported transaction.',
      'Cash Transaction Reports (CTR) by 15th of succeeding month for transactions ≥ ₹10 lakh.',
    ],
    obligations: [
      {
        id: 'OBL-FIU-STR-001',
        text: 'Reporting entities shall file Suspicious Transaction Reports (STRs) to FIU-IND within 7 working days from the date on which the suspicion is concluded. Each STR shall include the complete prescribed dataset including counterparty identifiers and structured narrative.',
        domain: 'AML / STR',
        effective_date: '2024-06-01',
        confidence: 96,
        hitl_status: 'approved',
        coverage_status: 'partial',
        linked_controls: ['AML-C002'],
        linked_control_ces: 78,
        reviewer: 'Priya Patel',
        reviewed_at: '2024-07-10T11:40:00Z',
        cited_paragraph: 'Rule 7',
        cited_paragraph_text:
          'Every reporting entity shall furnish the information of all suspicious transactions, whether or not made in cash, to the Director, within 7 working days on being satisfied that the transaction is suspicious.',
      },
      {
        id: 'OBL-FIU-STR-002',
        text: 'Reporting entities shall communicate to FIU-IND the names, designations, and contact details of the Designated Director and the Principal Officer responsible for compliance under PMLA. Any change shall be intimated within 7 days.',
        domain: 'AML / STR',
        effective_date: '2024-06-01',
        confidence: 92,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['AML-C015'],
        linked_control_ces: 89,
        reviewer: 'Rahul Mehta',
        reviewed_at: '2024-06-05T15:30:00Z',
        cited_paragraph: 'Rule 7',
        cited_paragraph_text:
          'Every reporting entity shall communicate the name, designation and address of the Designated Director and the Principal Officer to the Director, FIU-IND.',
      },
      {
        id: 'OBL-FIU-STR-003',
        text: 'Reporting entities shall retain records of transactions and client identification for a minimum period of five years from the date of cessation of the transaction or business relationship.',
        domain: 'AML / STR',
        effective_date: '2024-06-01',
        confidence: 95,
        hitl_status: 'approved',
        coverage_status: 'partial',
        linked_controls: ['AML-C020'],
        linked_control_ces: 75,
        reviewer: 'Priya Patel',
        reviewed_at: '2024-06-12T10:00:00Z',
        cited_paragraph: 'Rule 9',
        cited_paragraph_text:
          'Every reporting entity shall maintain the records referred to in rule 3 for a period of five years from the date of transactions between the client and the reporting entity.',
      },
    ],
    ai_narrative:
      'The FIU-IND STR reporting framework under PMLA Section 12 read with PML Rules 2005 has been a live obligation since 2005 and was reinforced by the migration to FINgate 2.0 in 2024 [Pack §Rule 7]. ORM has approved all three obligations; CTRL-AML-C002 (STR filing cycle time) sits at CES 78, just below the 80 target — investigator capacity remains a chronic constraint. CTRL-AML-C020 (record retention) at CES 75 is the other partial — driven by storage migration in progress. Three PAs are in flight; one closed. MLRO weekly KRI on alert backlog ageing is the leading indicator to watch.',
    ai_citations: 3,
    ai_model: 'narrative-generator-v4.1',
    source_url: 'https://fiuindia.gov.in/',
    unread: false,
  },
{
    id: 'REG-ALERT-2026-0039',
    source: 'CERT-IN',
    source_label: 'Indian Computer Emergency Response Team (CERT-In), MeitY',
    instrument_type: 'DIRECTION',
    instrument_name:
      'Directions under sub-section (6) of Section 70B of the IT Act 2000 relating to information security practices, procedure, prevention, response and reporting of cyber incidents for Safe & Trusted Internet',
    instrument_ref: 'CERT-In Directions 28 April 2022 (No. 20(3)/2022-CERT-In)',
    publication_date: '2022-04-28',
    effective_date: '2022-06-27',
    days_to_effective: -1417,
    consultation_deadline: null,
    materiality_score: 92,
    materiality_reason:
      '6-hour reporting mandate is the strictest cyber incident SLA in India. Failure carries up to ₹1 lakh per day penalty plus potential RBI enforcement action. Banks have dual-reporting obligation — CERT-In + RBI. Three years of enforcement experience makes this a Tier-1 inspection focus area.',
    escalation_tier: 1,
    governance_track: 'expedited',
    stage: 'implement',
    stage_index: 4,
    obligations_total: 4,
    obligations_approved: 3,
    obligations_pending_hitl: 1,
    uncovered_count: 0,
    partial_count: 2,
    covered_count: 2,
    pas_created: 4,
    pas_closed: 3,
    accountable_sm: 'Vikram Nair',
    accountable_sm_role: 'Chief Information Security Officer',
    domain: 'Cyber / IT Risk',
    penalty_exposure: ['IT Act s.70B'],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority:
      'Indian Computer Emergency Response Team (CERT-In), Ministry of Electronics and Information Technology',
    signatory_role: 'Director General, CERT-In',
    legal_basis: 'Section 70B(6) of the Information Technology Act, 2000',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xe5f6a1b2c3d4',
    para_anchors: ['Direction (ii)', 'Direction (iii)', 'Direction (iv)', 'Annex I'],
    key_provisions: [
      'Cyber security incidents to be reported to CERT-In within 6 hours of noticing or being brought to notice.',
      '20 categories of mandatorily reportable incidents including targeted scanning, ransomware, data breach, IoT device compromise, supply-chain attacks.',
      'ICT system logs to be maintained securely in India for 180 days minimum.',
      'VPN, datacentre and crypto-exchange providers required to maintain KYC/transaction logs for 5 years.',
      'Penalty up to ₹1 lakh per day under Section 70B for non-compliance.',
    ],
    obligations: [
      {
        id: 'OBL-CERT-CYB-001',
        text: 'Service providers, intermediaries, data centres, body corporates, and government organisations shall mandatorily report cyber incidents to CERT-In within 6 hours of noticing such incidents or being brought to notice of such incidents.',
        domain: 'Cyber / IT Risk',
        effective_date: '2022-06-27',
        confidence: 98,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['CYB-C014'],
        linked_control_ces: 84,
        reviewer: 'Vikram Nair',
        reviewed_at: '2024-11-12T16:00:00Z',
        cited_paragraph: 'Direction (ii)',
        cited_paragraph_text:
          'Any service provider, intermediary, data centre, body corporate and Government organisation shall mandatorily report cyber incidents as mentioned in Annexure I to CERT-In within 6 hours of noticing such incidents or being brought to notice about such incidents.',
      },
      {
        id: 'OBL-CERT-CYB-002',
        text: 'All service providers, intermediaries, data centres, body corporates and government organisations shall enable logs of all their ICT systems and maintain them securely for a rolling period of 180 days within Indian jurisdiction.',
        domain: 'Cyber / IT Risk',
        effective_date: '2022-06-27',
        confidence: 96,
        hitl_status: 'approved',
        coverage_status: 'partial',
        linked_controls: ['CYB-C022'],
        linked_control_ces: 73,
        reviewer: 'Vikram Nair',
        reviewed_at: '2024-12-05T11:30:00Z',
        cited_paragraph: 'Direction (iv)',
        cited_paragraph_text:
          'All service providers, intermediaries, data centres, body corporates and Government organisations shall mandatorily enable logs of all their ICT systems and maintain them securely for a rolling period of 180 days and the same shall be maintained within the Indian jurisdiction.',
      },
      {
        id: 'OBL-CERT-CYB-003',
        text: 'Connect to and synchronise all ICT systems\' clocks to the Network Time Protocol (NTP) Server of National Informatics Centre or National Physical Laboratory or with NTP servers traceable to these NTP servers.',
        domain: 'Cyber / IT Risk',
        effective_date: '2022-06-27',
        confidence: 90,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['CYB-C031'],
        linked_control_ces: 87,
        reviewer: 'Vikram Nair',
        reviewed_at: '2024-09-20T10:15:00Z',
        cited_paragraph: 'Direction (iii)',
        cited_paragraph_text:
          'All service providers, intermediaries, data centres, body corporates and Government organisations shall connect to the Network Time Protocol (NTP) Server of National Informatics Centre (NIC) or National Physical Laboratory (NPL) or with NTP servers traceable to these NTP servers.',
      },
      {
        id: 'OBL-CERT-CYB-004',
        text: 'Designate a Point of Contact (PoC) to interface with CERT-In. The PoC details shall be sent to CERT-In and shall be kept updated.',
        domain: 'Cyber / IT Risk',
        effective_date: '2022-06-27',
        confidence: 87,
        hitl_status: 'pending',
        coverage_status: 'partial',
        linked_controls: ['CYB-C040'],
        linked_control_ces: 70,
        reviewer: null,
        reviewed_at: null,
        cited_paragraph: 'Direction (i)',
        cited_paragraph_text:
          'Any service provider, intermediary, data centre, body corporate and Government organisation shall, when required by order/direction of CERT-In, take action or provide information for the purposes of cyber security mitigation actions, threat detection and response.',
      },
    ],
    ai_narrative:
      'The CERT-In Directions of April 28, 2022 are the strictest cyber-incident SLA in the Indian regulatory landscape, with the 6-hour reporting clock running from the first SIEM alert, not from analyst triage [Pack §Direction (ii)]. CTRL-CYB-C014 covers the SIEM→CERT-In notification path at CES 84, above target. The CTRL-CYB-C022 log-retention control is at CES 73 — the 180-day in-India retention obligation is partially met because the EU primary datacentre is still being decommissioned [Pack §Direction (iv)]. One obligation on CERT-In PoC designation is still pending HITL — the recent CISO change requires a PoC re-registration. Four PAs are in flight; three closed.',
    ai_citations: 3,
    ai_model: 'narrative-generator-v4.1',
    source_url: 'https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf',
    unread: true,
  },
  {
    id: 'REG-ALERT-2026-0017',
    source: 'SEBI',
    source_label: 'Securities and Exchange Board of India',
    instrument_type: 'CIRCULAR',
    instrument_name: 'Cybersecurity and Cyber Resilience Framework (CSCRF) for SEBI Regulated Entities',
    instrument_ref: 'SEBI/HO/ITD-1/ITD_CSC_EXT/P/CIR/2024/113',
    publication_date: '2024-08-20',
    effective_date: '2025-08-31',
    days_to_effective: -256,
    consultation_deadline: null,
    materiality_score: 70,
    materiality_reason:
      'Affects bank only where it operates as a SEBI Regulated Entity (DP, RTA, custodian, broker-dealer arm). Supersedes all prior SEBI cybersecurity circulars. Periodic compliance reporting required; ISO 27001 mandatory for MIIs.',
    escalation_tier: 3,
    governance_track: 'standard',
    stage: 'certify',
    stage_index: 5,
    obligations_total: 2,
    obligations_approved: 2,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 0,
    covered_count: 2,
    pas_created: 2,
    pas_closed: 2,
    accountable_sm: 'Vikram Nair',
    accountable_sm_role: 'Chief Information Security Officer',
    domain: 'Cyber / IT Risk',
    penalty_exposure: [],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Information Technology Department, SEBI',
    signatory_role: 'General Manager, SEBI',
    legal_basis: 'Section 11(1) of the SEBI Act, 1992',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xf6a1b2c3d4e5',
    para_anchors: ['Para 1', 'Annex I', 'Annex II'],
    key_provisions: [
      'Five cyber resilience goals: Anticipate, Withstand, Contain, Recover, Evolve.',
      'Categorises REs as MIIs / Qualified REs / mid-size / small-size; obligations scale with category.',
      'ISO 27001 certification mandatory for MIIs and Qualified REs.',
      'Half-yearly third-party SOC efficacy assessment for MIIs.',
      'Red teaming exercises mandatory for MIIs and Qualified REs.',
      'Periodic audit by CERT-In empanelled IS auditing organisation.',
      'Implementation extended to August 31, 2025 for non-MII REs via SEBI Circular dated June 30, 2025.',
    ],
    obligations: [
      {
        id: 'OBL-SEBI-CSC-001',
        text: 'Regulated Entities classified as Qualified REs shall implement an Information Security Management System (ISMS) and obtain ISO 27001 certification within the prescribed timeline.',
        domain: 'Cyber / IT Risk',
        effective_date: '2025-08-31',
        confidence: 91,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['CYB-C050'],
        linked_control_ces: 88,
        reviewer: 'Vikram Nair',
        reviewed_at: '2025-08-15T10:00:00Z',
        cited_paragraph: 'Annex I',
        cited_paragraph_text:
          'ISO 27001 certification shall be mandatory for MIIs and Qualified REs as it provides essential security standards with respect to Information Security Management System (ISMS).',
      },
      {
        id: 'OBL-SEBI-CSC-002',
        text: 'All cybersecurity incidents shall be reported in a timely manner through the SEBI incident reporting portal. REs shall establish a comprehensive Incident Response Management plan.',
        domain: 'Cyber / IT Risk',
        effective_date: '2025-08-31',
        confidence: 93,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['CYB-C014'],
        linked_control_ces: 84,
        reviewer: 'Vikram Nair',
        reviewed_at: '2025-08-25T16:00:00Z',
        cited_paragraph: 'Annex II',
        cited_paragraph_text:
          'All cybersecurity incidents shall be reported in a timely manner through the SEBI incident reporting portal. All REs shall establish a comprehensive Incident Response Management plan.',
      },
    ],
    ai_narrative:
      'The bank\'s SEBI-regulated arm (depository participant and RTA) falls under the CSCRF\'s Qualified RE category [Pack §Annex I]. ISO 27001 is in place and the SOC efficacy report has been filed [Pack §Annex II]. Both obligations are covered with CES above target. Two PAs closed: ISMS gap remediation and SEBI incident-portal integration. CCO sign-off pending in the certify stage. No outstanding cybersecurity gaps in the SEBI universe at this point.',
    ai_citations: 2,
    ai_model: 'narrative-generator-v4.1',
    source_url:
      'https://www.sebi.gov.in/legal/circulars/aug-2024/cybersecurity-and-cyber-resilience-framework-cscrf-for-sebi-regulated-entities-res-_85964.html',
    unread: false,
  },
  {
    id: 'REG-ALERT-2026-0051',
    source: 'NPCI',
    source_label: 'National Payments Corporation of India',
    instrument_type: 'OPERATIONAL CIRCULAR',
    instrument_name:
      'Modifications to UPI Operating Parameters — Balance & List-Account API limits, Autopay execution windows',
    instrument_ref: 'NPCI/UPI/OC/2025-26/89',
    publication_date: '2025-05-21',
    effective_date: '2025-08-01',
    days_to_effective: -286,
    consultation_deadline: null,
    materiality_score: 64,
    materiality_reason:
      'Affects UPI app behaviour and payment switch configuration. NPCI members must implement API rate limits + autopay execution windows by July 31, 2025 deadline. Limited penalty exposure but breach can result in NPCI member-level action.',
    escalation_tier: 3,
    governance_track: 'standard',
    stage: 'certify',
    stage_index: 5,
    obligations_total: 2,
    obligations_approved: 2,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 0,
    covered_count: 2,
    pas_created: 3,
    pas_closed: 3,
    accountable_sm: 'Anjali Sharma',
    accountable_sm_role: 'Head of Payments',
    domain: 'Payments / UPI',
    penalty_exposure: [],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'National Payments Corporation of India (NPCI)',
    signatory_role: 'Chief Operating Officer, NPCI',
    legal_basis: 'Payment and Settlement Systems Act, 2007; NPCI Operating Rules',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xa1b2c3d4e5f7',
    para_anchors: ['Clause 1', 'Clause 2', 'Clause 4'],
    key_provisions: [
      'Balance enquiry API capped at 50 requests per user per day per UPI app.',
      'List-Account API capped at 25 requests per user per day per app.',
      'Background balance polling disabled — balance shown automatically after each transaction.',
      'Autopay debit execution restricted to defined time windows.',
      'Stricter mobile number verification for UPI app onboarding.',
      'All UPI service providers and member banks to implement by July 31, 2025.',
    ],
    obligations: [
      {
        id: 'OBL-NPCI-UPI-001',
        text: 'Member banks and UPI service providers shall enforce a maximum of 50 balance enquiry API calls per user per day per UPI app, and 25 List Account API calls per user per day per app. Background balance polling shall be disabled.',
        domain: 'Payments / UPI',
        effective_date: '2025-08-01',
        confidence: 93,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['PAY-C008'],
        linked_control_ces: 86,
        reviewer: 'Anjali Sharma',
        reviewed_at: '2025-07-20T14:00:00Z',
        cited_paragraph: 'Clause 1',
        cited_paragraph_text:
          'Member banks and PSPs shall implement rate limits of fifty (50) balance enquiry API calls per user per day per UPI application, and twenty-five (25) List Account API calls per user per day per application.',
      },
      {
        id: 'OBL-NPCI-UPI-002',
        text: 'Autopay (e-mandate) debit execution shall be scheduled within defined time windows as per NPCI mandate-execution specifications. UPI service providers shall not initiate autopay debits outside these windows.',
        domain: 'Payments / UPI',
        effective_date: '2025-08-01',
        confidence: 89,
        hitl_status: 'approved',
        coverage_status: 'covered',
        linked_controls: ['PAY-C014'],
        linked_control_ces: 82,
        reviewer: 'Anjali Sharma',
        reviewed_at: '2025-07-25T11:00:00Z',
        cited_paragraph: 'Clause 4',
        cited_paragraph_text:
          'Autopay debit execution shall be processed strictly within the specified time windows. Member banks shall not present autopay debit requests outside these windows.',
      },
    ],
    ai_narrative:
      'NPCI\'s UPI operational circular from May 2025 has been fully implemented across the bank\'s UPI infrastructure as of the August 1, 2025 deadline [Pack §Clause 1]. Both obligations are covered: PAY-C008 (API rate limits) at CES 86 and PAY-C014 (autopay window enforcement) at CES 82. Three preventive actions — payment switch reconfiguration, mobile app build update, and downstream merchant communication — are all closed. Certification stage awaits CCO sign-off [Pack §Clause 4].',
    ai_citations: 2,
    ai_model: 'narrative-generator-v4.1',
    source_url: 'https://www.npci.org.in/circulars/upi',
    unread: false,
  },
  {
    id: 'REG-ALERT-2026-0072',
    source: 'RBI',
    source_label: 'Reserve Bank of India',
    instrument_type: 'CIRCULAR',
    instrument_name:
      'Liberalised Remittance Scheme (LRS) — Reporting of Remittances via Daily R-Return; Revised Submission Format',
    instrument_ref: 'RBI/2026-27/14 A.P.(DIR Series) Circular No. 03',
    publication_date: '2026-05-12',
    effective_date: '2026-06-01',
    days_to_effective: 18,
    consultation_deadline: null,
    materiality_score: 81,
    materiality_reason:
      'Revised LRS Daily R-Return format mandates new fields (purpose-code sub-level, beneficiary KYC reference). Operational change touches every Authorised Dealer outward remittance workflow. Effective in 18 days. Late or incorrect submissions can attract FEMA contraventions under Section 11(3).',
    escalation_tier: 1,
    governance_track: 'expedited',
    stage: 'acknowledge',
    stage_index: 1,
    obligations_total: 2,
    obligations_approved: 0,
    obligations_pending_hitl: 2,
    uncovered_count: 1,
    partial_count: 1,
    covered_count: 0,
    pas_created: 0,
    pas_closed: 0,
    accountable_sm: 'Anjali Sharma',
    accountable_sm_role: 'Head of Payments',
    domain: 'Forex / LRS',
    penalty_exposure: ['FEMA s.11(3)'],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Foreign Exchange Department, Reserve Bank of India',
    signatory_role: 'Chief General Manager, RBI',
    legal_basis: 'Section 10(4) and Section 11(1) of the Foreign Exchange Management Act, 1999',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0x4f7c9d3b1e88',
    para_anchors: ['Para 4', 'Para 7', 'Annex A'],
    key_provisions: [
      'Daily R-Return submission format revised; new fields for purpose-code sub-level and beneficiary KYC reference.',
      'Submission deadline unchanged: T+1 working day by 18:00 IST via XBRL portal.',
      'Authorised Dealer banks to update internal LRS workflow to capture new fields at transaction time.',
      'Effective for remittances effected on or after June 1, 2026.',
    ],
    obligations: [
      {
        id: 'OBL-RBI-LRS-072-A',
        text: 'Authorised Dealer banks shall capture the full purpose-code sub-level (Schedule III, codes S0001 through S1402) and the beneficiary KYC reference number at the point of every LRS outward remittance, and include the same in the daily R-Return submission.',
        domain: 'Forex / LRS',
        effective_date: '2026-06-01',
        confidence: 88,
        hitl_status: 'pending',
        coverage_status: 'uncovered',
        linked_controls: [],
        linked_control_ces: null,
        reviewer: null,
        reviewed_at: null,
        cited_paragraph: 'Para 4',
        cited_paragraph_text:
          'Authorised Dealer banks shall capture the full purpose-code sub-level (Schedule III) and the beneficiary KYC reference number at the time of execution of every LRS outward remittance.',
      },
      {
        id: 'OBL-RBI-LRS-072-B',
        text: 'The revised Daily R-Return shall be submitted via the XBRL portal by 18:00 IST on T+1 working day. Any reconciliation breaks against core banking shall be cleared within 2 working days.',
        domain: 'Forex / LRS',
        effective_date: '2026-06-01',
        confidence: 90,
        hitl_status: 'pending',
        coverage_status: 'partial',
        linked_controls: ['FOR-C009'],
        linked_control_ces: 74,
        reviewer: null,
        reviewed_at: null,
        cited_paragraph: 'Para 7',
        cited_paragraph_text:
          'The revised Daily R-Return shall be submitted via the XBRL portal by 18:00 hours IST on T+1 working day in the format specified at Annex A.',
      },
    ],
    ai_narrative:
      'RBI A.P.(DIR Series) Circular No. 03 dated May 12, 2026 revises the Daily R-Return format for LRS outward remittances [Pack §Para 4]. Two obligations are AI-extracted. The purpose-code/beneficiary-KYC capture obligation is currently uncovered — no front-office control claims this coverage today, and the build-out for the core banking transaction screen is the P0 item flagged for CCO acknowledgement [Pack §Para 7]. The reporting-cadence obligation is partially covered by FOR-C009 (existing R-Return submission control) at CES 74. With 18 days to effective date, CCO acknowledgement is required within the next working day to keep the implementation runway viable.',
    ai_citations: 2,
    ai_model: 'narrative-generator-v4.1',
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/lrs-daily-r-return-revised-format-2026',
    unread: true,
  },
  {
    id: 'REG-DRAFT-2026-0021',
    source: 'RBI',
    source_label: 'Reserve Bank of India',
    instrument_type: 'DRAFT DIRECTION',
    instrument_name:
      'Draft Disclosure Framework on Climate-related Financial Risks, 2026 — Master Direction for REs',
    instrument_ref: 'RBI/Draft/2026-27/02 DoR.SRD.REC.07/12.01.001/2026-27',
    publication_date: '2026-03-15',
    effective_date: null,
    days_to_effective: 32,
    consultation_deadline: '2026-06-15',
    materiality_score: 72,
    materiality_reason:
      'Phased disclosure of climate-related governance, strategy, risk management, and metrics & targets from FY2027–28 onwards. Aligns Indian REs with TCFD/ISSB-S2 baselines. Sector-wide impact; bank must submit response on materiality threshold, transition-risk assumptions, and Scope 3 phase-in.',
    escalation_tier: 2,
    governance_track: 'advisory',
    stage: 'acknowledge',
    stage_index: 1,
    obligations_total: 0,
    obligations_approved: 0,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 0,
    covered_count: 0,
    pas_created: 0,
    pas_closed: 0,
    accountable_sm: 'Sandeep Rao',
    accountable_sm_role: 'Chief Risk Officer',
    domain: 'Climate / ESG',
    penalty_exposure: [],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Department of Regulation, Reserve Bank of India',
    signatory_role: 'Chief General Manager, RBI',
    legal_basis:
      'Sections 21, 35A and 56 of the Banking Regulation Act, 1949; Section 45L of the RBI Act, 1934',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0x9d2e7f1a8c4b',
    para_anchors: ['Para 4', 'Para 9', 'Annex II'],
    key_provisions: [
      'Phased disclosure starting FY2027–28 for scheduled commercial banks; FY2028–29 for UCBs/NBFCs above asset threshold.',
      'Four pillars: Governance, Strategy, Risk Management, Metrics & Targets — modelled on TCFD/ISSB-S2.',
      'Scope 1 and Scope 2 financed emissions mandatory from year one; Scope 3 phase-in across two years.',
      'Disclosures to form part of Pillar 3 report and Annual Report.',
      'Comments and responses invited until June 15, 2026.',
    ],
    obligations: [],
    ai_narrative:
      'RBI\'s draft Disclosure Framework on Climate-related Financial Risks (March 15, 2026) introduces TCFD/ISSB-S2-aligned disclosures across Governance, Strategy, Risk Management, and Metrics & Targets [Pack §Para 4]. As this is a draft direction, no binding obligations are extracted. The CRO is the named SM for drafting the bank\'s industry response. Key positions to brief: (a) materiality threshold for Scope 3 financed emissions, (b) transition-risk assumption set for the bank\'s loan book, (c) glide path on sector-level concentration disclosures [Pack §Annex II]. Response due June 15, 2026.',
    ai_citations: 2,
    ai_model: 'narrative-generator-v4.1',
    source_url:
      'https://website.rbi.org.in/web/rbi/-/notifications/draft-disclosure-framework-climate-related-financial-risks-2026',
    unread: true,
  },
  {
    id: 'REG-DRAFT-2026-0009',
    source: 'SEBI',
    source_label: 'Securities and Exchange Board of India',
    instrument_type: 'DRAFT DIRECTION',
    instrument_name:
      'Consultation Paper — Safer Participation of Retail Investors in Algorithmic Trading via APIs',
    instrument_ref: 'SEBI/CP/MIRSD/2026-27/05',
    publication_date: '2026-04-22',
    effective_date: null,
    days_to_effective: 11,
    consultation_deadline: '2026-05-25',
    materiality_score: 58,
    materiality_reason:
      'Affects the bank\'s SEBI-regulated arm (broker-dealer + DP). Proposes registration regime for retail algo strategies and tagging of broker APIs at the exchange level. Industry response due in 11 days — short consultation window.',
    escalation_tier: 3,
    governance_track: 'advisory',
    stage: 'assess',
    stage_index: 2,
    obligations_total: 0,
    obligations_approved: 0,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 0,
    covered_count: 0,
    pas_created: 0,
    pas_closed: 0,
    accountable_sm: 'Vikram Nair',
    accountable_sm_role: 'Chief Information Security Officer',
    domain: 'Capital Markets / Algo',
    penalty_exposure: [],
    is_peer_signal: false,
    peer_penalty_amount: null,
    peer_similarity_pct: null,
    peer_similar_to: null,
    issuing_authority: 'Market Intermediaries Regulation & Supervision Department, SEBI',
    signatory_role: 'General Manager, SEBI',
    legal_basis: 'Section 11(1) of the SEBI Act, 1992; SEBI (Stock Brokers) Regulations, 1992',
    last_synced_at: '2026-05-14T09:30:00+05:30',
    source_verified: true,
    source_hash: '0x6a8c3e2f5d91',
    para_anchors: ['Para 3', 'Para 5', 'Para 8'],
    key_provisions: [
      'Stock brokers to tag every API-originated order at exchange level with algo / non-algo flag.',
      'Retail-originated algos above order-rate threshold to be registered with the exchange.',
      'Broker to maintain audit trail of algo strategy parameters and changes.',
      'Algo-provider empanelment framework for third-party vendors.',
      'Comments invited until May 25, 2026.',
    ],
    obligations: [],
    ai_narrative:
      'SEBI\'s consultation paper proposes a registration regime for retail-driven algorithmic strategies and exchange-level tagging of broker APIs [Pack §Para 3]. As a SEBI-regulated broker-dealer + DP, the bank\'s response should address: (i) feasibility of the order-rate threshold for retail algo registration, (ii) burden of audit-trail requirements on smaller brokers, (iii) liability allocation between broker and third-party algo provider [Pack §Para 8]. Response due May 25, 2026 — current draft owned by the bank\'s capital markets compliance team.',
    ai_citations: 2,
    ai_model: 'narrative-generator-v4.1',
    source_url:
      'https://www.sebi.gov.in/reports-and-statistics/reports/safer-participation-retail-algo-2026.html',
    unread: true,
  },
  {
    id: 'PEER-SIG-2026-0008',
    source: 'RBI',
    source_label: 'Reserve Bank of India — Enforcement',
    instrument_type: 'PEER ENFORCEMENT SIGNAL',
    instrument_name:
      'RBI Peer Enforcement Signal — Monetary Penalty of ₹38.60 lakh on IDFC First Bank for KYC CDD non-compliance',
    instrument_ref: 'RBI Press Release: 2025-2026/134 (Order dated 3 April 2025)',
    publication_date: '2025-04-17',
    effective_date: null,
    days_to_effective: null,
    consultation_deadline: null,
    materiality_score: 78,
    materiality_reason:
      'Peer enforcement on a comparable private bank for CDD failures in current account opening. 84% structural similarity to the bank\'s open KYC programme gap (REG-ALERT-2026-0047). Self-assessment recommended before next AFI.',
    escalation_tier: 2,
    governance_track: 'advisory',
    stage: 'closed',
    stage_index: 5,
    obligations_total: 0,
    obligations_approved: 0,
    obligations_pending_hitl: 0,
    uncovered_count: 0,
    partial_count: 0,
    covered_count: 0,
    pas_created: 0,
    pas_closed: 0,
    accountable_sm: 'Priya Patel',
    accountable_sm_role: 'Head of Financial Crime Compliance',
    domain: 'AML / KYC',
    penalty_exposure: ['s.47A'],
    is_peer_signal: true,
    peer_penalty_amount: '₹38.60 lakh',
    peer_similarity_pct: 84,
    peer_similar_to: 'REG-ALERT-2026-0047',
    issuing_authority: 'Reserve Bank of India (Enforcement Department)',
    signatory_role: 'Chief General Manager, RBI',
    legal_basis: 'Section 47A(1)(c) read with Section 46(4)(i) of the Banking Regulation Act, 1949',
    last_synced_at: '2026-05-14T09:32:00+05:30',
    source_verified: true,
    source_hash: '0xb2c3d4e5f6a2',
    para_anchors: ['Para 1', 'Para 3'],
    key_provisions: [
      'RBI imposed monetary penalty of ₹38.60 lakh on IDFC First Bank Limited by order dated April 3, 2025.',
      'Charge sustained: failed to undertake requisite Customer Due Diligence process for opening current accounts of certain sole proprietary firms.',
      'Imposed under Section 47A(1)(c) read with Section 46(4)(i) of the Banking Regulation Act, 1949.',
      'Penalty follows scrutiny report findings + show-cause notice + personal hearing.',
      'RBI clarifies action is based on regulatory non-compliance, not on validity of any specific customer transaction.',
    ],
    obligations: [],
    ai_narrative:
      'RBI\'s April 17, 2025 press release confirmed a ₹38.60 lakh penalty on IDFC First Bank for failing to undertake the requisite Customer Due Diligence process for sole proprietary firm current accounts [Pack §Para 1]. ORI similarity engine flags 84% structural overlap with the bank\'s open KYC Amendment workstream (REG-ALERT-2026-0047), particularly around the CDD documentation gap on partial-CES control AML-C004 [Pack §Para 3]. FCC should run a self-assessment against this peer signal and confirm the documentation gap is being closed by the in-flight preventive action before the next BRMC. No new obligations are extracted from peer enforcement signals — they inform self-assessment, not direct remediation.',
    ai_citations: 2,
    ai_model: 'peer-signal-engine-v3.0',
    source_url: 'https://website.rbi.org.in/documents/d/rbi/prpenaltyonidfcfirstbanklimited',
    unread: true,
  },
];

export const kpiSummary: KPISummary = {
  total_in_flight: 10,
  pending_cco_ack: 2,
  effective_within_30_days: 2,
  uncovered_obligations: 2,
  pending_hitl: 5,
  mtta_hours: 3.2,
  mttc_days: 21.8,
  sources_active: ['RBI', 'FIU-IND', 'CERT-IN', 'SEBI', 'NPCI'],
};
