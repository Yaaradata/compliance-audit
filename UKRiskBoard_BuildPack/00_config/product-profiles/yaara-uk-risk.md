# Product Profile -- Yaara Risk & Compliance (UK Board Risk View)

> Onboarded at Phase 0 on 27 October 2026.
> - **Research basis:** the UK Risk Board View Stage 0 runs (GP, OP, GM) and the Stage 1 merged corpus `UKRISK-stage1-merged-27Oct2026.md`. Merged finding IDs (M-x-nn) are cited inline.
> - **Existing build facts:** taken from the current UK Banking Audit build (v6 live).
> - **Unverified slots:** marked `[unverified -- confirm with user]`.

## Identity
PRODUCT_FAMILY: Yaara Risk & Compliance (built in the same compliance-audit application as SWIFT and the regional audit variants)

PRODUCT_NAME: Yaara Risk & Compliance -- UK Banking

PRODUCT_MODULE: UK Board Risk View. This is the board-altitude layer above the existing control-level UK Banking Audit:
- CRO (SMF4) board view;
- Head of Compliance (SMF16) CRSA cockpit;
- Head of Financial Crime / MLRO (SMF17) workspace;
- nine risk domains.

POSITIONING_WEDGE: risk as a strategic lever, not risk monitoring for compliance. The product links strategy → risk appetite statement → Level 1/2/3 metrics → controls → named owners → reportability in one evidenced chain. A board can then see how much risk capacity it is using to grow, where the chain is broken, and what must be decided or reported. Incumbent GRC tools hold the parts; they do not hold the chain (M-J-09, M-S-02).

## DOMAIN SPINE (the chain every artifact must trace)

Strategic Objective → RAS Statement (capacity → appetite) → Level 1 Metric → Level 2/3 Indicators and Thresholds → Policy Obligation → Control → Evidence / Data Feed → Accountable Owner (SMF · risk owner · control owner) → Attestation → Escalation / Reportability Decision.

**Hard fail:** a board-level status ("within appetite", green, a headroom figure) shown without the chain behind it. The chain is:
- the threshold and its calibration rationale;
- the feeding indicators;
- a reconciled data feed;
- a named accountable owner;
- the latest attestation.

Specific hard fails, each traced to enforcement evidence:
- "Within appetite" on a metric whose source feed is unreconciled or stale. This is the Metro silent-failure shape (M-H-04, M-D-06).
- A regulatory restriction (VREQ or s166 action) shown without a population-level adherence test. This is the Starling and Monzo shape (M-G-02, M-H-02, M-H-03).
- A risk, metric, policy or VREQ with no accountable SMF (M-D-01).

## Boundary

PRODUCT_BOUNDARY:
- **Consumes** the bank's own records:
  - risk appetite and limit registers;
  - KRI time series;
  - control registers and test results;
  - RCSA outputs;
  - issue and action logs;
  - incident and loss events;
  - complaints and FOS outcomes;
  - the policy register;
  - SMCR Statements of Responsibilities and the Management Responsibilities Map;
  - the regulatory obligation library;
  - technology change and parameter logs;
  - data-feed reconciliation counts;
  - audit findings;
  - the VREQ / s166 register;
  - the model inventory;
  - committee papers and minutes.
- **Owns:**
  - the cascade graph (strategy-to-control links);
  - threshold calibration records;
  - the tension register;
  - attestation records;
  - the reportability decision log;
  - the read-across log;
  - the precedent corpus (real UK Final Notices, posture-tagged).
- **Never owns:**
  - the GRC system of record;
  - the core banking or monitoring engines;
  - the regulatory return itself.

DOES_NOT_DO (boundary hard fails):
- **Never decides reportability.** AI may prepare the case against SUP 15.3, FR7, SUP 15.11, the SAR test, OFSI and the ICO, and may challenge it. A named human SMF records the decision, with a timestamp and rationale (M-C-12).
- **Never submits anything to a regulator, the NCA, OFSI or the ICO.** Action labels read "prepare", "draft" or "propose", never "file" or "notify now".
- **Never re-tunes a threshold or model parameter autonomously.** Changes are proposed, approved by the accountable owner and logged against the appetite metric they move. This follows PRA SS1/23 governed-change expectations (M-I-10).
- **Never presents a practice as a rule.** "10–12 metrics" and "six-monthly SMF certification" are labelled firm practice (M-K-01, M-K-02).
- **Never shows a cost or ROI lens that trades financial-crime compliance against revenue.** A regulatory floor is not a tradeable tension (M-G-04). This is the NatWest failure shape: escalate rather than build.
- **AI outputs are always marked.** Every AI-generated element carries the AI marker and "accepted by X on date Y".
- **Data labelling.** Synthetic data is always labelled. Enforcement precedents are always real and posture-tagged.

## Analysis method (product IP -- lives in the methodology file)

