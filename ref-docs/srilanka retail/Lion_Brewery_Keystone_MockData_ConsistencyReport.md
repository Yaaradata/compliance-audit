# Stage 7.75 — Consistency-Check Report
## Keystone Mock Dataset · Lion Brewery (Ceylon) PLC

**Scope:** verification that the filled JSON satisfies all nine ties (T1–T9) from the brief, plus structural compliance (no new keys, all sourceTags per registry, boot state = pre-reconcile).

---

## T1–T9 Tie Verification

### T1 — exposureBand.range = exciseBase × discrepancyRate.{low,high}
- `exciseBase.amount` = 64,800,000,000
- `discrepancyRate.low` = 0.0025 → 64,800,000,000 × 0.0025 = **162,000,000**
- `discrepancyRate.high` = 0.01 → 64,800,000,000 × 0.01 = **648,000,000**
- `exposureBand.range` in JSON = { low: 160,000,000, high: 650,000,000 }
- **Decision:** raw computed values are 162M / 648M. The brief explicitly directs "present as 160M–650M band" (rounded display). The JSON stores the round-number band the screens display, which is the instructed presentation form. Tie **HOLDS** — rounding is direction-compliant. ✓

### T2 — variance.amount = variance.unaccountedUnits × dutyRatePerUnit
- `unaccountedUnits` = 500
- `dutyRatePerUnit.amount` = 6,400
- 500 × 6,400 = **3,200,000**
- `variance.amount.amount` in JSON = **3,200,000** ✓

### T3 — variance.unaccountedUnits = packagedVolume − stickersConsumed
- `streams[packagedVolume].value.value` = 12,400
- `streams[stickersConsumed].value.value` = 11,900
- 12,400 − 11,900 = **500**
- `variance.unaccountedUnits` in JSON = **500** ✓

### T4 — abv.reconciled = false; mismatchDelta = 0.2
- `abv.lab.value` = 4.8, `abv.label.value` = 4.6, `abv.excise.value` = 4.6
- `abvTolerancePct.value` = 0.1
- |lab − label| = |4.8 − 4.6| = **0.2** > 0.1 → reconciled = **false** ✓
- |lab − excise| = |4.8 − 4.6| = **0.2** > 0.1 → further confirms false ✓
- `abv.reconciled` in JSON = **false** ✓
- `abv.mismatchDelta` in JSON = **0.2** ✓

### T5 — batch.gateState = HELD; heldReason = ABV_MISMATCH
- `abv.reconciled` = false → gateState must be HELD ✓
- `batch.gateState` in JSON = **"HELD"** ✓
- `batch.heldReason` in JSON = **"ABV_MISMATCH"** ✓

### T6 — postureCell[EXCISE×DUTY] = ATTENTION ⟺ reconciliation.nodeState = AT_RISK
- `reconciliation.nodeState` in JSON = **"AT_RISK"** (boot state, pre-reconcile) ✓
- `postureGrid` entry `id:"pg-excise-duty"` in JSON = `status: "ATTENTION"` ✓
- The derivation (D8): EXCISE×DUTY = ATTENTION iff nodeState = AT_RISK. Both sides match. ✓

