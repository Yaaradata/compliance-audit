# UK Process Audit — signals layer

Engineering rules for detectors, precedents, and evidence-bound claims.
A future developer must not be able to violate these by accident.

## Precedents — confidence

| Confidence | Records |
|---|---|
| **verified** | NatWest (Crown Court), Nationwide, Monzo, Barclays Stunt, Barclays WealthTek, HSBC collections, TSB financial difficulty |
| **probable** | Starling (primary Final Notice not fetched in research), TSB IT migration, Bank of Ireland CoP (Decision Notice), FCA Enforcement Watch (unnamed firms) |
| **unverified** | **Metro Bank** (`metro-2024-11-01`) |

### Metro Bank — UNRESOLVED

Metro Bank's penalty and date are **UNRESOLVED** in research (`confidence: "unverified"`).
**Never put Metro Bank's penalty on a client slide** until the primary Final Notice has been fetched and the record upgraded.

### FCA Enforcement Watch — UNNAMED

The six FCA Enforcement Watch firms (`fca-enforcement-watch-1-2026-01-28`) are **UNNAMED** by the FCA and **stay unnamed**.
Never invent firm names. Never render this record as a named finding.

## Synthetic vs real

| Layer | Status |
|---|---|
| Control library, expected operations, evidence artefacts, CMP remediation items, assertions | **SYNTHETIC** and seeded — labelled in source |
| Precedents in `precedentCorpus.ts` | **REAL**, public UK enforcement actions, each with required `admissionPosture` |

## Card copy

All face copy is produced by `copy.ts` from the closed `Predicate` enum:

`SIGNAL_FIRED` · `EVIDENCE_GAP_OBSERVED` · `PRECEDENT_MATCHED` · `HUMAN_REVIEW_REQUIRED`

There is no free-prose field on the card for headlines. ESLint bans overstated literals under `signals/`.

## Disposition

Every disposition writes `{ actorId, reason, ts }`. `actorId` is non-nullable.
No system actor may disposition — enforced at the type/contracts layer.

## Outbound regulators

There is **no** outbound integration to any regulator endpoint.
Not disabled — **ABSENT**. `noRegulatorPost.test.ts` fails the suite if an `fca.org.uk` / `nca.gov.uk` POST target appears.
