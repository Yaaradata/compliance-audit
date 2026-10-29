# Run Configuration — Yaara Risk & Compliance (UK Board Risk View) / CRO (SMF4)

**Phase 0 · resolved 27 October 2026 · status: AWAITING CONFIRMATION**

This configuration slots one profile into each part of the run. Every downstream stage reads its `{PLACEHOLDERS}` from here. Three of the profiles are newly onboarded for this run (see the bottom of this file):
- product: `product-profiles/yaara-uk-risk.md`, with its methodology file;
- domain: `domain-profiles/uk-bank-risk-governance.md`;
- persona: `persona-profiles/cro-smf4-board.md`.

The research behind them is the UK Risk Board View Stage 0 runs and the Stage 1 merged corpus (`UKRISK-stage1-merged-27Oct2026.md`).

---

## PRODUCT (← product-profiles/yaara-uk-risk.md) — NEW
| Field | Value |
|---|---|
| PRODUCT_FAMILY | Yaara Risk & Compliance |
| PRODUCT_NAME | Yaara Risk & Compliance — UK Banking |
| PRODUCT_MODULE | UK Board Risk View: a board-altitude layer above the existing control-level UK Banking Audit (CRO, SMF16 and SMF17 views; nine domains) |
| POSITIONING_WEDGE | Risk as a strategic lever, not risk monitoring for compliance. One evidenced chain from strategy to RAS, Level 1/2/3 metrics, controls, named owners and the reportability decision. Shows the board how much capacity it is using to grow, where the chain is broken, and what must be decided or reported |
| PRODUCT_BOUNDARY | Consumes the bank's registers, time series, logs, feeds and minutes. Owns the cascade graph, calibration records, tension register, attestation records, reportability and read-across logs, and precedent corpus. Never owns the GRC system of record, core or monitoring engines, or regulatory returns |
| DOES_NOT_DO | Never decides reportability. Never files or notifies. Never re-tunes thresholds or models autonomously. Never presents practice as a rule. No cost or ROI trade-off against financial crime floors. AI is always marked and accepted by a named person. Synthetic data is labelled; precedents are real and posture-tagged |

## DOMAIN (← domain-profiles/uk-bank-risk-governance.md) — NEW
| Field | Value |
|---|---|
| DOMAIN | Board-level risk governance at UK deposit-takers: RAF and RAS cascade, SMCR accountability, reportability, Consumer Duty outcomes, financial crime control assurance |
| TARGET_ORG_TYPE | Tier 2 and tier 3 building societies, mid-tier banks, digital challengers, specialist lenders |
| GEOGRAPHY | UK primary; EU, US, FSB, BCBS and IIA as contrast |
| KEY_ENTITIES | Strategic objective, capacity, RAS statement, principal risk, Level 1/2/3 metric, threshold, KRI/KCI, policy obligation, control, feed and reconciliation, owner (SMF, risk, control), attestation, VREQ / s166 requirement, guardrail pair, reportability decision, committee, emerging risk |
| DATA_SUBSTRATE | RAS and limit register; KRIs; control register and tests; RCSA; issues and actions; incidents; complaints and FOS outcomes; policy and obligation libraries; SoRs and MRM; change and parameter logs; feed reconciliations; audit findings; VREQ / s166 register; model inventory; ICAAP and ILAAP outputs |
| INTERACTION_CORPUS | Board, BRC, ERC and sub-committee papers and minutes; escalation notes; attestation commentary; second-line challenge records; complaint narratives; aggregated speak-up cases |
| KPI_SET | Appetite utilisation and headroom; out-of-appetite count and persistence; CET1, leverage, LCR, NSFR; arrears and cost of risk; impact-tolerance breaches; Consumer Duty tolerances; VREQ adherence; overdue actions; chain integrity; days to notify; escalation latency; self-identification ratio |
| REGULATORY_ANCHORS | FSB RAF (18 November 2013); PRA Fundamental Rules, SS5/16, SS28/15, SS1/23, SS3/19; FCA Principles 3 and 11, SUP 15.3 and 15.11, SYSC, COCON; SMCR Phase 1 (April 2026) and Phase 2 (CP14/26, 23 October 2026); PRIN 2A; PS26/2 and PS7/26 (from 18 March 2027); POCA, SAMLA, UK GDPR Article 33; PSR APP regime. All are on the verify-before-use list |

