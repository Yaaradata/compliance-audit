# UK Banking Audit — v6 data layer

This directory holds the v6 board-pack data. Read this before putting anything from
v6 in front of a client or a regulator.

## What is synthetic vs real

- **SYNTHETIC, seeded, deterministic**: all domain, evidence, history, config-change,
  attestation, risk-acceptance and accountability data (`riskDomainsV6.ts`,
  `whatChangedV6.ts`, CRSA attestation fixtures). It is a demo fixture. It reuses the
  nine v4 domains unchanged and adds an evidence/history/accountability layer on top.
  None of it describes a real firm.
- **REAL, public, posture-tagged**: every record in `precedentCorpus.ts`. These are
  actual enforcement outcomes, transcribed from primary sources, each carrying a
  non-nullable `admissionPosture`. Precedents are never synthesised.

## Precedent confidence — do not blur these

- **verified** — figure and date confirmed against the primary Final Notice (NatWest,
  Nationwide, Monzo, Barclays, HSBC/M&S, TSB).
- **probable** — outcome is public and characterised correctly, but a specific figure
  or date has not been re-confirmed to the primary source (Starling, Bank of Ireland
  (UK), the FCA Enforcement Watch entry, Wells Fargo).
- **unverified** — NOT to be relied on. See below.

### Hard rules

- **Metro Bank's penalty is UNRESOLVED.** It is tagged `unverified`. It must never
  appear on a client slide until the primary Final Notice is fetched and the figure
  confirmed. The UI renders an amber "do not use in client material" strip for it.
- **The six FCA "Enforcement Watch" firms are UNNAMED.** The FCA did not name them;
  neither do we. The respondent is the literal string "Firms not named by the FCA" and
  it stays that way. Never render it as a finding.
- **The US corpus placeholder is a PLACEHOLDER.** The OCC record is `unverified` with
  no respondent. It must be replaced with a verified OCC consent order — real
  respondent, real date, working source URL — before any US demo. Do not invent one.
- US records 13–16 were **omitted**: no verifiable public order with a working source
  URL was available. An empty slot is honest; a fabricated order ends the product.

## Guardrails (enforced structurally, not by review)

