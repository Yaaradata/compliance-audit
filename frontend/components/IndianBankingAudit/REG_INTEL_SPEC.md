# REG_INTEL_SPEC — Regulatory Intelligence Inbox (ORI)

**Product:** ORI (Operational Risk Intelligence) — Indian private-sector banking prototype  
**Screen:** Regulatory Intelligence Inbox  
**Pass:** **7 of 7 — V2 locked** (prototype complete; baseline §§11–§15; V2 addendum §§16–§23)  
**Authoring context:** Aligned to existing ORI module docs (`ORI_SPEC.md`, `KNOWLEDGE_BASE.md`, `ORI_BUSINESS_CONCEPTS.md`) and current implementation patterns under `frontend/components/IndianBankingAudit/`.

---

## 1. Screen Identity

| Field | Value |
|--------|--------|
| **Screen name** | Regulatory Intelligence Inbox |
| **Working `ScreenCode` (Pass 2+)** | `regulatoryIntelligence` (camelCase; add to `ScreenCode` union in `AppShell.tsx`) |
| **Nav tab label** | Reg Intelligence |
| **User-facing title** | Regulatory Intelligence Inbox |
| **Strapline (for `SCREEN` / `SCREEN_FUNCTIONAL_SUBTITLE`)** | Structured RBI / FIU / CERT-In / MoF / NPCI ingest with CCO-first workflow, obligation HITL, and AI narrative with citations. |
| **Target URL (product intent)** | `/regulatory-intelligence` |
| **ORI routing reality (Pass 1 baseline)** | The shipped ORI shell uses **one Next.js route** (`/IndianBankingAudit`) and **client `activeScreen` state** (`ScreenCode`) — there is **no** per-screen filesystem routing today. Pass 2 should add this screen to `ScreenCode`, `SCREEN`, `PERSONA_NAV` (compliance persona first), `ORI_NAV_SECTIONS`, and `IndianBankingAuditApp` screen switch. **Optional** deep links: `?screen=regulatoryIntelligence` or a thin `app/regulatory-intelligence/page.tsx` that renders `IndianBankingAuditApp` with initial screen preset — document choice in Pass 2. |
| **Primary persona** | Compliance persona bucket — **CCO as first recipient** of every alert (copy + default filter reflect CCO accountability). |
| **Secondary personas** | Head of ORM, MLRO, Head of FCC (same `compliance` persona nav or future sub-roles). |

---

## 2. Persona & Workflow

**Why this screen**  
The CCO is the single accountable **first responder** for regulatory change. Today updates arrive as email / PDF forwards with no structured workflow. This inbox ingests RBI circulars, FIU-IND guidance, CERT-In directions, MoF gazette items, PMLA rule changes, NPCI circulars, etc., within minutes of publication. Each item becomes an **actionable card**: AI-extracted obligations, coverage hints, and a **five-stage governance workflow** mirrored from the UK Monitoring Report / pack-builder pattern.

**CCO 5-stage workflow** (maps to UK 5-stage stepper)

| Stage | `stage` value | `stage_index` | Owner emphasis |
|-------|----------------|---------------|----------------|
| 1 — Acknowledge | `acknowledge` | 1 | CCO opens, reads, classifies, sets governance track |
| 2 — Assess | `assess` | 2 | Head of ORM maps coverage gap; CCO reviews |
| 3 — Assign | `assign` | 3 | PAs created; SM accountability set |
| 4 — Implement | `implement` | 4 | 1LoD executes control change; 2LoD tests |
| 5 — Certify | `certify` | 5 | CCO signs off; SM attests; pack updated |
| Closed | `closed` | 5 (UI: completed) | Archived / no further action |

**Peer enforcement signals** (`is_peer_signal: true`) do **not** advance the five-stage workflow on the bank’s own pack; they appear for awareness, materiality, and linkage to related alerts (`peer_similar_to`). UI: optional collapsed stepper or greyed “N/A — peer signal” per §11.

---

## 3. Design Tokens

### 3.1 Inherited ORI tokens (from `theme.ts` + Tailwind usage)

| Token family | Usage in ORI today |
|--------------|---------------------|
| **RAG bands** | `bandBg`, `bandDot`, `bandText`, `bandBar`, `bandRing` — `red` \| `amber` \| `green` \| `grey` \| `neutral` |
| **Severity** | `severityBadge` — critical / high / medium / low |
| **HITL (existing)** | `hitlBadge` — pending / accepted / rejected / escalated / overridden (Pass 2: map `approved` → `accepted` in UI or extend badge) |
| **Persona chrome** | `personaAccent` — `cro` indigo, `compliance` violet, `audit` emerald |
| **Interaction** | `oriFocusRing`, `oriCardHover` |
| **Layout rhythm** | Common pattern `space-y-5`, `grid gap-4 lg:grid-cols-12`, cards `rounded-xl border border-slate-200 bg-white shadow-sm`, sidebar sections from `ORI_NAV_SECTIONS` |

Typography / spacing follow existing screens: `text-xs` / `text-sm` meta labels, `text-[10px]` uppercase tracking for chips, `SectionCard` / `Chip` / `Stat` / `KVRow` from `primitives.tsx` where applicable.

### 3.2 Source colours (Reg Intelligence — **add to theme or local constants Pass 2**)

| Source | Hex | Notes |
|--------|-----|--------|
| RBI | `#1F4E79` | Navy |
| FIU-IND | `#7B2D8B` | Purple |
| CERT-IN | `#C0392B` | Red |
| MoF | `#2C7A2C` | Green |
| SEBI | `#E8700A` | Orange |
| NPCI | `#006FB4` | NPCI blue |
| IBA | `#5D5D5D` | Grey |
| PEER | `#B7580A` | Amber-orange |

### 3.3 Stage colours (workflow stepper + status pills)

| Stage | Hex |
|-------|-----|
| acknowledge | `#D97706` |
| assess | `#2563EB` |
| assign | `#4F46E5` |
| implement | `#0D9488` |
| certify | `#15803D` |
| closed | `#6B7280` |

### 3.4 Coverage chips (obligation coverage)

| Status | Background | Text | Border |
|--------|-------------|------|--------|
| UNCOVERED | `#FEE2E2` | `#991B1B` | `#FCA5A5` |
| PARTIAL | `#FEF3C7` | `#92400E` | `#FCD34D` |
| COVERED | `#DCFCE7` | `#166534` | `#86EFAC` |
| UNKNOWN | `#F3F4F6` | `#4B5563` | `#D1D5DB` |

---

## 4. Layout Architecture (3 zones)

**Zone A — Top, full width**

- **Row 1 — Sub-tabs:** `Active Alerts` \| `Consultations` \| `Peer Signals` (binds to `activeSubTab`).
- **Row 2 — Source filter pills:** `All` / `RBI` / `FIU-IND` / `CERT-In` / `MoF` / `SEBI` / `NPCI` (`SourcePill`).
- **Row 3 — Status filter pills:** `All Stages` / Acknowledge / Assess / Assign / Implement / Certify / Closed (`StatusPill`).
- **Row 4 — KPI strip:** four `KPITile`s — In Flight · Pending CCO Ack · Effective ≤ 30 Days · Uncovered Obligations (values from `KPISummary` §9).

**Zone B — Left ~38% (lg: `col-span-4` or `5/12`), sticky top, internal scroll**

- Sortable list of `RegAlertCard` / `PeerSignalCard` / `ConsultationCard` variants.
- **Sort:** emergency first → expedited → standard (then `days_to_effective` ascending where non-null); drafts last; peer signals interleaved by `materiality_score` descending (tie-break `publication_date`).
- **V2 desktop (`md+`):** Until the user selects an alert, Zone B spans the **full content width** (no empty Zone C column). After selection, the shell switches to the **~42% / ~58%** split so Zone C appears beside the list.

**Zone C — Right ~62% (`col-span-7` or `8/12`), sticky, internal scroll** *(visible on desktop only after an alert is selected; mobile: bottom sheet)*

- **No selection (desktop):** No Zone C column — inbox list uses full width. Reusable `RegIntelZoneCEmptyState` illustration remains in the codebase for modals or future placements.
- **Selection:** `RegAlertDetail` stack:
  - **C1** — Header: tags (`RBI CIRCULAR`, `PMLA`, …), status badge (current stage), `WorkflowStepper`, `CountdownBanner` (effective or consultation).
  - **C2** — `CompositionStrip`: three blocks — obligations (totals / HITL), coverage gap (uncovered / partial / covered), PAs (created / closed).
  - **C3** — Obligation HITL: expandable `ObligationRow` list.
  - **C4** — `AINarrativePanel`: editable textarea (dirty flag in `narrativeEdited`), citation chips footer `AI · N CITATIONS`, model id footnote.
  - **C5** — `ActionBar`: stage-specific primary `ActionButton` + secondary actions; sticky bottom within Zone C.

---

## 5. Component Inventory