ANALYSIS_METHOD: appetite-cascade assurance. A surfaced unit is an **appetite position with its chain integrity**. This means either:
- a position against a threshold (headroom, trajectory or breach); or
- a break in the chain (unowned, unmapped, unreconciled, unattested, or a tension collision).

METHODOLOGY_FILE: product-methodologies/yaara-uk-risk-analysis-method.md

## Domain component vocabulary (reuse; do not invent)

**Already built (v6):**
- risk-domain overview across the nine domains;
- DomainDrillPanel with lens toggle (Assurance, Exposure, Momentum, Ownership, Defensibility);
- precedent corpus panel (12 real UK precedents);
- CRSA cycle cockpit;
- MLRO workspace with an Operational Assurance / Inherent Exposure / Fraud toggle;
- built but not yet wired: SuppressionLedger, DispositionDispersion, ScreeningDenominator, CadenceFeasibility, OperationalAssuranceVerdict.

**New for the board layer (named from the research):**
- strategy strip (objectives with appetite consumed);
- RAS headline scorecard (configurable cap, default about 12);
- headroom gauge (appetite set vs actual vs forecast);
- threshold cascade (capacity → red → amber → operating limit, with rationale);
- leading-indicator tree;
- chain-integrity badge (owner · feed · attestation · mapping);
- tension register and guardrail pair;
- restriction adherence test (VREQ/s166 population check);
- reportability decision ledger (multi-clock);
- read-across prompt;
- escalation-health index;
- top and emerging risk overlay (mapped to principal risks, with time to crystallise).

## Roles / segregation of duties
- **Maker-checker on attestation and reportability:** the metric owner attests; the second line challenges; the SMF decides. Internal audit assures and never owns a metric it audits (M-E-04).
- **A reportability decision needs a named SMF,** usually SMF16, with SMF4 or SMF17 by matter. Dissent is recorded (M-C-12).
- **Model or parameter changes:** the proposer, the approver (the accountable owner) and the validator (second line or model risk) must be different people (M-I-10).

## Reference build pattern
Same application and routing as the live UK Banking Audit (`components/UKBankingAudit/`, variants v6 and v7). The board layer is a new version on the same pattern. Pass 1 creates the version without changing the others; later passes change only that version.

## Personas this product serves
- **Primary:** CRO (SMF4) at board altitude.
- **Secondary:**
  - Board Risk Committee chair (SMF10);
  - Head of Compliance (SMF16);
  - Head of Financial Crime / MLRO (SMF17);
  - CFO (SMF2);
  - first-line risk owners;
  - Head of Internal Audit (SMF5).

## Domains / modules it spans
UK deposit-takers: building societies, mid-tier banks, digital challengers and specialist lenders (domain-profiles/uk-bank-risk-governance.md). Nine risk domains: credit, market, liquidity, conduct, climate, financial crime, operational resilience, cyber, regulatory.

## Regulatory / market anchors
See the domain profile. Lead anchors:
- FSB RAF Principles (18 November 2013);
- PRA Fundamental Rules and SS1/23;
- FCA Principle 11 and SUP 15;
- SMCR (with the Phase 1 April 2026 rules and PRA CP14/26 Phase 2 consultation, 23 October 2026);
- Consumer Duty (PRIN 2A);
- FCA PS26/2 and PRA PS7/26 (incident and third-party reporting, from 18 March 2027).

## Brand rules
- UK terminology only: SYSC, PRIN, MLR, JMLSG, POCA, OFSI, Consumer Duty, PSR, SS numbers.
- British spelling; business register; no exclamation marks; dates as DD Month YYYY.
- Plain English over jargon on CEO and board screens. A label that needs a double-click will not survive a board meeting.
- Climate is framed as PRA prudential (SS3/19, CBES), not ESG.
- Momentum and trajectory are rule-based (least-squares projection, no ML), described as an early-warning indicator, never a prediction.
- Synthetic figures carry `[illustrative]`. Precedents are real and posture-tagged.
- Practice versus rule is always labelled.

## Common positioning mistakes
- Selling "risk monitoring for compliance" (the old framing) instead of risk as a strategic lever.
- A wall of green controls at board altitude.
- Hard-coding L1/L2/L3 or a 10–12 cap as if regulatory.
- Leading with agentic-AI financial crime before UK rules exist (M-S-04).
- Claiming "nobody does this" when Protecht is credible in the UK mid-tier (CF-25).
- Matrices or heat-maps on the CRO and board screens (RP-001).

## Governance product-key mapping
GOVERNANCE_PRODUCT_KEY: "AI Audit & Compliance Platform (SWIFT CSCF / Internal Audit / CRO posture)" `[unverified -- confirm with user]`.

Alternative: "Fluid Compliance / Risk-&-Audit module". Its index notes ("design top-down from the CRO"; "CRO sees developing risk by category, not miss-counts"; "UK/US variants") apply strongly and are adopted as persona overrides either way.
