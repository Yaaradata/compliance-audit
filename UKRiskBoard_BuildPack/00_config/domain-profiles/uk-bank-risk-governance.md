# Domain Profile -- UK Deposit-Taker Risk Governance (board appetite and accountability)

> Onboarded at Phase 0 on 27 October 2026 from the Stage 1 merged corpus. This is the UK, board-level counterpart to `compliance-audit.md`, which is India-primary and assurance-cycle focused.
> **Regulatory anchors move fast.** Every figure and date here is on the merged corpus's verify-before-use list (M-G).

DOMAIN: board-level risk governance at UK deposit-takers. Covers risk appetite frameworks (strategy → RAS → Level 1/2/3 metrics → controls), SMCR accountability, regulatory reportability, Consumer Duty outcomes and financial crime control assurance.

TARGET_ORG_TYPE:
- UK building societies, especially tier 2 (large regionals) and tier 3 (£1bn–£10bn);
- mid-tier banks;
- fast-growing digital challengers and specialist lenders.

Prospect firms stay off-stage; enforcement precedents are named only from public Final Notices (M-J-04).

GEOGRAPHY: UK primary. EU, US and global standard-setters (FSB, BCBS, IIA) are contrast only.

## Ecosystem
- **Who sets appetite:** the board sets strategy and approves the RAS. The Board Risk Committee (BRC) challenges and recommends.
- **Who runs it:**
  - the CRO (SMF4) runs the RAF and RMF;
  - the first line owns risks and controls;
  - SMF16 and SMF17 own compliance and financial crime oversight;
  - internal audit (SMF5) assures and reports to the audit committee (SMF11).
- **Regulators:**
  - the PRA covers dual-regulated deposit-takers (Fundamental Rules, SS1/23, SMCR prescribed responsibilities);
  - the FCA covers conduct, financial crime and SMCR;
  - the PSR covers APP reimbursement;
  - the NCA, OFSI and ICO receive SARs, sanctions reports and data breach notifications.
- **Escalation ladder:** supervisory letter → s166 → VREQ → enforcement (M-C-11).

## Entities and data

KEY_ENTITIES:
- strategic objective, risk capacity, RAS statement;
- principal (Level 1) risk and sub-risk, Level 1/2/3 metric, threshold (red, amber, operating limit), KRI, KCI;
- policy, policy obligation, regulatory obligation, control, RCSA;
- data feed and reconciliation, test result;
- issue, action, incident, complaint;
- VREQ / s166 requirement;
- SMF, Statement of Responsibilities, risk owner, control owner, attestation;
- guardrail pair, reportability decision, read-across, committee (board, BRC, ERC, sub-committees), emerging risk.

DATA_SUBSTRATE (consumed, never owned):
- RAS and limit register; KRI time series;
- control register and test results; RCSA outputs;
- issue and action log; incident and loss events;
- complaints, FOS outcomes and Consumer Duty outcome MI;
- policy register; regulatory obligation library;
- SMCR SoRs and the MRM;
- technology change and parameter logs; data-feed reconciliation counts;
- audit findings; VREQ / s166 register; model inventory;
- ICAAP / ILAAP and stress-test outputs.

INTERACTION_CORPUS (the narrative join asset):
- committee papers and minutes (board, BRC, ERC, sub-committees);
- escalation notes; attestation commentary; second-line challenge records;
- complaint narratives; speak-up and whistleblowing case notes (aggregated);
- regulator correspondence (held as records, not acted on).

**The join:** metric and control data × governance narrative. It reveals what tables alone cannot:
- an item dropped from minutes;
- a persistent amber never discussed;
- different committees receiving different information.

Evidence: the Metro and Starling cases (M-B-20).

## KPIs and economics

KPI_SET (board and CRO vocabulary):
- appetite utilisation and headroom by principal risk;
- metrics in amber or red and their persistence;
- CET1, leverage, LCR and NSFR against internal limits;
- 3m+ arrears and cost of risk;
- impact-tolerance breaches;
- Consumer Duty outcome tolerances;
- VREQ / s166 adherence;
- overdue audit and regulatory actions;
- chain integrity (owned, mapped, reconciled, attested);
- days from awareness to notification;
- time for bad news to reach the board (escalation latency);
- the self-identification ratio (first and second line versus audit and regulator).

Sources: M-A-13, M-E-03, M-F-05.

## Widely documented pain points (to mine)
- **Controls outpaced by growth** (Starling: 43k → 3.6m customers; Monzo: 600k → 5.8m+).
- **Restrictions not tested at population level** (Starling: 54,359 accounts; Monzo; CB Payments).
- **Silent feed failures** (Metro: about 6% of transactions unmonitored, 2016–2020).
- **Escalation suppression** in committee minutes (Metro).
- **Unclear SMF ownership** (Starling, Monzo).
- **Slow remediation of known weaknesses** (Nationwide, £44.08m).
- **Consumer Duty board reports** without thresholds or owners (FCA review of 180 reports).

Sources: M-H, M-F-01.

## Domain-correct language
**Must use:**
- RAF, RAS, RMF/ERMF, principal risk, KRI, RCSA;
- SMF4, SMF16 and SMF17 with role names, SoR, MRM, "reasonable steps";
- Principle 11, SUP 15, FR7, VREQ, s166, Final Notice;
- Consumer Duty outcomes; impact tolerance.

**Must not use** on the face:
- US terms (SOX, CCO);
- "compliant" without evidence;
- "the regulator" as an actor on operational screens;
- "at risk", "watch closely" (RP-005).

**Label practice as practice:** L1/L2/L3, the 10–12 cap, six-monthly attestation, monthly data attestation.

REGULATORY_ANCHORS (verify at use; dates per M-G):
- FSB, *Principles for an Effective RAF* (18 November 2013);
- PRA Fundamental Rules (FR2, FR5, FR6, FR7);
- PRA SS5/16, SS28/15, SS1/23 (effective 17 May 2024), SS3/19;
- FCA Principles 3 and 11; SUP 15.3, SUP 15.11; SYSC 6, SYSC 18, SYSC 24–27; COCON;
- SMCR Phase 1 (FCA PS26/6, PRA PS12/26, April 2026) and Phase 2 (PRA CP14/26, 23 October 2026; consultation closes 22 January 2027);
- Consumer Duty PRIN 2A (annual board report);
- FCA PS26/2 and PRA PS7/26 (incident and third-party reporting from 18 March 2027);
- POCA 2002, Terrorism Act 2000, SAMLA 2018, UK GDPR Article 33;
- PSR APP reimbursement (from 07 October 2024);
- Building Societies Act 1986 nature and funding limits.

MARKET_ANCHORS:
- 42–43 building societies (CF-19);
- building societies and mutual-owned banks hold 29% of mortgage balances, 23% of savings and 46–47% of Cash ISAs (M-J-02);
- 13 FCA AML fines on banks since 2021, totalling £300,767,526 (M-H-01; single source);
- real public precedents: Starling, Monzo, Metro, Nationwide, Barclays, Santander, HSBC, NatWest, TSB.

SPINE NOTE: this domain uses the product spine in `yaara-uk-risk.md`, from strategic objective through to the reportability decision. It extends the GRC / internal-audit spine (Regulation → Obligation → Risk → Control → … → Action) upwards to strategy and appetite.