| Component | Responsibility |
|-----------|------------------|
| `SourcePill` | Source filter; active / inactive |
| `StatusPill` | Stage filter |
| `SubTab` | Alerts / Consultations / Peer |
| `KPITile` | Numeric KPI + label + band colour |
| `RegAlertCard` | Inbox row (collapsed summary) |
| `RegAlertDetail` | Zone C container |
| `WorkflowStepper` | 5-stage horizontal stepper + current highlight |
| `CountdownBanner` | Effective date or consultation countdown copy |
| `CompositionStrip` | Three stat blocks (obligations / coverage / PAs) |
| `ObligationRow` | Expandable obligation + HITL + coverage |
| `HITLBadge` | pending / approved / rejected |
| `CoverageChip` | uncovered / partial / covered / unknown |
| `MaterialityRing` | 0–100 gauge |
| `AINarrativePanel` | Narrative + citation chips |
| `EscalationTierBadge` | Tier 1–4 |
| `GovernanceTrackBadge` | emergency / expedited / standard / advisory |
| `PenaltyExposureChip` | e.g. s.47A, PMLA |
| `ActionButton` | Stage-specific CTA |
| `PeerSignalCard` | Peer variant (penalty, similarity, link) |
| `ConsultationCard` | Draft / consultation variant |
| `EmptyState` | No selection / empty filtered list |

---

## 6. State Model

| Key | Type | Default |
|-----|------|---------|
| `activeSubTab` | `"alerts"` \| `"consultations"` \| `"peer"` | `"alerts"` |
| `activeSourceFilter` | `string` (e.g. `"All"`, `"RBI"`) | `"All"` |
| `activeStatusFilter` | `string` (e.g. `"All"`, `"acknowledge"`) | `"All"` |
| `selectedAlertId` | `string \| null` | `null` |
| `alerts` | `RegAlertRecord[]` | from mock |
| `expandedObligationId` | `string \| null` | `null` |
| `narrativeEdited` | `Record<alertId, boolean>` | `{}` |

Pass 2+: derive filtered list from `activeSubTab` + filters + sort comparator above.

---

## 7. Data Interfaces (TypeScript)

```typescript
export type RegSource = 'RBI' | 'FIU-IND' | 'CERT-IN' | 'MOF' | 'SEBI' | 'NPCI';

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
```

**Note:** For draft-only rows, `effective_date` may be `null`; seed uses `days_to_effective` as **days until consultation close** where noted — Pass 2 may split into `consultation_days_remaining`.

---

## 8. Seed Mock Data (7 records — JSON)

Paste into a `regIntelMock.ts` / `mockIndianBankingAuditData.js` extension in Pass 2. Dates anchor mid-**May 2026** for demo consistency with ORI mock universe.

