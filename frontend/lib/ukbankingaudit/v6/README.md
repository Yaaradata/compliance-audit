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

## Regions

The UK ⇄ US toggle swaps the precedent corpus (jurisdiction), the accountability
regime (SMF + prescribed responsibility ⇄ owner + three-lines + MRA ref), the
consequence language, and the regulator names. It does not change the layout, the nine
domains, or the cards. The failure mechanism is regulator-agnostic: a deregulatory
window that closes leaves the mechanism — and the private and state exposure — intact.
