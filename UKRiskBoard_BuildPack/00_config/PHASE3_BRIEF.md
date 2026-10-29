# Phase 3 brief — prototype translation (Stages 4–8), UK Risk Board View run

This brief is shared by every Phase 3 stage. Run ONE stage per invocation, in order. Read your stage file before producing anything. The stage file is authoritative; this brief only resolves run-specific inputs and decisions.

## Skill files
- Stage files: `/mnt/skills/plugins/yaara-prototype-research-factory/references/prototype/stage-<n>-*.md`
- Conventions: `/mnt/skills/plugins/yaara-prototype-research-factory/references/conventions.md`. Read this before any stage.
- Output naming: `/mnt/skills/plugins/yaara-prototype-research-factory/references/output-file-naming.md`

## Run inputs
- **Run configuration:** `/home/claude/ukrisk-phase0/RunConfig_yaara-uk-risk_cro-smf4-board.md`
- **Product profile:** `/home/claude/ukrisk-phase0/product-profiles/yaara-uk-risk.md`. This carries the spine, the boundary, the does-not-do list and the component vocabulary.
- **Methodology file:** `/home/claude/ukrisk-phase0/product-methodologies/yaara-uk-risk-analysis-method.md`. Stage 5 loads this as METHODOLOGY_FILE.
- **Domain profile:** `/home/claude/ukrisk-phase0/domain-profiles/uk-bank-risk-governance.md`
- **Persona profile:** `/home/claude/ukrisk-phase0/persona-profiles/cro-smf4-board.md`
- **Prototype intent:** `/mnt/skills/plugins/yaara-prototype-research-factory/references/run-config/prototype-intents/sales-demo.md`
- **Governance profiles** (selectors only; the rules are applied at 9C, not here): `/mnt/skills/plugins/yaara-prototype-research-factory/references/run-config/governance-profiles/compliance.md` and `executive.md`
- **Stage 3 catalogue (the research contract):** `/home/claude/ukrisk-phase1/Stage3_InsightCard_Catalogue_uk-bank-risk-governance.md`. It holds:
  - Tier 1: 74 questions;
  - Tier 2: 45 cards (T2-1 to T2-45);
  - Tier 3: 36 hooks (H-1 to H-36);
  - the 24x7 set of 12 core cards plus 5 reserves, mapped to four beats;
  - panel calls P1–P21 and decisions D1–D10.
- **Earlier Phase 3 outputs.** Read every earlier stage output in `/home/claude/ukrisk-phase3/` before producing yours. Stage 5 reads 4; Stage 6 reads 4–5; Stage 7 reads 4–6; Stage 8 reads 4–7.

## Confirmed decisions (apply exactly)
- **Beachhead: Option A.** Tiers 1–2 use the bank's structured records only. The minutes and narrative joins are Tier 3 hooks: shown as "extension" teasers at most, never built as working cards.
- **D1, confirmed.** The product's own registers count as structured data when a named human enters each entry, with no AI reading of minutes. These are:
  - the tension register;
  - the decision and waiver register;
  - the reportability ledger;
  - the pack-build manifest.
- **D3.** Legal-review items appear in the demo only in their Tier 2 structured versions, on synthetic data. Minutes-based versions are described, not shown.
- **D6.** The awareness-gap card (T2-30) is visible to the deciding SMF and the CRO only, not on the BRC view.
- **Defaults, all configurable:**
  - "Persistent amber" means 2 quarters at Level 2.
  - The T2-5 capacity unit shows qualified FTE and alerts cleared within SLA side by side.
  - Level 3 → Level 1 roll-up uses worst-of for the demo (the method remains open).
  - The 24-hour triage target for "immediately" clocks is a product default, labelled as firm practice, not rule.
  - Headline board metrics: 12.
- **Intent: sales demo.** The audience is UK CROs and BRC chairs. 3–5 screens, four hero beats:
  1. headroom and growth against control capacity;
  2. green that is not defensible;
  3. restriction test failing, with multi-clock reportability drafted for an SMF decision;
  4. BRC chair: "is bad news reaching me?"
- **Governance product key:** "AI Audit & Compliance Platform (SWIFT CSCF / Internal Audit / CRO posture)". Adopt the Fluid Compliance CRO directives:
  - top-down from the CRO;
  - developing risk by category, not miss-counts;
  - thousands-scale counts.