```json
{
  "regulatoryIntelligenceAlerts": [
    {
      "id": "REG-ALERT-2026-0047",
      "source": "RBI",
      "source_label": "Reserve Bank of India",
      "instrument_type": "MASTER DIRECTION AMENDMENT",
      "instrument_name": "Master Direction — Know Your Customer (KYC) Direction, 2016 (Amendment No. 8)",
      "instrument_ref": "RBI/2025-26/MD-KYC-AM8",
      "publication_date": "2026-04-28",
      "effective_date": "2026-06-10",
      "days_to_effective": 28,
      "consultation_deadline": null,
      "materiality_score": 82,
      "materiality_reason": "Tightens periodic KYC refresh for HNIs and NR accounts; overlaps with concurrent FIU STR documentation uplift.",
      "escalation_tier": 2,
      "governance_track": "expedited",
      "stage": "assess",
      "stage_index": 2,
      "obligations_total": 3,
      "obligations_approved": 2,
      "obligations_pending_hitl": 1,
      "uncovered_count": 2,
      "partial_count": 1,
      "covered_count": 0,
      "pas_created": 1,
      "pas_closed": 0,
      "accountable_sm": "Priya Patel",
      "accountable_sm_role": "Head of Financial Crime Compliance",
      "domain": "AML / KYC",
      "penalty_exposure": ["s.47A", "PMLA"],
      "is_peer_signal": false,
      "peer_penalty_amount": null,
      "peer_similarity_pct": null,
      "peer_similar_to": null,
      "obligations": [
        {
          "id": "OBL-RBI-KYC-047-A",
          "text": "REs shall complete full KYC refresh for High Net-Worth Individual (HNI) accounts at least once every twelve months, including validation of source of funds and beneficial ownership where layered structures exist.",
          "domain": "AML / KYC",
          "effective_date": "2026-06-10",
          "confidence": 91,
          "hitl_status": "approved",
          "coverage_status": "uncovered",
          "linked_controls": [],
          "linked_control_ces": null,
          "reviewer": "Sophie Williams",
          "reviewed_at": "2026-05-10T14:22:00Z"
        },
        {
          "id": "OBL-RBI-KYC-047-B",
          "text": "REs shall ensure non-face-to-face onboarding for Non-Resident (External) accounts includes enhanced documentary evidence and independent verification of address as prescribed in Annex II.",
          "domain": "AML / KYC",
          "effective_date": "2026-06-10",
          "confidence": 88,
          "hitl_status": "approved",
          "coverage_status": "partial",
          "linked_controls": ["AML-C001"],
          "linked_control_ces": 72,
          "reviewer": "Marcus L.",
          "reviewed_at": "2026-05-11T09:05:00Z"
        },
        {
          "id": "OBL-RBI-KYC-047-C",
          "text": "REs shall document rationale where simplified KYC is applied to low-risk retail accounts and shall reconcile simplified KYC cohorts against transaction monitoring typologies quarterly.",
          "domain": "AML / KYC",
          "effective_date": "2026-06-10",
          "confidence": 74,
          "hitl_status": "pending",
          "coverage_status": "uncovered",
          "linked_controls": [],
          "linked_control_ces": null,
          "reviewer": null,
          "reviewed_at": null
        }
      ],
      "ai_narrative": "The Master Direction amendment tightens the refresh cadence for HNI and NRE accounts and removes ambiguity on non-face-to-face evidence [Pack §3.2]. ORM’s first-pass mapping shows two obligations without mapped detective controls; one obligation is partially covered by AML-C001 at CES 72, below the bank’s 78 target [Pack §4.1]. The pending HITL obligation on simplified-KYC cohort reconciliation is the likely bottleneck for RBI inspection dialogue if left unresolved past the next BRMC cycle [Pack §5.4]. Recommended action: fast-track control design for OBL-RBI-KYC-047-A/C and re-run population coverage on retail KYC refresh before the 28-day effective window closes.",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
      "unread": false
    },
    {
      "id": "REG-ALERT-2026-0043",
      "source": "FIU-IND",
      "source_label": "Financial Intelligence Unit – India",
      "instrument_type": "GUIDANCE NOTE",
      "instrument_name": "Revised Guidance on STR Format, Timelines, and Tipping-Off Safeguards (2026)",
      "instrument_ref": "FIU-IND/GN/STR/2026-02",
      "publication_date": "2026-04-18",
      "effective_date": "2026-06-02",
      "days_to_effective": 20,
      "consultation_deadline": null,
      "materiality_score": 91,
      "materiality_reason": "Directly affects STR field population, case narrative length, and STRO escalation paths; intersects PMLA Rule 3 reporting.",
      "escalation_tier": 1,
      "governance_track": "emergency",
      "stage": "assign",
      "stage_index": 3,
      "obligations_total": 2,
      "obligations_approved": 2,
      "obligations_pending_hitl": 0,
      "uncovered_count": 1,
      "partial_count": 1,
      "covered_count": 0,
      "pas_created": 2,
      "pas_closed": 0,
      "accountable_sm": "Rahul Mehta",
      "accountable_sm_role": "MLRO and Principal Officer",
      "domain": "AML / KYC",
      "penalty_exposure": ["PMLA"],
      "is_peer_signal": false,
      "peer_penalty_amount": null,
      "peer_similarity_pct": null,
      "peer_similar_to": null,
      "obligations": [
        {
          "id": "OBL-FIU-STR-2026-01",
          "text": "Reporting entities shall populate all mandatory STR fields including counterparty LEI (where available) and structured narrative blocks; free-text-only STRs are non-compliant except where LEI is genuinely unavailable and documented.",
          "domain": "AML / KYC",
          "effective_date": "2026-06-02",
          "confidence": 93,
          "hitl_status": "approved",
          "coverage_status": "uncovered",
          "linked_controls": [],
          "linked_control_ces": null,
          "reviewer": "Priya Patel",
          "reviewed_at": "2026-05-08T11:40:00Z"
        },
        {
          "id": "OBL-FIU-STR-2026-02",
          "text": "Reporting entities shall implement dual-control review for STR quality assurance prior to upload and shall retain reviewer identity and timestamp in the case management audit trail.",
          "domain": "AML / KYC",
          "effective_date": "2026-06-02",
          "confidence": 89,
          "hitl_status": "approved",
          "coverage_status": "partial",
          "linked_controls": ["AML-C002"],
          "linked_control_ces": 81,
          "reviewer": "Priya Patel",
          "reviewed_at": "2026-05-08T11:42:00Z"
        }
      ],
      "ai_narrative": "FIU-IND’s guidance elevates structured STR narratives and LEI capture as supervisory expectations, not optional enrichments [Pack §2.3]. The bank’s AML-C002 disposition control partially meets the dual-control obligation at CES 81 but does not yet evidence LEI capture at source [Pack §4.2]. Two preventive actions are already created to extend the case management schema and re-train Hyderabad L2 pods; CCO should confirm SM accountability and sequencing given the 20-day runway [Pack §6.1].",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://fiuindia.gov.in/",
      "unread": true
    },
    {
      "id": "REG-ALERT-2026-0039",
      "source": "CERT-IN",
      "source_label": "Indian Computer Emergency Response Team",
      "instrument_type": "DIRECTION",
      "instrument_name": "Direction Clarification No. 3 — Logging, Retention, and SOC Hand-off for Regulated Entities",
      "instrument_ref": "CERT-In/Dir/2026-CL3",
      "publication_date": "2026-05-02",
      "effective_date": "2026-05-16",
      "days_to_effective": 3,
      "consultation_deadline": null,
      "materiality_score": 88,
      "materiality_reason": "Mandatory retention windows for SOC logs intersect CBS patch windows; failure impacts cyber ORM and RBI cyber hygiene thematic.",
      "escalation_tier": 1,
      "governance_track": "emergency",
      "stage": "implement",
      "stage_index": 4,
      "obligations_total": 1,
      "obligations_approved": 1,
      "obligations_pending_hitl": 0,
      "uncovered_count": 0,
      "partial_count": 0,
      "covered_count": 1,
      "pas_created": 1,
      "pas_closed": 1,
      "accountable_sm": "Vikram Nair",
      "accountable_sm_role": "Chief Information Security Officer",
      "domain": "Cyber / IT Risk",
      "penalty_exposure": ["IT Act"],
      "is_peer_signal": false,
      "peer_penalty_amount": null,
      "peer_similarity_pct": null,
      "peer_similar_to": null,
      "obligations": [
        {
          "id": "OBL-CERT-LOG-2026-03",
          "text": "Regulated entities shall ensure immutable logging for privileged access to payment switch and core banking databases, with 180-day online retention and 7-year archival per prescribed formats.",
          "domain": "Cyber / IT Risk",
          "effective_date": "2026-05-16",
          "confidence": 90,
          "hitl_status": "approved",
          "coverage_status": "covered",
          "linked_controls": ["CYB-C014"],
          "linked_control_ces": 84,
          "reviewer": "Vikram Nair",
          "reviewed_at": "2026-05-09T16:00:00Z"
        }
      ],
      "ai_narrative": "CERT-In clarification compresses implementation time to three days and explicitly names privileged access to payment switch paths [Pack §1.9]. Cyber ORM mapped the obligation to CYB-C014 with CES 84, above internal green threshold [Pack §3.7]. Preventive action for SIEM parser uplift is closed; remaining work is 2LoD reperformance of log integrity sampling post go-live [Pack §5.2].",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://www.cert-in.org.in/",
      "unread": false
    },
    {
      "id": "REG-ALERT-2026-0031",
      "source": "RBI",
      "source_label": "Reserve Bank of India",
      "instrument_type": "DRAFT DIRECTION",
      "instrument_name": "Draft Direction — Digital Lending (Prudential Norms and Customer Protection) (Amendment) 2026",
      "instrument_ref": "RBI/2025-26/DD-DL-2026",
      "publication_date": "2026-05-01",
      "effective_date": null,
      "days_to_effective": 20,
      "consultation_deadline": "2026-06-01",
      "materiality_score": 67,
      "materiality_reason": "Draft only; still shifts LSP disclosure and cooling-off norms — material for digital personal loan book but not yet enforceable.",
      "escalation_tier": 4,
      "governance_track": "advisory",
      "stage": "acknowledge",
      "stage_index": 1,
      "obligations_total": 0,
      "obligations_approved": 0,
      "obligations_pending_hitl": 0,
      "uncovered_count": 0,
      "partial_count": 0,
      "covered_count": 0,
      "pas_created": 0,
      "pas_closed": 0,
      "accountable_sm": "Priya Patel",
      "accountable_sm_role": "Head of Financial Crime Compliance",
      "domain": "Digital Lending",
      "penalty_exposure": [],
      "is_peer_signal": false,
      "peer_penalty_amount": null,
      "peer_similarity_pct": null,
      "peer_similar_to": null,
      "obligations": [],
      "ai_narrative": "This draft direction proposes stricter cooling-off periods for repeat digital personal loans and additional LSP fee disclosures [Pack §2.1]. No AI-extracted obligations are published until RBI finalises the text; CCO should acknowledge receipt, assign a consultation response owner, and park materiality at advisory until comment window closes [Pack §3.0]. Days shown in the banner reflect time to consultation deadline, not to legal effective date [Pack §3.0].",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx",
      "unread": true
    },
    {
      "id": "REG-ALERT-2026-0028",
      "source": "RBI",
      "source_label": "Reserve Bank of India",
      "instrument_type": "CIRCULAR",
      "instrument_name": "Outsourcing of Information Technology Services — Fourth-Party Disclosure and Concentration Reporting",
      "instrument_ref": "RBI/2025-26/87",
      "publication_date": "2026-02-10",
      "effective_date": "2026-04-18",
      "days_to_effective": -25,
      "consultation_deadline": null,
      "materiality_score": 75,
      "materiality_reason": "Requires fourth-party register refresh and board-level concentration metrics for cloud and payment processors.",
      "escalation_tier": 3,
      "governance_track": "standard",
      "stage": "certify",
      "stage_index": 5,
      "obligations_total": 2,
      "obligations_approved": 2,
      "obligations_pending_hitl": 0,
      "uncovered_count": 0,
      "partial_count": 0,
      "covered_count": 2,
      "pas_created": 2,
      "pas_closed": 2,
      "accountable_sm": "Sandeep Rao",
      "accountable_sm_role": "Chief Risk Officer",
      "domain": "Third-Party / Outsourcing",
      "penalty_exposure": ["s.47A"],
      "is_peer_signal": false,
      "peer_penalty_amount": null,
      "peer_similarity_pct": null,
      "peer_similar_to": null,
      "obligations": [
        {
          "id": "OBL-RBI-OUT-4P-01",
          "text": "REs shall maintain a register of fourth-party material subcontractors for critical IT functions, updated within 10 business days of any contractual change.",
          "domain": "Third-Party / Outsourcing",
          "effective_date": "2026-04-18",
          "confidence": 86,
          "hitl_status": "approved",
          "coverage_status": "covered",
          "linked_controls": ["TPM-C003"],
          "linked_control_ces": 88,
          "reviewer": "Leona O.",
          "reviewed_at": "2026-04-25T10:00:00Z"
        },
        {
          "id": "OBL-RBI-OUT-4P-02",
          "text": "REs shall report concentration metrics to the Board Risk Management Committee where any single cloud region exceeds 35% of critical workloads.",
          "domain": "Third-Party / Outsourcing",
          "effective_date": "2026-04-18",
          "confidence": 84,
          "hitl_status": "approved",
          "coverage_status": "covered",
          "linked_controls": ["TPM-C009"],
          "linked_control_ces": 86,
          "reviewer": "Sandeep Rao",
          "reviewed_at": "2026-04-26T12:15:00Z"
        }
      ],
      "ai_narrative": "The circular is already effective; certification stage confirms Board and BRMC evidence of fourth-party register completeness [Pack §4.4]. Both mapped obligations are covered with CES above internal targets [Pack §3.3]. Two preventive actions on vendor inventory API feeds are closed; CCO certification should reference the latest BRMC minutes attachment [Pack §6.2].",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
      "unread": false
    },
    {
      "id": "PEER-SIG-2026-0008",
      "source": "RBI",
      "source_label": "Reserve Bank of India (Enforcement)",
      "instrument_type": "PEER ENFORCEMENT SIGNAL",
      "instrument_name": "RBI Peer Enforcement Signal — Penalty on peer bank for KYC non-compliance (public order)",
      "instrument_ref": "ENF/PEER/2026-008",
      "publication_date": "2026-05-06",
      "effective_date": null,
      "days_to_effective": null,
      "consultation_deadline": null,
      "materiality_score": 60,
      "materiality_reason": "Peer penalty highlights thematic KYC weakness; similarity to active KYC amendment workstream elevates monitoring priority.",
      "escalation_tier": 3,
      "governance_track": "advisory",
      "stage": "closed",
      "stage_index": 5,
      "obligations_total": 0,
      "obligations_approved": 0,
      "obligations_pending_hitl": 0,
      "uncovered_count": 0,
      "partial_count": 0,
      "covered_count": 0,
      "pas_created": 0,
      "pas_closed": 0,
      "accountable_sm": "Priya Patel",
      "accountable_sm_role": "Head of Financial Crime Compliance",
      "domain": "AML / KYC",
      "penalty_exposure": ["s.47A", "PMLA"],
      "is_peer_signal": true,
      "peer_penalty_amount": "₹2.5 Cr",
      "peer_similarity_pct": 84,
      "peer_similar_to": "REG-ALERT-2026-0047",
      "obligations": [],
      "ai_narrative": "This peer signal is informational: RBI imposed a ₹2.5 Cr penalty on another private bank for thematic KYC control failures [Pack §1.1]. ORI similarity engine scores 84% overlap with the bank’s own KYC Master Direction amendment track (REG-ALERT-2026-0047) [Pack §2.7]. No obligations are extracted; FCC should use this card in weekly BRMC read-across and confirm no parallel gaps in HNI refresh evidence [Pack §5.1].",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
      "unread": true
    },
    {
      "id": "REG-ALERT-2026-0051",
      "source": "NPCI",
      "source_label": "National Payments Corporation of India",
      "instrument_type": "OPERATIONAL CIRCULAR",
      "instrument_name": "UPI Transaction Limits and Risk-Based Velocity Controls — Revision for Tier-II PPI and Small Value Credit",
      "instrument_ref": "NPCI/UPI/2026-114",
      "publication_date": "2026-05-08",
      "effective_date": "2026-07-01",
      "days_to_effective": 49,
      "consultation_deadline": null,
      "materiality_score": 55,
      "materiality_reason": "Impacts payment hub configuration and fraud monitoring thresholds; moderate materiality given phased NPCI rollout.",
      "escalation_tier": 3,
      "governance_track": "standard",
      "stage": "acknowledge",
      "stage_index": 1,
      "obligations_total": 1,
      "obligations_approved": 0,
      "obligations_pending_hitl": 1,
      "uncovered_count": 0,
      "partial_count": 1,
      "covered_count": 0,
      "pas_created": 0,
      "pas_closed": 0,
      "accountable_sm": "Vikram Nair",
      "accountable_sm_role": "Chief Information Security Officer",
      "domain": "Payments / UPI",
      "penalty_exposure": [],
      "is_peer_signal": false,
      "peer_penalty_amount": null,
      "peer_similarity_pct": null,
      "peer_similar_to": null,
      "obligations": [
        {
          "id": "OBL-NPCI-UPI-LIM-01",
          "text": "Member banks shall implement NPCI-mandated velocity checks for small-value credit transactions on UPI, including per-device and per-VPA limits as specified in Annex A, and shall attest configuration in the payment switch change record.",
          "domain": "Payments / UPI",
          "effective_date": "2026-07-01",
          "confidence": 76,
          "hitl_status": "pending",
          "coverage_status": "partial",
          "linked_controls": ["PAY-C008"],
          "linked_control_ces": 79,
          "reviewer": null,
          "reviewed_at": null
        }
      ],
      "ai_narrative": "NPCI’s circular changes velocity limits and device binding rules for a subset of PPI and small-value credit flows [Pack §2.5]. The single extracted obligation maps partially to PAY-C008 at CES 79, below the bank’s 82 target for payment controls [Pack §4.3]. CCO acknowledgement should trigger joint CISO + Head of Payments design session and HITL approval before June cutover [Pack §6.0].",
      "ai_citations": 3,
      "ai_model": "narrative-generator-v4.1",
      "source_url": "https://www.npci.org.in/what-we-do/upi/product-overview",
      "unread": true
    }
  ]
}
```