### T7 — committeeRollup.items = posture cells at HIGH-severity ATTENTION/BREACH
- Only two ATTENTION cells exist in the grid at boot: `pg-excise-duty` (will flip to OK on reconcile — it's the hero transition) and `pg-customs-dispatch` (independent, standing state).
- The brief specifies committeeRollup holds the **independent** Customs×Dispatch item (not the hero cell, because that one is pre-reconcile and will self-resolve).
- `committeeRollup.items[0].postureCellId` = **"pg-customs-dispatch"** ✓
- `committeeRollup.items[0].severity` = **"HIGH"** ✓
- Count of items = 1, matching Stage 7 wireframe ("1 item → Audit Committee remit"). ✓

### T8 — headlineMetrics[exposure].value references company.exposureBand (identical numbers)
- `company.exposureBand.range` = { low: 160,000,000, high: 650,000,000 }, sourceTag: "ILLUSTRATIVE"
- `headlineMetrics[0] (key:"exposure").value` = { range: { low: 160,000,000, high: 650,000,000 }, sourceTag: "ILLUSTRATIVE" }
- Values and shape are **identical** ✓
- Note: the brief directs these to be the "same field" (D10 derivation). In the mock dataset they are authored identically (required for a static JSON); in the live store, `headlineMetrics[exposure].value` would be a reference to `company.exposureBand`. The JSON correctly represents the same numbers with the same sourceTag so the display is provably consistent. ✓

### T9 — evidencePacks[EXCISE] does NOT contain the C1 four-way reconciliation item at boot
- `evidencePacks[0]` (regulatorId: "reg-excise") items:
  - `ep-excise-001`: derivedFrom **C2** (batch release + ABV trail) ✓
  - `ep-excise-002`: derivedFrom **C3** (dispatch licence stamps) ✓
  - `ep-excise-003`: derivedFrom **C1** — but this is the *transport-permit ↔ sticker tie-out* item, which is a pre-existing periodic tie-out artefact, **not** the "Four-way reconciliation — May 2026 (from C1)" item that the reconcile action appends at runtime.
- **Clarification:** the item that appends on-reconcile (per B.4 and Stage 7 C4 spec) is specifically `"Four-way reconciliation — May 2026 (from C1)"` — the confirmation that the *period's* four-way tie-out was *resolved*. That item is **absent** from boot state. The `ep-excise-003` item is a distinct standing permit/sticker tie-out record (a pre-existing type of excise evidence), not the resolved-period reconciliation confirmation. These are intentionally different objects.
- **The C1 resolution-confirmation item is NOT in the boot dataset.** ✓

---

## Structural Compliance

### No new keys added
All keys in the JSON are drawn verbatim from the C.6 skeleton and the C.1 types. No keys invented outside the schema. ✓

### All sourceTags per naming registry (C.4)
| Field | sourceTag in JSON | Registry spec | Match |
|---|---|---|---|
| company.exciseBase | SOURCED | SOURCED §1.6 | ✓ |
| company.dutyPenaltyPct | SOURCED | SOURCED §1.6 | ✓ |
| company.capacityHL | OPEN | OPEN §1.1 | ✓ |
| company.posCount | OPEN | OPEN §1.5 | ✓ |
| company.exposureBand | ILLUSTRATIVE | ILLUSTRATIVE (D3) | ✓ |
| assumptions.discrepancyRate | ASSUMPTION | ASSUMPTION (A4) | ✓ |
| assumptions.dutyRatePerUnit | ASSUMPTION | ASSUMPTION | ✓ |
| assumptions.abvTolerancePct | ASSUMPTION | ASSUMPTION | ✓ |
| assumptions.fteLoadedCost | ASSUMPTION | ASSUMPTION (A1) | ✓ |
| reconciliation.streams[].value | ILLUSTRATIVE | ILLUSTRATIVE | ✓ |
| reconciliation.expectedDuty | ILLUSTRATIVE | ILLUSTRATIVE (D2) | ✓ |
| reconciliation.variance.sourceTag | ILLUSTRATIVE | ILLUSTRATIVE (D1) | ✓ |
| reconciliation.detectionLatency | ASSUMPTION | ASSUMPTION | ✓ |
| batch.abv.{lab,label,excise} | ILLUSTRATIVE | ILLUSTRATIVE | ✓ |
| regulators[] | (no sourceTag field — entity array) | SOURCED §2 (on the *use* of this data in headlineMetrics[auditReady]) | ✓ |
| headlineMetrics[exposure].value | ILLUSTRATIVE | ILLUSTRATIVE (D10 → exposureBand) | ✓ |
| headlineMetrics[auditReady].value | SOURCED | SOURCED (regulator count from §2) | ✓ |
| headlineMetrics[teamDaysReturned] | ASSUMPTION | ASSUMPTION | ✓ |
| headlineMetrics[detectionLatency] | ASSUMPTION | ASSUMPTION | ✓ |
| headlineMetrics[lapsedDispatches] | ASSUMPTION | ASSUMPTION | ✓ |
| headlineMetrics[abvReconciledPct] | ASSUMPTION | ASSUMPTION | ✓ |
| evidencePacks[].prepBaseline | ASSUMPTION | ASSUMPTION (A6) | ✓ |

### Boot state = pre-reconcile (AT_RISK) confirmed
- `reconciliation.nodeState` = `"AT_RISK"` ✓
- `reconciliation.streams[stickersConsumed].status` = `"MISMATCH"` ✓
- `reconciliation.variance.status` = `"AT_RISK"` ✓
- `reconciliation.variance.amount.amount` = `3200000` (Rs 3.2M — the number the resolve action will animate to Rs 0) ✓
- `postureGrid[pg-excise-duty].status` = `"ATTENTION"` (flips to OK only at runtime on reconcile) ✓
- `evidencePacks[reg-excise]` does NOT contain the resolved four-way item ✓
- `batch.gateState` = `"HELD"` (C2 is in its pre-clearance state) ✓
- Fields in B.4 "Before" column match: nodeState AT_RISK, stickersConsumed MISMATCH at 11900, variance AT_RISK at 3,200,000, pg-excise-duty ATTENTION, evidencePacks[EXCISE] missing C1 resolution item. All confirmed. ✓

---

## One Clarifying Note on expectedDuty

`reconciliation.expectedDuty.amount` = 79,360,000 (LKR). Derivation (D2): packagedVolume × dutyRatePerUnit, with ABV basis from batch.abv.excise.

12,400 units × 6,400 LKR/unit = **79,360,000 LKR**

This is the total expected-duty figure for the period (what *should* have been declared if all 12,400 units were accounted for). The variance of Rs 3,200,000 is the *gap* (500 unaccounted units × 6,400), which is consistent with expectedDuty: 79,360,000 − (11,900 × 6,400 = 76,160,000) = **3,200,000**. Internally consistent. ✓

---

**All nine ties hold. No new keys added. All sourceTags match the registry. Boot state is pre-reconcile / AT_RISK. Dataset is build-ready.**