- **Theme: not yet decided by the user.** Default to a conservative, low-chroma, light-first board theme with a dark toggle, per the persona theme system and CF-002. Note the brand dark palette as an option: #1c1c1c canvas, #2a2a2a surface, #3a3a3a/#4a4a4a borders, purple #bc6cd3, lime #dcfc84, white text. Flag the theme as an open decision; do not lock it.
- **ICP:** a tier 2 building society or challenger, £10bn–£65bn. Use a synthetic, fictional firm name. Never use a real prospect's name or data.

## Existing build facts (for Stages 6–8; treat as `[unverified -- confirm against repo]`)
- The live product is the public repo `Yaaradata/compliance-audit`. The frontend lives under `frontend/{app,components,lib}/`.
- The UK Banking Audit router is `components/UKBankingAudit/UKBankingControlTrace.tsx`. It routes by `variant`. v6 is live; a v7 multipass prompt exists and is not yet run.
- Every negation guard of the form `variant !== "v6"` must also exclude any new variant, or the new variant silently renders v6.
- Do not touch `app/login/page.tsx` or `lib/auth-context.tsx` (main product auth). `app/select_region/page.tsx` has no auth gate.
- Personas in the live product:
  - CRO (SMF4) → Board View;
  - Head of Compliance (SMF16) → CRSA Cycle Cockpit;
  - MLRO (SMF17) → MLRO Workspace (to be renamed "Head of Financial Crime").
- Nine domains in `lib/ukbankingaudit/riskDomainsV4.ts`: credit, market, liquidity, conduct, climate, fincrime, opsres, cyber, regulatory.
- v6 lenses: Assurance, Exposure, Momentum, Ownership, Defensibility. Advisory feedback on these:
  - split them into a Strategic tier (Exposure) and an Operational tier;
  - move Ownership to top level;
  - make Fraud a filter, not a lens.
- `precedentCorpus.ts` holds 12 real, posture-tagged UK enforcement precedents.
- Five MLRO components are built but not wired: SuppressionLedger, DispositionDispersion, ScreeningDenominator, CadenceFeasibility, OperationalAssuranceVerdict.
- **Cursor convention:**
  - pass 1 creates the new variant and leaves the others unchanged;
  - later passes state changes only in the target variant;
  - one pass at a time.
- **Momentum:** rule-only least-squares, labelled "early warning, not a prediction".
- **Climate:** framed as PRA prudential (SS3/19, CBES), not ESG.

## Non-negotiables in every stage
- Domain spine on every zone, flow and entity.
- Hard fails from the product and persona profiles.
- The seven design rules.
- AI is a copilot: it drafts, a human gates, and every action is audit-logged. The AI marker appears on every AI element.
- No "file" or "notify" actions; use "prepare" or "propose".
- Every number has a denominator.
- Synthetic data is marked `[illustrative]`. Precedents are real and posture-tagged.
- UK terminology, British spelling, no exclamation marks, DD Month YYYY dates.
- At each stage, flag anything you could not resolve as an open decision rather than guessing.

## Speed mode (user request, 27 October 2026)
- Keep every section the stage file requires, but write tightly. Use tables rather than prose. Do not restate content from earlier stages; reference it by ID.
- **Demo firm:** a building society (firm_type = building_society), still configurable. The beat-1 growth story is rapid mortgage and savings growth plus digital member onboarding against financial crime and operational control capacity.
- **Firm name:** Fernbridge Building Society (fictional). The Stage 4 personas apply.

## User decisions, 27 October 2026 (17:00)
- **Theme:** light-first, with a dark toggle. Conservative and low-chroma. In dark mode, lime #dcfc84 stays off all status colours, and purple #bc6cd3 is used for the AI marker only.
- **Unverified:** a neutral grey outline, the word "Unverified" and a broken-link glyph. It is never shown as a RAG colour.
- **Beat order:** 1 → 2 → 3 → 4, with headroom first.
- **Accepted defaults from Stages 6–9C:**
  - the S6/S7/S8 recommended options;
  - the 9C V-1 to V-11 fixes;
  - no "vs last ERC" switch;
  - no pack export in the demo;
  - CRO actions on the S4 preview appear as a separate labelled strip;
  - the SMF16 decision is shown as a pre-seeded append-only row.

## Output folder
`/home/claude/ukrisk-phase3/`. File names follow the naming table, with `<product>` = `yaara-uk-risk` and `<persona>` = `cro-smf4-board`.