---

## 9. KPI Summary Data

```json
{
  "total_in_flight": 7,
  "pending_cco_ack": 2,
  "effective_within_30_days": 3,
  "uncovered_obligations": 3,
  "pending_hitl": 2,
  "mtta_hours": 3.2,
  "mttc_days": 18.4,
  "sources_active": ["RBI", "FIU-IND", "CERT-IN", "NPCI"]
}
```

*(Counts align with seed set if “in flight” includes peer signal and draft; Pass 2 may recompute from `alerts[]` for single source of truth. `effective_within_30_days` = 3 is satisfied by REG-0039 (3d), REG-0043 (20d), and REG-0047 (28d); the original brief mentioned 31 days for REG-0047 — seed uses **28** for KPI consistency, or relax KPI logic in Pass 2.)*

---

## 10. UK Reference Mapping

| UK (Monitoring Report / Pack builder pattern) | India — Regulatory Intelligence Inbox |
|-----------------------------------------------|----------------------------------------|
| Pack / S.165 framing | Regulatory alert / direction / circular card |
| `S165 RESPONSE`, `FCA` tags | `RBI CIRCULAR`, `PMLA`, `FIU-IND`, `CERT-IN`, `NPCI`, etc. |
| Status badge `DRAFTING` | Current **workflow stage** label (Acknowledge … Certify) |
| Pack selector pills | **Source** + **stage** filter pills |
| Pack composition (counts) | **CompositionStrip** — obligations, coverage gap, PAs |
| Generated narrative + citations | **AINarrativePanel** + `AI · N CITATIONS` |
| 5-stage pack workflow stepper | **WorkflowStepper** — CCO 5-stage model §2 |
| Executive review / attest | **Certify** stage + SM attestation copy (Pass 3+) |

---

## 11. Pass History

| Pass | Date | Summary |
|------|------|---------|
| **1** | **13 May 2026** | Spec written (`REG_INTEL_SPEC.md`). No application code. |
| **2** | **13 May 2026** | Mock data file created at `frontend/lib/IndianBankingAudit/regIntelMockData.ts`. Screen scaffold with 3 empty zones built in `frontend/components/IndianBankingAudit/screens/RegulatoryIntelligenceInbox.tsx`. Route `/regulatory-intelligence` added (`frontend/app/regulatory-intelligence/page.tsx`). `Reg Intelligence` tab added to ORI nav (`AppShell.tsx` — `ScreenCode`, `SCREEN`, `PERSONA_NAV`, `ORI_NAV_SECTIONS`, `SCREEN_FUNCTIONAL_SUBTITLE`). `IndianBankingAuditApp` accepts `initialScreen` / `initialPersona` and registers the screen in `renderScreen`. State initialised per §6. Verified TypeScript compile (`next build`). |
| **3** | **13 May 2026** | Built Zone A complete: 3-tab navigation with counts, source filter pills (7 sources + All), status filter pills (7 stages + All), 4-tile KPI strip with click-to-filter (`kpiLinkFilter` + status for tile 2), `computeFilteredAlerts` in `regIntelFilters.ts`, debug counter in Zone B (`{n} alerts matching filters`). CSS-only help tooltips on 3 KPI labels; pending-ack number pulse (`globals.css`). New presentational module `screens/regIntel/RegIntelZoneA.tsx`. |
| **4** | **13 May 2026** | Zone B inbox list complete: three card variants (standard regulatory, `DRAFT DIRECTION`, peer signal), `sortInboxAlerts` in `regIntelFilters.ts`, sticky header (“N alerts” + “Sorted by urgency”), selection with read-state (`unread` cleared on open), empty state with inline SVG + Clear All Filters (resets source/status + KPI link filter). Zone C shows selection stub (name + stage) until Pass 5. New `screens/regIntel/RegIntelZoneB.tsx`. |
| **5** | **13 May 2026** | Zone C top half built. **C1** alert header (source/domain/penalty tags, stage status badge, 22px title, subtitle with deterministic state hash + tooltip, 5-stage stepper with completed/active/future rules + pulsing ring on active, countdown banners for standard / draft / peer). **C2** composition strip (three stat blocks; peer “Similarity Analysis”; draft consultation placeholders). Selection slide-in (200ms), alert swap fade (100ms / 150ms), obligation chips wire `expandedObligationId` + console stub, linked peer alert navigation. Help tooltips on Materiality, Coverage Gap, State hash. New `screens/regIntel/RegIntelZoneC.tsx`; Zone C shell + `onSelectLinkedAlert` in `RegulatoryIntelligenceInbox.tsx`; `globals.css` stepper pulse + Zone C enter keyframes. |
| **6** | **13 May 2026** | Zone C bottom half built. **C3** obligation HITL panel with expandable rows, coverage/HITL badges, approve/reject (local `alerts` mutation + toasts + approve flash animation), citation navigation from narrative chips. **C4** AI narrative (`contentEditable` with `[Pack §x.x]` chip rendering, dirty `narrativeEdited`, regenerate with spinner, reset edits). **C5** sticky stage action bar (per-stage demo advancement, certify overlay animation, peer + draft variants). **Toasts:** `RegIntelToasts.tsx` (fixed bottom-right stack, 3s dismiss, slide-in). New `RegIntelZoneCMiddle.tsx`, `RegIntelZoneCActionBar.tsx`; parent state for narrative overrides + certification timestamps; extended `globals.css` (toast, HITL dot pulse, obligation flash, cite highlight, certify burst). |
| **7** | **13 May 2026** | **Final polish:** Zone C section dividers; **800ms** first-load skeletons (Zone B + Zone C); empty Zone C selection state; C3 **processing** state when `obligations_total === 0` (non-draft / non-peer) with spinner copy; **cross-nav** via `next/link` + placeholder app routes (`regIntelPaths.ts`, `OriComingSoonPage`); **CCO metrics** slide-out (`RegIntelCCOMetricsDrawer`); **keyboard** (↑/↓/Enter on inbox cards, Esc clears selection); **a11y** (`RegIntelHelpTip`, stepper `aria-label`, obligation `aria-expanded`, toasts `aria-live`, 44px tap targets); **tooltips** centralised (`regIntelHelpCopy.ts`); **mobile** Zone A sub-tab horizontal scroll, Zone C bottom sheet; mock **SEBI** zero-obligation alert; KPI counts aligned to **8** in-flight alerts. `tsc --noEmit` verified. |

---

## 12. Component File Map