## PERSONA (← persona-profiles/cro-smf4-board.md) — NEW
| Field | Value |
|---|---|
| PRIMARY_PERSONA | Chief Risk Officer (SMF4) at board altitude: owns the RMF and RAF and presents the risk profile against appetite to the BRC and the board |
| SECONDARY_PERSONAS | BRC chair (SMF10); SMF16; SMF17 (Head of Financial Crime); CFO (SMF2); first-line risk owners; SMF5 |
| ROUTED_EXECS | Board and BRC; CEO and ExCo; CFO; SMF16 and SMF17; first-line owners; COO and CTO |
| DECISION_CADENCE | Monthly ERC; quarterly BRC and board; annual RAS refresh with planning and ICAAP; event-driven breaches and reportability. Default comparison: quarter-on-quarter |
| DAILY_JOB | See what has moved against appetite and what is heading for a threshold. Check that board figures are defensible. List the decisions the board must take and what may be reportable. Not control-level queues `[unverified]` |
| TOP_QUESTIONS | Ten questions in the persona profile: headroom against strategy; trajectory to threshold; indefensible figures; restriction adherence; growth against control capacity; tension collisions; reportability; escalation health; read-across; emerging risk |
| KPI_VOCABULARY | North star: utilisation and headroom; out-of-appetite count; capital and liquidity against limits. Diagnostic: see the persona profile |
| MUST_SHOW | Strategy strip; RAS scorecard; headroom gauge; chain-integrity badge; restriction adherence test; exception feed; tension summary; reportability ledger; emerging overlay |
| REMOVE_FOR_ROLE | Control-level RCSA lists and queues; matrices and heat-maps (RP-001); raw miss-counts (RP-008); wide AI bars (RP-006); cost or ROI lens on financial crime |
| TRUST_THRESHOLD | Every headline carries a threshold and rationale, trajectory, named SMF and owner, last reconciliation date and attestation status, with a one-click drill to evidence. Hard fails are listed in the persona profile |
| UI_EXPECTATION | C-suite density; business-question titles; headline top-left with deltas; one-click drill; thin AI summary band. Conservative low-chroma theme, with dark brand palette versus light theme to confirm (CF-002) |

## PROTOTYPE (← prototype-intents/sales-demo.md) — PROPOSED, see Decision 1
| Field | Value |
|---|---|
| PROTOTYPE_INTENT | Client-facing sales demo to UK CROs and BRC chairs, shown at board altitude |
| BUILD_TARGET | Cursor React prototype inside the existing compliance-audit app, as a new UK Banking variant built in passes |
| DEMO_STORYLINE_STYLE | Two or three hero beats, each ending in a decide or prepare moment. Proposed beats, to be fixed at Stage 3 and Stage 7: (1) headroom shows room to grow in credit, but financial crime control capacity is not keeping pace; (2) a green board metric fails chain integrity because of an unreconciled feed or an unowned metric; (3) a restriction population test fails, and the multi-clock reportability case is drafted for an SMF decision |
| MOCK_DATA_DEPTH | Shallow but vivid. Numbers tie out. Denominators always shown. At least one suppressed near-miss. Synthetic data marked `[illustrative]`; precedents real |
| SCREEN_COUNT_TARGET | 3–5 |

## GOVERNANCE (← governance-profiles/compliance.md + executive.md)
| Field | Value |
|---|---|
| PERSONA_CLASS | Compliance / risk at board altitude (the compliance profile is primary; executive rules apply for the board headline) |
| GOVERNANCE_FILES | product_context_index.md (first), global_dashboard_rules.md, persona_specific_rules.md (CRO / C-suite), product_specific_rules.md, component_rules.md, layout_density_rules.md, visualization_rules.md, naming_copy_rules.md, approved_patterns.md, rejected_patterns.md, frontend_review_checklist.md (the Stage 11 gate) |
| PERSONA_ALTITUDE | C-suite (CRO), density by seniority (CL-012) |
| GOVERNANCE_PRODUCT_KEY | "AI Audit & Compliance Platform (SWIFT CSCF / Internal Audit / CRO posture)" `[confirm — Decision 2]` |
| PRODUCT_CONTEXT_ROW | As above. The "Fluid Compliance / Risk-&-Audit module" row's CRO directives (top-down from the CRO; developing risk by category; thousands-scale counts; UK/US variants) are adopted as persona overrides |

## ANALYSIS (from the product profile)
| Field | Value |
|---|---|
| ANALYSIS_METHOD | Appetite-cascade assurance. A unit is an appetite position with its chain integrity: position, breach, chain break, tension collision or reportability case |
| METHODOLOGY_FILE | product-methodologies/yaara-uk-risk-analysis-method.md — NEW |
| DOMAIN_SPINE | Strategic Objective → RAS Statement → Level 1 Metric → Level 2/3 Indicators and Thresholds → Policy Obligation → Control → Evidence / Data Feed → Accountable Owner → Attestation → Escalation / Reportability Decision |
| COMPONENT_VOCABULARY | v6 blocks (domain overview, DomainDrillPanel and lenses, precedent corpus, CRSA cockpit, MLRO workspace and the five unwired components), plus the new board blocks in the product profile |

---

