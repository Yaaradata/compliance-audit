# Yaara UK Risk Analysis Method -- appetite-cascade assurance (PRODUCT IP)

> This file is loaded only when the run's product profile sets `METHODOLOGY_FILE: product-methodologies/yaara-uk-risk-analysis-method.md`.
> - **Research basis:** the Stage 1 merged corpus (M-x-nn IDs).
> - **Status:** not regulatory requirements. Every method choice below is product design, `[practice-not-rule]`, unless an ID points to a rule.

## A. Unit of analysis

The product's atomic surfaced object is an **appetite position with chain integrity**. One unit takes one of five forms.

| Unit type | What it is | Example |
|---|---|---|
| **Position** | Where a metric sits against nested thresholds, plus headroom and trajectory | Credit high-LTV share at 78% of appetite, rising |
| **Breach** | A metric past amber or red, or a restriction breached | Persistent Level 2 amber for two quarters; a VREQ population test failing |
| **Chain break** | A link in the spine is missing or untrustworthy | A metric with no SMF owner; a feed that is not reconciled; an attestation that is overdue; a policy obligation with no control or metric |
| **Tension collision** | One metric in an agreed guardrail pair improves while its partner deteriorates | Onboarding conversion up, pre-CDD transacting rate up |
| **Reportability case** | An event that may trigger one or more external notification clocks | A control failure engaging SUP 15.3 and FR7, and possibly a SAR |

A unit becomes a **card** only if it carries an action, an owner and its chain. A unit with no action is cut.

## B. How a unit is produced

1. **Cascade build.** Model the chain: strategic objective → RAS statement → capacity → appetite → Level 1 metric → Level 2/3 indicators → policy obligation → control → feed → owner. Links are many-to-many (M-A-01, M-G-01).
2. **Nested thresholds.**
   - For each metric, store capacity, red (appetite), amber (trigger) and operating limit, plus the calibration rationale (M-A-04, M-A-07).
   - Lower tiers carry wider amber bands. The width is set from lead time, volatility and remediation time, not an arbitrary percentage.
   - A zero-tolerance statement must carry a measurable proxy, such as coverage or completeness (M-A-06).
3. **Position and trajectory.**
   - Headroom = appetite − actual, shown with a denominator.
   - Trajectory is a rule-based least-squares projection to the next threshold, labelled an early-warning indicator, never a prediction.
   - The roll-up rule for non-financial Level 3 → Level 1 is declared per metric: worst-of, count-of-breaches, or a weighted rule. This is an open design question (M-A-05; gap G-04).
4. **Chain-integrity checks**, run continuously:

| Check | Fails when |
|---|---|
| Owner | No accountable SMF, risk owner or control owner |
| Feed | The source-to-target reconciliation is missing, stale or has gaps |
| Attestation | The owner has not attested to the latest reconciliation result |
| Mapping | A policy obligation has no control, metric or evidence |
| Restriction | A VREQ or s166 clause has no executable population test, or the test fails |
| Change | A technology parameter or rule change touching a control has no approval record |

   Evidence for these checks: M-D-01, M-D-05, M-D-06, M-G-01, M-G-02, M-H-02 to M-H-04.
5. **Silent-failure detection.** Flag a control whose output goes anomalously quiet, for example zero sanctions alerts for six months (Starling) or a monitoring population that falls short of the source count (Metro). Use simple count and denominator rules (M-H-02, M-H-04).
6. **Tension detection.** Agreed guardrail pairs are stored as objects, each with the board-agreed trade-off, any regulatory floor, an owner and a review date. A collision is flagged when the pair diverges (M-G-03, M-G-04).
7. **Reportability triage.**
   - Map each logged event to every potential clock: SUP 15.3 (immediately), FR7, SUP 15.11, SAR (as soon as practicable), OFSI, ICO (72 hours), and PS26/2 / PS7/26 from 18 March 2027 (M-C-13).
   - AI drafts the case. A named SMF decides.
   - Propose read-across on controls with the same design or feed (M-C-11).