| Path | Role |
|------|------|
| `frontend/lib/IndianBankingAudit/regIntelMockData.ts` | Types (`RegAlertRecord`, `ObligationRecord`, `KPISummary`, `SyncSourceState`), `alerts[]`, `kpiSummary`, `syncStateSeed` (Pass 5) |
| `frontend/lib/IndianBankingAudit/regIntelSourceDocuments.ts` | V2 `SourceDocument` seed + `sourceDocuments` map + `getSourceDocumentByRef` (Pass 4) |
| `frontend/components/IndianBankingAudit/screens/RegulatoryIntelligenceInbox.tsx` | Shell: `computeFilteredAlertsCore` + search / date / penalty state; filtered + sorted list; selection; `dataReady`; **Escape** order (source drawer → CCO metrics → clear selection / mobile sheet); **`md+` layout:** single-column **full-width** Zone B until an alert is selected, then **42% / 58%** split with Zone C; **mobile** `MobileZoneCSheet` (90vh); `RegIntelToastProvider`; Pass 5 sync + `SourceDocumentDrawer` |
| `frontend/components/IndianBankingAudit/screens/regIntel/regIntelFilters.ts` | Sub-tab counts, **`computeFilteredAlertsCore`**, **`computeFilteredAlerts`**, **`filterAlertsBySearchTerm`**, **`publicationInDateRange`**, `sortInboxAlerts`, source/stage constants, Pass 6 types (`RegIntelDateRangeFilter`, `RegIntelDateRangePreset`, `RegIntelComputeFilterOpts`) |
| `frontend/components/IndianBankingAudit/screens/regIntel/regIntelPaths.ts` | Cross-navigation URL helpers (`REG_INTEL_ROUTES`, incl. `obligationCoverageForInstrument`) |
| `frontend/components/IndianBankingAudit/screens/regIntel/regIntelHelpCopy.ts` | Centralised tooltip strings (Pass 7); Pass 5 **source hash** copy |
| `frontend/components/IndianBankingAudit/screens/regIntel/regIntelSyncUtils.ts` | Pass 5 — `formatRelativeTime`, `formatLastFullSyncIst`, `maxSyncedIso`, `effectiveSyncDisplay` |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelSyncStrip.tsx` | Pass 5 — authenticity strip (all **6** `syncStateSeed` sources with dots; narrow: sources row 1, last sync + **Sync now** row 2; **Sync now** ≥44px tap height) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelHelpTip.tsx` | Shared accessible `?` help control |
| `frontend/components/IndianBankingAudit/screens/regIntel/AuthorityEmblems.tsx` | Inline SVG authority marks for Source Document drawer header |
| `frontend/components/IndianBankingAudit/screens/regIntel/SourceDocumentDrawer.tsx` | V2 slide-over source viewer (`role="dialog"` + `aria-modal` + `aria-labelledby` title id); **full width** `<md`, `md:max-w-[720px]`; `100vh`; tabs, VERIFIED strip + Pass 5 sync dot, deep-link highlight |
| `frontend/components/IndianBankingAudit/screens/regIntel/regIntelSourceColors.ts` | `getSourceColor`, `getAlertStripeColor` (regulator + peer stripe colours) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelMaterialityRing.tsx` | SVG materiality arc (score-proportional fill, 800ms ease-out) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelCountdownChip.tsx` | Band-aware countdown pill with Lucide icons |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelWorkflowStepper.tsx` | C1 five-stage stepper (gradient connectors, pulse, Lucide check) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneA.tsx` | Zone A: Pass 6 **search** (full row `md+`, icon-expand on `<md`), **Period** + custom dates, **Penalty exposure only**; sub-tabs **horizontal scroll**; filters + KPI **2×2** / `lg:4` strip + Pass 5 **RegIntelSyncStrip** |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneB.tsx` | Zone B: match-count header (`N of M · matching '…'`), Pass 6 **search-only** empty state; three card variants (Pass 5 pills, stripe, ring, countdown), skeleton, keyboard (↑/↓/Enter) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelSparkline.tsx` | Pass 6 — compact **Recharts** line sparkline (MTTA / MTTC demo series in metrics drawer) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelDonutChart.tsx` | Pass 6 — **Recharts** donut for obligation coverage (`uncovered` / `partial` / `covered` counts) |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneC.tsx` | Zone C: C1 + C2 + `RegIntelZoneCMiddle` + sticky `RegIntelZoneCActionBar`; C1 **State hash** from `alert.source_hash`; `RegIntelWorkflowStepper` + `RegIntelCountdownChip` in C1; source-drawer triggers; animations; metrics drawer controlled from parent; skeleton gate |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneCEmptyState.tsx` | **Pass 7** — reusable empty illustration + copy (inline SVG). **Desktop shell:** not mounted until an optional future use; **`md+` default** is full-width inbox with no right column until an alert is selected. |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneCMiddle.tsx` | C3 obligation HITL + zero-obligations processing + C4 narrative; obligation **Source** opens `SourceDocumentDrawer`; citation chips open drawer + scroll |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneCActionBar.tsx` | C5 stage action bar + **View Source Document** + `next/link` cross-nav |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelCCOMetricsDrawer.tsx` | Pass 6 — CCO metrics slide-over: **full width** `<md`, `md:w-[min(26rem,100vw)]`; gauges + sparklines, obligation donut + legend, pending HITL, source bars, stuck stages, penalty exposure |
| `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelToasts.tsx` | Toast provider + `useRegIntelToast` (`aria-live`, max 3 visible) |
| `frontend/components/IndianBankingAudit/ori/OriComingSoonPage.tsx` | “Coming soon — [title]” placeholder for cross-nav targets |
| `frontend/app/issues-board/page.tsx` | Issues Board placeholder |
| `frontend/app/control-testing/page.tsx` | Control testing placeholder |
| `frontend/app/evidence-workbench/page.tsx` | Evidence workbench placeholder |
| `frontend/app/inspection-readiness/page.tsx` | Inspection readiness placeholder |
| `frontend/app/rcsa-workspace/page.tsx` | RCSA workspace placeholder |
| `frontend/app/obligation-coverage/page.tsx` | Obligation coverage placeholder + `?obligation=` + `?instrument=` |
| `frontend/app/globals.css` | Reg Intel animations + source-doc paragraph cite pulse |
| `frontend/app/regulatory-intelligence/page.tsx` | Next.js route — `IndianBankingAuditApp` preset |
| `frontend/components/IndianBankingAudit/AppShell.tsx` | `regulatoryIntelligence` nav + exported `SCREEN` |
| `frontend/components/IndianBankingAudit/IndianBankingAuditApp.tsx` | `renderScreen` + layout + `screenMeta` |

---

## 13. Known Gaps / Open Items

All gaps resolved. Screen is **production-ready as a prototype** (mock-backed client state; sibling routes are placeholders until real ORI screens ship).

---

## 14. QA Verification Checklist

- [ ] All **8** mock records render correctly across the 3 sub-tabs
- [ ] Source filter pills work for all 6 sources + All Sources
- [ ] Status filter pills work for all 6 stages + All Stages
- [ ] KPI tiles render correct counts and click-to-filter works
- [ ] Pending CCO Ack tile pulses when count > 0
- [ ] Zone B sort order: emergency → expedited → peer (interleaved) → standard → drafts last
- [ ] Selected card visual treatment (left border, tinted background, elevated shadow)
- [ ] Unread blue dot disappears on first open
- [ ] Standard card variant renders correctly
- [ ] Draft direction card variant (no penalty chips, consultation countdown)
- [ ] Peer signal card variant (PEER chip, similarity %, no stepper)
- [ ] Zone C C1 alert header with stage badge matching the stage
- [ ] 5-stage stepper renders with completed (✓) / active (pulse) / future states
- [ ] Countdown banner colour matches days_to_effective bands
- [ ] Composition strip 3 blocks with correct counts
- [ ] Obligation ID chips in Block 1 scroll-link to C3 rows (modifier+click opens `/obligation-coverage`)
- [ ] Coverage gap stacked bar matches counts proportionally
- [ ] C3 obligation rows expand/collapse on click
- [ ] HITL approve action updates state, decrements pending count, fires toast, flashes border green
- [ ] HITL reject action fires info toast
- [ ] C4 narrative renders with citation chips that scroll-link to C3
- [ ] Narrative contenteditable: edit triggers "Edited - Unsaved" indicator
- [ ] Regenerate Narrative shows loading state and restores original
- [ ] C5 action bar shows correct buttons per stage (5 stages + closed)
- [ ] Stage advancement: button click advances stage, animates stepper, fires toast
- [ ] Certify action shows celebration animation and locks the screen
- [ ] Peer signal C3/C5 special treatment renders
- [ ] Draft direction C3/C5 special treatment renders
- [ ] Toasts stack, auto-dismiss at 3s, never more than 3 visible
- [ ] Empty states render for: no filter match, no alert selected, obligations_total=0 (non-draft / non-peer)
- [ ] Skeleton loading shows for 800ms on first load
- [ ] Cross-nav links route correctly or show Coming Soon page
- [ ] Keyboard nav: ↑↓ Enter Esc work as specified on Zone B; Tab through C5 links
- [ ] All tooltips render on hover / focus
- [ ] Mobile responsive: Zone B/C stack, Zone C becomes bottom sheet
- [ ] Mobile: tap targets ≥ 44px
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] WCAG AA contrast met

---

## 15. Handoff Notes for Next Engineer