## RESEARCH (industry variable set for Phase 1 and Phase 2)
| Placeholder | Value |
|---|---|
| `{DOMAIN}` | UK deposit-taker board risk governance (as above) |
| `{BUYER_PERSONA}` | The CRO (SMF4). Each quarter they assemble a BRC pack from control-level tools and spreadsheets, and cannot show the board strategy-to-control linkage, headroom or chain integrity in one view |
| `{ROUTED_EXECS}` | Board and BRC chair; CEO; CFO; SMF16; SMF17; first-line owners; COO and CTO |
| `{PLATFORM_SUBSTRATE}` | = DATA_SUBSTRATE |
| `{INTERACTION_CORPUS}` | = INTERACTION_CORPUS (committee minutes and escalation narrative; the join is metrics × governance narrative) |
| `{PORTFOLIO_VIEWS}` | Principal risk × Level (1/2/3) × legal entity × business line or product × customer journey × owner (SMF, risk, control) × time |
| `{KPI_SET}` | = KPI_SET |
| `{ANCHORS}` | Real UK Final Notices (Starling 2024, Monzo 2025, Metro 2024, Nationwide 2025, Barclays 2025, Santander 2022, HSBC 2021, NatWest 2021, TSB 2022) with merged figures; BSA market shares; the FSB RAF definitions; SUP 15.3 "immediately" |
| `{REGULATORY_ANCHORS}` | = REGULATORY_ANCHORS |
| `{GEOGRAPHY}` | UK primary; EU and US contrast |
| `{PRIMARY_ICP}` | A tier 2 building society or fast-growing challenger (£10bn–£65bn assets), with tier 3 (£1bn–£10bn) as a turnkey variant `[confirm]` |
| `{FOUR_LENSES}` | (1) UK board NED and BRC chair (buyer resonance); (2) CRO and second-line framework designer (product IP and platform fit); (3) first-line business risk owner plus data and AI architect (feasibility and runnability); (4) UK regulatory and enforcement adviser (compliance and defensibility). Lenses 1, 2 and 4 are unchanged from Stage 0. Lens 3 gains an architecture remit because the conventions require one `[confirm]` |
| `{POSITIONING_WEDGE}` | = POSITIONING_WEDGE |
| `{BRAND_RULES}` | UK terminology; British spelling; business register; no exclamation marks; DD Month YYYY dates; plain English on board screens; climate as PRA prudential; Momentum rule-based, labelled early warning; practice labelled as practice; synthetic data `[illustrative]`; precedents real and posture-tagged |
| `{ENGINES}` | GP (ChatGPT), OP (Claude), GM (Gemini), PX (Perplexity) |
| STAGE3_CATALOGUE | `Stage3_InsightCard_Catalogue_uk-bank-risk-governance.md` (to be produced) |

## Phase 1 status at the time of this configuration
- **Stage 0 (cross-engine research):** GP, OP and GM complete. PX not supplied.
- **Stage 1 merged corpus:** `UKRISK-stage1-merged-27Oct2026.md` exists. This is a research-level merge outside the skill's stage order. It does not replace the skill's Stage 1, and it serves as the evidence base and Stage 2 coverage check.
- **Next skill stage:** Stage 1 per-source use-case mining, run separately on each Stage 0 report. Output: `UKRiskBoard_Ph1_<Engine>_Stage1_UseCaseMining.md`, with at least 8 Bucket A and 8 Bucket B use cases each. The five fields follow the assurance adaptation: requirement → evidence → sufficiency → attestation → gap/escalation.

---

## GATE — decisions to confirm before Phase 1 continues
1. **Intent.** Proposed: **sales-demo** (3–5 screens, hero beats, CRO and BRC chair audience, shown at board altitude). The alternative is **board-demo** (2–4 screens, single narrative, maximum restraint).
2. **Governance product key.** Proposed: **AI Audit & Compliance Platform**, because the UK view lives in the same app as SWIFT, with the Fluid Compliance CRO directives adopted. The alternative is **Fluid Compliance / Risk-&-Audit module**.

Also confirm:
- **PX:** run Stage 0 on Perplexity, or proceed with three engines (the Stage 1 precondition).
- **The four lenses:** the third lens gains a data and AI architecture remit.
- **Primary ICP:** tier 2 building society or challenger.
- **Theme:** the dark brand palette versus a light theme for board altitude.

## Onboarding report (Phase 0, Step 6)

| File | Status | Researched from | Taken from the user / existing build | `[unverified]` slots |
|---|---|---|---|---|
| product-profiles/yaara-uk-risk.md | Created | Merged corpus (M-A to M-J, M-S) | v6 build facts, brand rules, ethics position, advisory feedback | Governance key |
| product-methodologies/yaara-uk-risk-analysis-method.md | Created | Merged corpus | Momentum rule-only principle | Level 3 → Level 1 roll-up rule (gap G-04) |
| domain-profiles/uk-bank-risk-governance.md | Created | Merged corpus | — | All regulatory dates (M-G) |
| persona-profiles/cro-smf4-board.md | Created | Merged corpus | Existing CRO → Board View mapping; advisory lens feedback | Daily job; title variants; theme |
| governance-profiles | None created; compliance and executive profiles reused | — | — | — |
| prototype-intents | None created; sales-demo reused | — | — | — |

The new profiles are written alongside this file and copied into this session's skill `references/run-config/` folders. The session copy of the skill does not persist. Add the four files to the skill package to make them permanent.