- `copy.ts` — all signal footer/clause copy is generated from the `Predicate` enum.
- ESLint `no-restricted-syntax` bans overstated prose ("has breached", "is
  non-compliant", "illegal", "violation", "at risk", "watch closely", "critical
  exposure") across all of v6. The Nationwide Final Notice says *inappropriate*, not
  *illegal* — one overstated word ends the catalogue. v6 adds two more bans for the
  Exposure lens: "exit this client", "score this customer" — the lens ranks CLUSTERS,
  it never scores or verdicts an individual customer.
- `typeContracts.test-d.ts` — compile-time contracts: `admissionPosture` non-nullable
  with no default, `ClaimLineProps.evidenceRef` required, no `score` field on any
  actor type, `AuditEntry.actorId` non-nullable, `ExposureCount.sourceLabel` required,
  a `DomainExposure` with `dataAvailable: false` can only carry empty
  `counts`/`exitCandidates` (a discriminated union, not a convention), and
  `PathToGreen.lastUpdate.source` is only `"system" | "email"`.
- `noOutbound.test.ts` — fails if any network sink appears in v6. There is no outbound
  integration to any regulator. Absent, not disabled.
- `dispositions.ts` — every disposition and acknowledgement writes `{ actorId, reason, ts }`
  with a non-nullable `actorId`; the third line (Internal Audit) and any system actor are
  refused at the data layer.
- The Fraud lens inherits the same "exit this client" / "score this customer" bans as
  the Exposure lens (same ESLint block, same file globs) — `FraudLossPanel.tsx` and
  `fraudData.ts` aggregate confirmed net loss BY TYPE only (internal / external / card /
  electronic / APP), never by individual. `typeContracts.test-d.ts` also asserts at
  compile time that `FraudLossRow` carries no `customerId`/`customerName`/`individual`
  field — the ban is structural, not just a lint rule.
- `LensToggle.tsx` — the ONE segmented-control component behind every "lens" surface in
  v6 (MLRO tabs; CRO drill Assurance｜Exposure｜Momentum｜Ownership｜Defensibility). Same
  active/inactive styling everywhere; never forked per screen.
- Path-to-green provenance (`system` = STATED / solid dot vs `email` = INFERRED /
  hollow dot) renders through the one `PathToGreenStrip` component everywhere it
  appears — board cards, MLRO panels, and the investigation drawer all use the same
  instance, so the badge treatment can't drift screen to screen.

## Ownership · Momentum · Defensibility (CRO drill)

Three lenses sit beside Assurance and Exposure on every domain drill
(`DomainDrillPanel` toggle: Assurance｜Exposure｜Momentum｜Ownership｜Defensibility).
They answer different board questions from Assurance RAG.

| Lens | Question | Appetite line | Absolute vs firm-set |
| --- | --- | --- | --- |
| **Ownership** | Is a Senior Management Function mapped, and is the reasonable-steps trail current? | Unallocated domains = 0; trail age ≤ 90 days | **Absolute:** unallocated prescribed responsibilities (SYSC 25 / SYSC 26). **Firm-set:** 90-day trail age (one attestation cycle). |
| **Momentum** | On current trend, does any KRI project to breach risk appetite inside the EWI horizon? | Red ≤ 90 days; amber ≤ 180 days | **Firm-set:** 90 / 180-day early-warning horizons. Part 1 of the appetite line is the existing KRI target on `riskDomainsV4`. |
| **Defensibility** | Would the evidence pack survive a hostile skilled person (s.166) request today? | Unmapped material obligations = 0; unretrievable critical = 0; retrievability floor 95% | **Absolute:** unmapped obligations (SYSC 6.1.1R); statutory retention (MLR 2017 reg 40). **Firm-set:** 95% retrievability floor. |

**Synthetic vs real (state plainly):** ownership, momentum and defensibility data
(`ownershipData.ts`, `momentumData.ts`, `defensibilityData.ts`) is **SYNTHETIC and
seeded** for the demo. Precedents in `precedentCorpus.ts` remain **REAL**. Do not mix
them.

**Momentum is deterministic projection only — no model.** Slope is least-squares over
the trailing three board cycles. The horizon is an **early warning indicator**, not a
forecast. ESLint bans "prediction", "forecast", "will breach", "certain to"; permitted
phrasing is "projected", "early warning indicator", "on current trend".

**Cross-lens alert** (`CrossLensAlert` / `getCrossLensFindings`): fires where a domain
reads GREEN on the board pack and fails two or more of Ownership (UNALLOCATED),
Momentum (ALREADY_BREACHED | PROJECTED_BREACH_RED), Defensibility (INDEFENSIBLE). The
seeded climate card is the demo — assert it fires for climate only.

## Exposure lens — honesty notes

- **The Exposure lens is LIVE FOR FRAUD & FINANCIAL CRIME ONLY in this build.** Every
  other domain (credit, market, liquidity, conduct, climate, opsres, cyber, regulatory)
  shows "data not connected" — this is deliberate and honest, not a placeholder bug.
  Saurabh specced fincrime only; fabricating numbers for domains he didn't spec would
  misrepresent data the firm does not hold. See `exposureData.ts`.
- **All exposure and path-to-green data is SYNTHETIC and seeded**
  (`exposureData.ts`, `pathToGreen.ts`). It demonstrates the view; it does not imply a
  live KYC/CRR data pipeline exists.
- **Client-level exposure data (CRR distribution, PEP flags, sanctions nexus) requires
  a KYC-system integration NOT built here.** The MLRO's access to first-line client
  data is an OPEN QUESTION for the customer — flag it before any pilot.
- **Path-to-green provenance is real, not decorative.** Updates tagged `source:
  "system"` represent structured MI (STATED); `source: "email"` represents
  unstructured/parsed input (INFERRED). The distinction rides a separate axis from RAG
  severity and must survive into any production data model — never fold it into the
  severity dot.

## Personas — Head of ERM is dormant, not deleted

The live nav carries THREE personas: CRO (SMF4), Head of Compliance Monitoring (SMF16),
MLRO (SMF17). Head of ERM was removed from `personas`/`navigationItems` back in
`mockDataV3.ts` (filtered out of the v2 graph) and every version built on top of v3 —
v4, v5, and v6 via `mockDataV6.ts` → `mockDataV5.ts` → `mockDataV4.ts` — inherits that
filter. There is no `head_of_erm` persona and no `headOfERMWorkspace` nav entry
anywhere in the v6 nav graph; it cannot be reached by clicking through the product.

`components/UKBankingAudit/v6/screens/HeadOfERMWorkspaceV6.tsx` is kept in the
codebase — v6 isolation means nothing gets deleted just because it's unreferenced —
but it is **DORMANT**: no persona defaults to it and no nav item points at it. Router
plumbing for it still exists in `UKBankingControlTrace.tsx` (`variant === "v6"` branch)
for completeness, but nothing in the live UI drives a user there.

The appetite-vs-concentration verdict that used to sit on that dormant screen
(`<ExposureConcentrationCard/>` beside `AppetiteFrameworkPanel`) is NOT lost: appetite
is a CRO (SMF4) concern at firm level, and the CRO Board View's Fraud & Financial Crime
domain drill already renders the full `<ExposureLens/>` under its Exposure toggle
(`DomainDrillPanel.tsx`) — Block 1 of which *is* `<ExposureConcentrationCard/>`. The
"15.1% vs 15% appetite" verdict is reachable there without an ERM persona. It still
renders only for fincrime (`dataAvailable: true`) and the honest empty state for every
other domain — see the Exposure lens honesty notes above.

## MLRO — three lenses, one screen

Per Saurabh's "all three, one screen," the MLRO workspace presents THREE lenses behind
one `LensToggle`, defaulting to Operational Assurance:

- **Operational Assurance** — `OperationalAssuranceVerdict.tsx` computes a verdict
  (`BEHIND`/`KEEPING UP` on n of m controls) from the KRIs already on screen (KYC
  backlog, TM SLA, high-risk reviews overdue, EDD), plus the existing operational
  panels below it. The verdict's "sustained operational lag is a leading indicator of
  enforcement" line is a risk INTERPRETATION, not a measured fact — it renders through
  `ClaimLine derivation="LLM"` (hollow dot), the same inferred-signal treatment used
  everywhere else, deliberately off the RAG severity axis.
- **Inherent Exposure** — the built `ExposureLens`, unchanged from the CRO drill.
- **Fraud** — `FraudLossPanel.tsx` / `fraudData.ts`. Confirmed net fraud losses and the
  APP reimbursement exposure are **SYNTHETIC and seeded** — they demonstrate the view,
  not a real firm's numbers. The underlying obligation is real: APP reimbursement has
  been mandatory under PSR rules since Oct 2024, and the reimbursement share is a
  genuine board-level exposure — only the figures shown are fixture data.

## Regions

The UK ⇄ US toggle swaps the precedent corpus (jurisdiction), the accountability
regime (SMF + prescribed responsibility ⇄ owner + three-lines + MRA ref), the
consequence language, and the regulator names. It does not change the layout, the nine
domains, or the cards. The failure mechanism is regulator-agnostic: a deregulatory
window that closes leaves the mechanism — and the private and state exposure — intact.