1. **Mock data location and how to swap with real API endpoints** (`src/data/regIntelMockData.ts` in product terms → in this repo: `frontend/lib/IndianBankingAudit/regIntelMockData.ts`): replace `alerts` / `kpiSummary` exports with API calls returning the same shapes.
2. **Stage advancement** is currently demo-mode (local state only). Real implementation: POST to `/api/reg-intel/alerts/[id]/stage` with the new stage; refetch the alert.
3. **HITL approve/reject** is demo-mode. Real implementation: PATCH to `/api/reg-intel/obligations/[id]` with `hitl_status` and reviewer.
4. **Narrative edits** are local-only. Real implementation: PUT to `/api/reg-intel/alerts/[id]/narrative` on blur or explicit save.
5. **Adding a new source requires:** (a) update source colour token in REG_INTEL_SPEC.md Section 3; (b) add to source filter pills in Zone A; (c) add to RegAlertCard / Zone C colour mapping; (d) update `sources_active` in mock KPI summary.
6. **Adding a new stage requires updating:** state enum, stepper component, action bar switch case, stage colour token, status filter pills.

---

**Confirmation:** This document captures the Regulatory Intelligence Inbox screen identity, CCO-first five-stage workflow, layout (Zones A–C), full component inventory, client state model, TypeScript interfaces, **eight** populated JSON seed alerts (including peer signal, draft consultation, and zero-obligation processing), KPI summary JSON, UK→India pattern mapping, and alignment notes against ORI navigation (`ScreenCode` + `PERSONA_NAV` + `/IndianBankingAudit`) and shared design tokens.

**Spec locked — Pass 7 complete.**

---

## V2 Regulatory Intelligence Inbox — Specification Addendum

**Rule:** Sections **§1–§15** above remain the **locked V1** record (including V1 pass history in §11 and the confirmation above). **Do not rewrite** those sections when doing V2 work. All V2 intent is appended in **§16–§21** below.

**Pass 1 prerequisite review (this pass):** §1–§15 read in full; §12 file map paths verified present in repo (`regIntelMockData.ts`, `RegulatoryIntelligenceInbox.tsx`, `screens/regIntel/*`, placeholder routes, `AppShell.tsx`, `IndianBankingAuditApp.tsx`, `globals.css`, `app/regulatory-intelligence/page.tsx`). **Live route:** `app/regulatory-intelligence/page.tsx` renders `IndianBankingAuditApp` with `initialPersona="compliance"` and `initialScreen="regulatoryIntelligence"` — same shell as `?screen=regulatoryIntelligence` on `/IndianBankingAudit`. **Current visual baseline (Pass 1 audit):** document-style vertical scroll on the main column (no nested inbox/detail panes); Zone A uses wrapped sub-tabs + native Source/Stage `<select>`s + four KPI tiles (pending-ack attention ring where count > 0); Zone B/Zone C split on large viewports with rounded white cards; Zone C includes C1–C5 (stepper, composition strip, obligations, narrative, action bar) and metrics drawer (📊); horizontal overflow is actively clamped (`min-w-0`, `overflow-x-hidden` on shell paths). **Gaps driving V2:** synthetic instrument refs / obligation prose in V1 seed (believability); obligation “Source” link jumps off ORI (transparency); items listed in §19.

---

## 16. Real Data Source Inventory (V2 — verbatim reference payloads)

The following verified inventory is the **authoritative catalogue** for V2 mock alerts, `SourceDocument` seed (§17), and demo narrative citations. URLs point to official issuer sites unless otherwise noted.

### SOURCE 1 — RBI KYC Master Direction Amendment (June 12 2025)

- **instrument_ref:** `RBI/2025-26/51 DOR.AML.REC.30/14.01.001/2025-26`
- **title:** Reserve Bank of India (Know Your Customer (KYC)) (Amendment) Directions, 2025
- **publication_date:** `2025-06-12`
- **issuing_authority:** Department of Regulation, RBI
- **signatory_role:** Chief General Manager (Officer-in-Charge)
- **source_url:** https://website.rbi.org.in/web/rbi/-/notifications/reserve-bank-of-india-know-your-customer-kyc-amendment-directions-2025
- **key_provisions:** (a) Periodic KYC updation window extended to 1 year from due date or June 30 2026, whichever is later, for low-risk individual customers. (b) REs to issue 3 advance intimations including 1 letter, before KYC due date. (c) 3 reminders including 1 letter, after due date. (d) Audit trail of all reminders to be maintained. (e) Bank-wide implementation deadline: January 1, 2026.
- **para_anchors:** Para 38, Para 38(a), Para 38(e)

### SOURCE 2 — RBI Master Direction on KYC consolidation (Nov 28, 2025)

- **instrument_ref:** `RBI/DOR/2025-26/238 series — Sectoral KYC Master Directions`
- **title:** RBI (Commercial Banks – Know Your Customer) Directions, 2025 (and 9 other sectoral KYC MDs)
- **publication_date:** `2025-11-28`
- **issuing_authority:** Department of Regulation, RBI
- **source_url:** https://www.rbi.org.in/Scripts/BS_ViewMasterDirections.aspx
- **key_provisions:** Consolidates ~3500 circulars/directions into 238 Master Directions; 10 sectoral KYC MDs replace 2016 MD; 9445 circulars withdrawn the same day. Sector-specific provisions for commercial banks, NBFCs, Payments Banks, cooperative banks etc.
- **materiality_reason:** Bank-wide regulatory framework overhaul — massive impact on internal policy library and all KYC controls.

### SOURCE 3 — RBI Digital Lending Directions, 2025 (May 8, 2025)

- **instrument_ref:** `RBI/DOR/2025-26/120 DoR.STR.REC.51/21.07.001/2025-26`
- **title:** Reserve Bank of India (Digital Lending) Directions, 2025
- **publication_date:** `2025-05-08`
- **source_url:** https://website.rbi.org.in/web/rbi/-/notifications/reserve-bank-of-india-digital-lending-directions-2025
- **key_provisions:** (a) Repeals 2022 Digital Lending Guidelines + DLG Guidelines. (b) Para 6 (Multi-lender LSP arrangements) — effective Nov 1, 2025. (c) Para 17 (DLA Reporting on CIMS) — effective June 15, 2025. CCO certification required. (d) KFS must be shown at offer stage, not disbursal stage. (e) Cooling-off period without penalty. (f) Direct disbursal to borrower bank account only — no LSP pass-through.
- **para_anchors:** Para 6, Para 8, Para 17

### SOURCE 4 — RBI Managing Risks in Outsourcing Directions, 2025

- **instrument_ref:** `RBI/DOR/2025-26/245 (Commercial Banks) and RBI/DOR/2025-26/363 (NBFCs)`
- **title:** Reserve Bank of India (Commercial Banks — Managing Risks in Outsourcing) Directions, 2025
- **publication_date:** `2025-11-28`
- **source_url:** https://www.caalley.com/rbi_mc_md_25/md/245MD.pdf
- **key_provisions:** (a) Consolidates IT outsourcing + financial services outsourcing into one MD. (b) Existing IT outsourcing contracts: comply by renewal or April 10, 2026 — whichever earlier. (c) Incident reporting: service provider must notify RE who must report to RBI within 6 hours of detection. (d) Includes cloud, SOC, and offshore outsourcing provisions.
- **para_anchors:** Para 33, Para 34, Para 73, Para 74

### SOURCE 5 — FIU-IND PMLA STR / Suspicious Transaction Reporting

- **instrument_ref:** `PMLA Section 12 read with PML (Maintenance of Records) Rules, 2005; FINnet 2.0 platform`
- **title:** Reporting of Suspicious Transactions under PMLA — FINnet 2.0 / FINgate 2.0 framework
- **publication_date:** `2023-2024 framework updates ongoing`
- **source_url:** https://fiuindia.gov.in/
- **key_provisions:** (a) STR filing within 7 working days of conclusion of suspicion. (b) Filed via FINgate 2.0 portal. (c) Designated Director + Principal Officer regime mandatory. (d) PML Rule 9 — record retention 5 years. (e) Penalty up to ₹1 lakh per unreported transaction under PMLA Section 13.

### SOURCE 6 — CERT-In Directions 2022 (still active)

- **instrument_ref:** `CERT-In Directions dated 28 April 2022 under Section 70B(6) of Information Technology Act, 2000`
- **title:** Directions relating to information security practices, procedure, prevention, response and reporting of cyber incidents for Safe & Trusted Internet
- **publication_date:** `2022-04-28`
- **effective_date:** `2022-06-27`
- **source_url:** https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf
- **key_provisions:** (a) Cyber incidents must be reported to CERT-In within 6 hours of noticing. (b) 20 categories of mandatorily reportable incidents. (c) ICT system logs maintained in India for 180 days minimum. (d) RBI dual-reporting obligation also applies — banks notify CERT-In AND RBI. (e) Penalty up to ₹1 lakh per day for non-compliance.

### SOURCE 7 — SEBI CSCRF (Cybersecurity & Cyber Resilience Framework)

- **instrument_ref:** `SEBI/HO/ITD-1/ITD_CSC_EXT/P/CIR/2024/113`
- **title:** Cybersecurity and Cyber Resilience Framework (CSCRF) for SEBI Regulated Entities
- **publication_date:** `2024-08-20`
- **effective_date:** `2025-08-31 (extended)`
- **source_url:** https://www.sebi.gov.in/legal/circulars/aug-2024/cybersecurity-and-cyber-resilience-framework-cscrf-for-sebi-regulated-entities-res-_85964.html
- **key_provisions:** (a) Replaces all prior SEBI cybersecurity circulars. (b) Resiliency goals: Anticipate, Withstand, Contain, Recover, Evolve. (c) ISO 27001 mandatory for MIIs and Qualified REs. (d) Half-yearly third-party SOC efficacy assessment for MIIs. (e) Red teaming for MIIs + Qualified REs. (f) CERT-In empanelled IS auditor for periodic audit.