8. **Escalation routing.** Route by materiality and decision need, not by static RAG visibility (M-B-19). Items flagged at a lower forum, or left unremediated past their SLA, cannot be suppressed and auto-surface to the BRC (M-B-20).

## C. The pipeline (raw inputs → card → action)

This adapts the five-field use-case pipeline for an assurance product, as Stage 1 permits.

1. **Requirement.** Load the strategy, RAS, thresholds, policy obligations, regulatory obligations and restrictions (VREQs, s166 actions).
2. **Evidence.** Ingest metric time series, control tests, feeds with reconciliation counts, complaints, incidents, change logs and committee minutes. All of this is consumed, never owned.
3. **Sufficiency.**
   - Compute position, headroom and trajectory against nested thresholds.
   - Run the chain-integrity and silent-failure checks.
   - Run the tension pairs.
4. **Attestation.** The owner attests to evidence (a reconciliation result, not a bare value). The second line challenges. An AI sufficiency note is advisory and marked.
5. **Gap / escalation.** Raise breaches, chain breaks and collisions. Triage reportability. Route by materiality. Record the human decision, the draft action and the audit log.

## D. Edge-case register

| Edge case | Handling |
|---|---|
| Green on a broken feed | Integrity overrides status; show "unverified" rather than green |
| Zero-tolerance metric with no proxy | Flag as a chain break |
| Amber fatigue (seasonal spikes) | Calibrate seasonality in the threshold rationale; never just widen amber |
| Persistent amber that never escalates | Auto-escalate after N periods (N set by the firm) |
| Action dropped or reworded in minutes | The escalation-health index records it and the item auto-surfaces (Metro shape) |
| Restriction adherence measured by "flag fired" rather than population outcome | Hard fail (CB Payments shape, M-H-13) |
| Owner attests their own control's test | Segregation-of-duties violation |
| Practice presented as rule | Label it |
| Regulatory floor entered as a tension | Reject; floors are not tradeable |
| AI re-tune without approval | Block and log |
| Optimistic headroom with no denominator | Hard fail at board altitude |
| A "within appetite" claim relying on a GM-only or unverified figure in a demo | Must carry `[illustrative]` |

## E. Per-unit spec template (one block per card in Stage 5)
```
Unit: <id / name>                 Type: position | breach | chain break | tension | reportability
Spine position: <objective → RAS stmt → L1 → L2/L3 → obligation → control → feed → owner>
Metric / condition: <formula; threshold set: capacity / red / amber / limit + rationale>
Trajectory rule: <least-squares window; label "early warning, not a prediction">
Integrity checks: owner ✓/✗ · feed reconciled ✓/✗ (date) · attested ✓/✗ (by, date) · mapped ✓/✗
Restriction test (if any): <population, test, result, denominator>
Tension pair (if any): <partner metric; agreed trade-off; floor>
Reportability (if any): <clocks engaged; decision owner; deadline>
Routing: <forum by materiality; accountable SMF>
Action: <draft action; human gate; audit entry>
Precedent link: <real UK Final Notice, posture-tagged, if relevant>
Boundary: AI drafts and challenges; never decides, files, or re-tunes
```

## F. Card anatomy
- **Title:** a business question that resolves to a state (CL-001), not a metric name.
- **Status:** a position against nested thresholds, never green when integrity fails.
- **Headroom:** appetite set vs actual vs forecast, with a denominator.
- **Honesty line:** the chain-integrity badge (owner · feed · attestation · mapping) and the data-as-of date. This is the analogue of SWIFT's evidence completeness.
- **Owner:** the named SMF and the risk owner.
- **Action:** a draft with a human gate; "prepare" or "propose", never "file".
- **AI marker:** on any AI narrative, sufficiency note or draft.
- **Precedent:** an optional real-case reference ("Starling 2024: VREQ population not tested").