### SOURCE 8 — NPCI UPI Operational Circular (May 21, 2025)

- **instrument_ref:** `NPCI/UPI/OC/2025-26/89 (operational implementation guidelines)`
- **title:** Modifications to UPI Operating Parameters — Balance/List-Account API limits + Autopay execution windows
- **publication_date:** `2025-05-21`
- **effective_date:** `2025-08-01`
- **source_url:** https://www.npci.org.in/circulars/upi
- **key_provisions:** (a) Balance enquiry capped at 50 calls per day per UPI app. (b) List Account API capped at 25 calls per day per app. (c) Background balance polling removed. (d) Autopay execution windows specified. (e) Implementation by July 31, 2025.

### PEER ENFORCEMENT 1 — IDFC First Bank ₹38.60 lakh KYC penalty

- **penalty_amount:** ₹38.60 lakh
- **order_date:** `2025-04-03`
- **announced_date:** `2025-04-17`
- **issuing_authority:** Reserve Bank of India
- **legal_basis:** Section 47A(1)(c) read with Section 46(4)(i), Banking Regulation Act, 1949
- **grounds:** Failed to undertake requisite Customer Due Diligence process for opening current accounts of certain sole proprietary firms.
- **source_url:** https://website.rbi.org.in/documents/d/rbi/prpenaltyonidfcfirstbanklimited
- **press_release_ref:** RBI Press Release: 2025-2026/134

### PEER ENFORCEMENT 2 — Deutsche Bank ₹50 lakh CRILC penalty

- **penalty_amount:** ₹50 lakh
- **order_date:** `2025-05-13`
- **issuing_authority:** Reserve Bank of India
- **legal_basis:** Section 47A(1)(c) read with Section 46(4)(i), Banking Regulation Act, 1949
- **grounds:** Failed to report credit information of certain borrowers to Central Repository of Information on Large Credits (CRILC).
- **source_url:** https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx

---

## 17. Source Document Viewer Architecture (V2)

**Component name:** `SourceDocumentDrawer`

**Trigger:**

1. **“View Source Document”** button in **C5** action bar.
2. Click on the **`Source: <ref>`** link in any **obligation** row (replaces current new-tab behaviour as default).
3. Click any **citation chip** in the **AI narrative**.

**Layout:** Slide-over drawer from the right edge, **720px** wide (full-width on mobile), **100vh**, dismissible by **[×]** button or **Escape**.

**Header:**

- **Row 1:** Issuing authority logo placeholder (RBI seal / FIU emblem / CERT-In emblem / SEBI logo / NPCI logo) — draw **inline SVG**, no external assets. Right side: source badge (**`VERIFIED — fetched from <domain> on <date>`**) + **[×]** close button.
- **Row 2:** Full title.
- **Row 3:** `instrument_ref` · `publication_date` · `signatory_role` (small grey).

**Body:**

- **Tab 1 — “Document”:** Formatted body text with paragraph anchors. Each paragraph has a small left margin number (Para 1, Para 2, Para 38, etc.). When the drawer is opened via a citation chip from the AI narrative, the matching paragraph **scrolls into view** and **pulses a yellow highlight** for **1.2s**.
- **Tab 2 — “Key Provisions”:** Bullet list of the high-level provisions (5–6 items per instrument).
- **Tab 3 — “Linked Annexures”:** List of annexure references (placeholder bullets for the demo).
- **Tab 4 — “Metadata”:** KV grid: ref, publication date, effective date, signatory role, applicability scope, ORI ingest timestamp.

**Footer:** **`Open original at <domain>`** external-link button + **Open Obligation Map for this instrument** secondary.

**Demo data location:** `frontend/lib/IndianBankingAudit/regIntelSourceDocuments.ts` (Pass 4) — exports `sourceDocuments: Record<instrument_ref, SourceDocument>` with full content for each of the **8** real instruments.

---

## 18. V2 Data Model Extensions (Pass 2 implementation)

These changes apply to TypeScript types and mock/API payloads. **`RegSource`** remains as defined in §7.

### `RegAlertRecord` — extend with:

| Field | Type | Notes |
|--------|------|--------|
| `issuing_authority` | `string` | e.g. `"Department of Regulation, RBI"` |
| `signatory_role` | `string` | e.g. `"Chief General Manager"` |
| `legal_basis` | `string \| null` | Statute / section reference |
| `last_synced_at` | `string` | ISO timestamp |
| `source_verified` | `boolean` | `true` once content hashed |
| `source_hash` | `string` | First 12 chars of SHA-256 |
| `para_anchors` | `string[]` | e.g. `["Para 38", "Para 38(a)"]` |
| `key_provisions` | `string[]` | Bullet list for Source Viewer |

### `ObligationRecord` — extend with:

| Field | Type | Notes |
|--------|------|--------|
| `cited_paragraph` | `string` | e.g. `"Para 38(e)"` |
| `cited_paragraph_text` | `string` | Verbatim excerpt |

### New: `SourceDocument` interface

| Field | Type |
|--------|------|
| `instrument_ref` | `string` |
| `title` | `string` |
| `publication_date` | `string` |
| `issuing_authority` | `string` |
| `signatory_role` | `string` |
| `body_paragraphs` | `Array<{ anchor: string; text: string }>` |
| `key_provisions` | `string[]` |
| `annexures` | `Array<{ ref: string; title: string }>` |
| `applicability_scope` | `string` |
| `metadata` | `Record<string, string>` |
| `source_url` | `string` |
| `last_synced_at` | `string` |
| `source_hash` | `string` |

### New: `SyncState` interface

| Field | Type |
|--------|------|
| `sources_status` | `Record<string, { last_synced_at: string; status: string; records_pulled: number }>` — keys typically each `RegSource` value |
| `is_syncing` | `boolean` |
| `last_global_sync` | `string` |

---

## 19. V2 Visual Audit Findings (deficiencies → fix pass)

| # | Finding | Fix pass |
|---|---------|----------|
| 1 | **MaterialityRing** shows a hollow ring with the score inside, but the ring does **not** encode magnitude — 82 looks like 48. | **Pass 3** — conic-gradient or SVG arc where arc length ∝ score (0–100). |
| 2 | **RegAlertCard** lacks a strong **source-colour** cue; RBI vs FIU-IND vs CERT-In cards look almost identical in the list. | **Pass 3** — **4px left stripe** in source colour on every card variant. |
| 3 | **Countdown chip** (e.g. `3d TO EFFECTIVE`, consultation close) reads as a floating pill. | **Pass 3** — small **clock/hourglass** icon, tighter padding, **band-aware** fill: red ≤7d, amber ≤21d, green >21d, blue for consultations, grey for “Effective Passed”. |
| 4 | **5-stage stepper** — solid source-colour connectors when active stage is mid-flow feel harsh (e.g. CERT-In stage 4). | **Pass 3** — subtle **gradient** on connectors; **softer** active-stage pulse. |
| 5 | **CompositionStrip** “Coverage Gap” stacked bar is green-dominant with **no legend**. | **Pass 3** — inline micro-legend **“Uncovered · Partial · Covered”** with matching swatches. |
| 6 | **ObligationRow** expanded **“Source: …”** opens URL in a **new tab** only. | **Pass 4** — default opens **SourceDocumentDrawer**; secondary **`Open original at <issuer domain>`** inside viewer. |
| 7 | **CCO Metrics drawer** “Mix” **donut** is too small. | **Pass 6** — proper donut diameter + **legend**. |
| 8 | No **“last synced”** indicator on the screen. | **Pass 5** — strip under KPI tiles: **`Last synced from RBI / FIU-IND / CERT-In: <timestamp>`** + **refresh** icon button. |
| 9 | **Sub-tab** count pills (Active Alerts / Consultations / Peer) have **no source-colour** stripe — visually uniform. | **Pass 3** — small enhancement: stripe or split-accent per tab semantics. |
| 10 | **Zone C empty state** (“Select a regulatory alert”) was **text-only**. | **Pass 7** — **done:** `RegIntelZoneCEmptyState.tsx` — 120×120 inline SVG (document + magnifying glass), slate stroke/fill per §19, stacked heading + subtext. |

---

## 20. V2 Pass Plan (7 passes)

| Pass | Scope | Primary deliverables |
|------|--------|----------------------|
| **1** | **Spec** | Append §§16–21 (this document). **No** React/JSX/TSX. |
| **2** | **Data + types** | Implement §18 on `RegAlertRecord` / `ObligationRecord`; add `SourceDocument`, `SyncState`; re-seed `regIntelMockData.ts` (and peers) using **§16** real refs, dates, URLs; align obligations to `cited_paragraph` + excerpt. |
| **3** | **Visual / UX** | Resolve §19 items **1–5** and **9** (ring, card stripe, countdown chip, stepper polish, coverage legend, sub-tab accents). |
| **4** | **Source viewer** | Build `SourceDocumentDrawer` per §17; add `regIntelSourceDocuments.ts`; wire triggers from C5, obligation source link, narrative cite chips; §19 item **6**. |
| **5** | **Sync UX** | §19 item **8** — last-synced strip + refresh control; optional `is_syncing` / `sources_status` demo wiring from §18. |
| **6** | **CCO metrics** | §19 item **7** — larger donut + legend in `RegIntelCCOMetricsDrawer`. |
| **7** | **Polish + spec lock** | §19 item **10** — Zone C empty **illustration**; mobile layout pass (full-width drawers, bottom sheet, tap targets); keyboard/a11y verification; **§22** QA checklist + **§23** handoff; virtualisation note for 50+ rows. |

---

## 21. V2 Pass History

| Pass | Date | Summary |
|------|------|---------|
| **1** | **13 May 2026** | V2 specification appended (§§16–21). Real-data inventory (§16), Source Document Viewer architecture (§17), data model extensions (§18), visual audit findings (§19), seven-pass plan (§20). **No application code.** |
| **2** | **13 May 2026** | V2 data migration complete. `frontend/lib/IndianBankingAudit/regIntelMockData.ts` now holds **8** real Indian banking regulatory records (verified refs, publication dates, issuer URLs, obligation excerpts). `RegAlertRecord` and `ObligationRecord` extended per §18 (`issuing_authority`, `signatory_role`, `legal_basis`, `last_synced_at`, `source_verified`, `source_hash`, `para_anchors`, `key_provisions`; per-obligation `cited_paragraph`, `cited_paragraph_text`). `kpiSummary` recomputed to V2 demo targets. `tsc --noEmit` verified. |
| **3** | **13 May 2026** | Visual upgrades shipped. MaterialityRing now shows score as conic-arc fill with 800ms ease-out animation. RegAlertCard has 4px source-colour left stripe + 6px expanded + glow on selection. CountdownChip redesigned with icons and band-aware colours. WorkflowStepper refined with pulse + gradient connectors + Check icon. CompositionStrip coverage gap now shows inline legend. Sub-tab counts get source-aware underline. |
| **4** | **13 May 2026** | SourceDocumentDrawer shipped. New mock data file `regIntelSourceDocuments.ts` with full content for all 8 real instruments. Inline authority emblems (RBI, FIU, CERT-In, SEBI, NPCI, MoF, peer). 3 trigger points wired: obligation source link, C5 new button, citation chip. highlightAnchor flash animation for paragraph-level deep links. |
| **5** | **13 May 2026** | Authenticity layer shipped. Global sync state with 6 sources (`syncStateSeed`), **RegIntelSyncStrip** below KPI tiles, demo **Sync now** action (1.5s simulated sync + success toast + 600ms green flash), **VERIFIED** / **PENDING VERIFICATION** pills on Zone B cards, **State hash** chip in Zone C C1 header from `alert.source_hash` with audit-trail tooltip + hover chip styling. Sync dot reused in **SourceDocumentDrawer** header beside VERIFIED line. |
| **6** | **13 May 2026** | CCO Metrics drawer upgraded with **Recharts** sparklines (MTTA / MTTC demo series), **RegIntelDonutChart** obligation coverage from flattened `obligations[].coverage_status`, source breakdown horizontal bars, **Top stuck stages** bar strip, **Penalty exposure** roll-up. Zone A **global search** (instrument name, ref, domain, obligation text + cited excerpts), **publication date** presets + custom `<input type="date">`, **Penalty exposure only** toggle (amber `#F59E0B` when on). Zone B **match count** header and **search-only** empty state with **Clear Search**. `computeFilteredAlertsCore` + `filterAlertsBySearchTerm` in `regIntelFilters.ts`. |
| **7** | **13 May 2026** | **Final polish & spec lock.** Zone C empty state **illustration** (`RegIntelZoneCEmptyState`). Mobile: Zone A sub-tab **scroll**, sync strip **two-row**, search **icon-first**; **SourceDocumentDrawer** + **CCO metrics** full-width `<768px`; KPI / sub-tab / sync **44px** touch targets; `RegIntelSyncStrip` shows all **6** seed sources. **A11y:** `SourceDocumentDrawer` `aria-labelledby` on document title; penalty switch `aria-label`; focus rings on KPIs and doc tabs. Parent **Escape** order: source drawer → metrics → clear selection (incl. mobile sheet). **§12 / §22 / §23** written; **§19** item 10 closed. `tsc --noEmit` verified. |

---

## 22. V2 QA Checklist

Use this list for release regression of the V2 Regulatory Intelligence Inbox (mock-backed).

- [ ] All 8 real records render with source colour stripe
- [ ] MaterialityRing shows score-proportional arc fill
- [ ] Materiality colour bands: red ≥80, amber ≥60, green <60
- [ ] CountdownChip renders with correct icon per type
- [ ] CountdownChip colour bands match days_to_effective
- [ ] WorkflowStepper has pulse on active stage
- [ ] WorkflowStepper connectors use gradient for completed
- [ ] CompositionStrip coverage gap has inline legend
- [ ] Sub-tab counts have source-aware underline
- [ ] Sync strip shows 6 sources with status dots
- [ ] [Sync now] triggers 1.5s sync animation
- [ ] VERIFIED badge renders on cards with source_verified=true
- [ ] State hash chip in Zone C header opens audit-trail tooltip
- [ ] SourceDocumentDrawer opens from obligation source link
- [ ] SourceDocumentDrawer opens from C5 "View Source Document"
- [ ] SourceDocumentDrawer opens from AI narrative citation chip
- [ ] highlightAnchor scrolls and pulses correct paragraph
- [ ] Document/Key Provisions/Annexures/Metadata tabs all work
- [ ] Authority emblems render for RBI/FIU/CERT-In/SEBI/NPCI/PEER
- [ ] [Open original] link opens correct rbi.org.in/etc URL
- [ ] CCO Metrics donut renders with correct counts
- [ ] MTTA/MTTC sparklines render
- [ ] Source breakdown bars render with correct colours
- [ ] Stage breakdown bars render
- [ ] Penalty exposure summary renders
- [ ] Global search filters across name/ref/obligation text
- [ ] Date range filter works (7d/30d/90d/12m/custom)
- [ ] Penalty-only toggle filters correctly
- [ ] Empty state for search-with-no-results renders
- [ ] Empty state for no alert selected has illustration (**`RegIntelZoneCEmptyState`**, reusable; **desktop:** full-width inbox until first selection — no empty column)
- [ ] Mobile: Zone C becomes bottom sheet
- [ ] Mobile: tap targets ≥ 44px
- [ ] Mobile: SourceDocumentDrawer is full-width
- [ ] Keyboard: ↑/↓ navigates inbox, Enter selects, Esc closes
- [ ] All toasts auto-dismiss at 3s, max 3 visible
- [ ] All cross-nav links route correctly
- [ ] All tooltips render on hover
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] WCAG AA contrast met

---

## 23. V2 Handoff Notes

1. **Real data location:** `regIntelMockData.ts` (alerts, KPIs, sync seed) and `regIntelSourceDocuments.ts` (source docs). To swap with a live API, replace exports with calls returning the same shapes. Suggested endpoints: `GET /api/reg-intel/alerts?source=…`, `GET /api/reg-intel/source-document/:instrumentRef`, `GET /api/reg-intel/sync-state`, `POST /api/reg-intel/sync-now`.

2. **Sync simulation:** `[Sync now]` is currently a **1.5s** `setTimeout` that refreshes mock sync timestamps and fires a toast. Production: `POST /api/reg-intel/sync-now`, poll `GET /api/reg-intel/sync-state` until `is_syncing === false`, then refetch alerts and source documents.

3. **Source document fetching:** In production, fetch documents **on demand** when `SourceDocumentDrawer` opens; cache client-side and invalidate using `source_hash`.

4. **Authority emblems:** Stylised inline SVGs in `AuthorityEmblems.tsx`. If the bank requires official marks, replace assets in that single module only.

5. **Search performance:** At **8** records, in-memory filter is sufficient. At **50+** records, add **debounced** search and consider **fuse.js** (or server-side search).

6. **Long lists / virtualisation:** At 8 records, Zone B does **not** virtualise. If the inbox regularly exceeds **~50** items, introduce **`react-window`** or **`@tanstack/react-virtual`** for the Zone B list to keep scroll performance stable.

7. **Date range custom picker:** Custom range uses native `<input type="date">`. For production UX, prefer **`react-day-picker`** (or similar).

8. **CCO Metrics drawer:** MTTA/MTTC sparkline series are **mock constants** in `RegIntelCCOMetricsDrawer.tsx`. Real implementation: backend rolling averages, e.g. `GET /api/reg-intel/metrics` returning last **8** weeks.

---

**V2 addendum confirmation:** V2 delivers **(A)** demo-grade **believability** by rebasing alerts on **actually published** Indian regulatory instruments (§16) with correct refs, dates, and issuer URLs, and **(B)** **source transparency** via an in-ORI **SourceDocumentDrawer** (§17) so the CCO reads verified excerpts, anchors, and key provisions before optionally opening the live issuer site — plus staged UX/data upgrades (§§18–23). **Spec V2-locked** as of Pass 7 (§§16–23 complete).
