# Build prompt for Claude Code — UK Board Risk View (variant `v8-board`)

Paste everything below this line into Claude Code, run from the root of the `Yaaradata/compliance-audit` repo. Put the unzipped `UKRiskBoard_BuildPack/` folder at the repo root, or tell Claude Code where it is.

---

You are building a new board-level variant, `v8-board`, of the UK Banking Audit product in this repo. The full specification is in the `UKRiskBoard_BuildPack/` folder. Your job is to implement it faithfully. You build; you do not redesign.

## 0. Ground rules (read first, apply throughout)

**Build only what the pack specifies.**
- Do NOT invent screens, cards, KPIs, labels, product logic or data beyond what the pack defines.
- If something is missing or contradictory, stop and ask. Do not guess.

**Leave existing code alone.**
- Do NOT change variants `v6` or `v7`. Do NOT touch `app/login/page.tsx` or `lib/auth-context.tsx`.
- No new npm dependencies without asking.

**State and data.**
- No `localStorage` or `sessionStorage`. All state is in memory (React context plus a reducer).
- Synthetic data is fictional and labelled `[illustrative]` where the spec says so.
- The firm is **Fernbridge Building Society**, which is fictional. Never use a real prospect's name.
- Real UK enforcement precedents (in `precedentCorpus.ts`) stay real and posture-tagged.

**Product boundary. These are hard fails if violated on screen.**
- AI drafts and challenges. It never decides, never files, never notifies, and never re-tunes thresholds or models.
- Action verbs are only "prepare", "propose", "draft" and "send to owner". Never "file", "notify", "submit" or "complete now".
- Every AI element carries the AI marker.
- Every action passes a human gate and writes an audit-log entry.
- Every number has a denominator or comparison.
- Practice is labelled as practice, not presented as a rule.

**Integrity overrides status.**
- If a metric's feed is unreconciled, or its attestation precedes a completed run, the face shows **Unverified**: a neutral grey outline, the word "Unverified" and a broken-link glyph.
- Unverified is never shown as a red, amber or green colour.

**Theme.**
- Light-first, conservative and low-chroma, with a dark toggle.
- In dark mode, lime `#dcfc84` is never used on any status, delta, gauge or marker.
- Purple `#bc6cd3` is for the AI marker only.
- Borders are decorative only.

**Wording.** UK terminology, British spelling, no exclamation marks, dates as DD Month YYYY.

**How to work.**
- Work in passes, as set out in section 3.
- After each pass, run lint, typecheck and build. Fix every error.
- Commit with a clear message, then report back to me before starting the next pass.

## 1. Read the pack in this order

The documents are long. Read the ones marked FULL completely, paging if needed. Use the others as reference when a pass needs them.

| # | File | How to read | What it gives you |
|---|---|---|---|
| 1 | `README.md` | FULL | Pack map and status |
| 2 | `00_config/PHASE3_BRIEF.md` | FULL | Confirmed decisions, existing build facts, user decisions (theme, Unverified, beat order) |
| 3 | `00_config/RunConfig_yaara-uk-risk_cro-smf4-board.md` | FULL | Product, persona, intent, governance |
| 4 | `00_config/product-profiles/yaara-uk-risk.md` | FULL | Domain spine, boundary, does-not-do list, component vocabulary |
| 5 | `00_config/product-methodologies/yaara-uk-risk-analysis-method.md` | FULL | Unit types, card anatomy, honesty line |
| 6 | `02_spec/Stage4_Personas_...md` | Sections on the primary persona, the remove list, hard fails HF-1 to HF-10, card binding | Who it is for and what must not appear |
| 7 | `02_spec/Stage6_UI_Spec_...md` | FULL, including the revision table at the end | The four screens (S1–S4), zones, cards, copy |
| 8 | `02_spec/Stage7_UX_Blueprint_...md` | FULL, including the revision table | Flows, drill signatures, states, demo storyline (beats 1→4), human gates |
| 9 | `02_spec/Stage8_Frontend_Architecture_...md` | FULL, including the revision table | Component tree (CMP-1 to CMP-39), routing, state slices ST-1 to ST-10, file locations, widget registry |
| 10 | `04_quality/Stage9C_Build_Quality_Filter_v1.md` | FULL | Governance rule IDs to enforce or avoid per screen and component, and fixes V-1 to V-11 (already applied in Stages 6–8) |
| 11 | `02_spec/Stage5_Capabilities_DataModel_...md` | Reference | Entities, fields, per-unit specs for the 23 primary-view cards, tie-out list TC-1 to TC-10 |
| 12 | `03_data/Stage9A_*`, `03_data/Stage9B_*` (if present) | FULL | Locked mock data: business-as-usual universe, then the seeded units and evidence |
| 13 | `05_build/Stage10_Cursor_Build_Prompt_*` (if present) | FULL | Pre-sequenced passes. If present, follow its pass order and content in preference to section 3 below |
| 14 | `01_research/*` | Only if you need the "why" | Research behind the cards. Do not mine it for new features |

**If `03_data/` has no 9A/9B files yet:**
- Build the mock data ONLY from figures already fixed in Stages 5, 6 and 7. These include the S1 headline (88%, £96m on £4.0bn), members 1.45m → 1.90m, handlers 58 → 63, 94.0% (2,256,000 of 2,400,000), 112 of 9,400, 1,208 flag fires, 97 via the savings pot, and the ERC on 14 October 2026.
- Resolve the tie-out items TC-1 to TC-10 in Stage 5 so every number agrees across screens.
- Put all of it in one data module and list every figure in a tie-out table in `lib/ukbankingaudit/boardRiskV8/TIEOUT.md`.
- Mark the data as provisional, so it can be swapped for 9A/9B later without component changes.

## 2. Before writing any code, report back

1. **Repo read** (the pack could not see the code). Read and summarise:
   - `components/UKBankingAudit/UKBankingControlTrace.tsx`: the variant router and every negation guard such as `variant !== "v6"` / `"v7"`;
   - the variant union type, and whether `v8-board` collides with it;
   - the `DomainDrillPanel` props, and how to render it with no lens toggle (existing prop, new optional `hideLensToggle`, or a wrapper);
   - `SuppressionLedger`, and whether its visible label can become "Override log";
   - `ScreeningDenominator` and `OperationalAssuranceVerdict`, and how to wire them;
   - `precedentCorpus.ts`;
   - `lib/ukbankingaudit/` folder conventions;
   - which chart approach the app uses.

   List every place where the repo differs from Stage 8 and propose the smallest change.
2. **Your understanding, in 10–15 lines:**
   - the four screens;
   - the four demo beats;
   - the domain spine;
   - the Unverified rule;
   - the hard fails.
3. **Your pass plan,** with the files each pass creates or edits.

Then wait for my go-ahead.

## 3. Build passes

Follow Stage 10's passes instead if `05_build/` contains them. Each pass ends with lint, typecheck and build, a commit, and a short report.

**Pass 1: foundation.**
- Add the `v8-board` branch in the router.
- Replace the scattered negation guards with one helper, so v8-board is always excluded from the v6/v7 paths.
- Create the variant shell, `BoardRiskApp`: theme provider (light-first, dark toggle), header, viewer switch (CRO / BRC chair preview), in-memory store (ST-1 to ST-10 skeleton) and typed view routing.
- Create the primitives CMP-1 to CMP-8, including `StatusToken`, where Unverified has its own token.
- Create the widget registry file (Stage 8 §1.7).
- No business data yet. v6 and v7 must render exactly as before; verify this.

**Pass 2: data layer.**
- Create the data module(s) under `lib/ukbankingaudit/boardRiskV8/`, from 9A/9B or from the fallback in section 1.
- Add typed entities matching Stage 5 and the tie-out table.
- Add the selectors that compute integrity before status.

**Pass 3: S1 Board Risk View (beats 1 and 2).**
- Use the post-9C layout:
  - row 0: AI band ("What's critical / What's due before the BRC / What's holding steady");
  - row 1: headline (T2-1) and strategy strip on the left; Z2 (T2-5) stacked above Z5 (T2-14 with T2-17 inline) on the right;
  - row 2: RAS scorecard, boxed to 4 visible rows with summary line;
  - row 3: horizon line.
- Each figure appears once.
- Build the drills DG-1 (headroom / threshold cascade / leading indicators) and the T2-14 lineage drill (runs, cohorts, attestation timeline, ruled-out alternatives, Metro precedent).
- Implement the beat 1 and beat 2 human gates with audit entries. The beat 2 caveat accept creates a new version, and the face stays Unverified.

**Pass 4: S2 Principal-risk drill.**
- Host it in `DomainDrillPanel` with NO lens toggle. Sections run in spine order.
- Fraud is a filter, not a lens.
- Wire `ScreeningDenominator` (T2-15) and `OperationalAssuranceVerdict` (T2-23).
- Include the collapsible inline audit trail in every drill.

**Pass 5: S3 Restrictions and reportability (beat 3).**
- AI band on row 0.
- Population test headline: "112 of 9,400 tested", with the labelled contrast line "flag fired 1,208 times".
- Process gap: 97 via the savings pot.
- Clause evidence list.
- Reportability ledger, with route rows on the face, boxed, and one click to the route case.
- Draft per route with no default answer. Each route reads "sent to Head of Compliance · decision pending". The SMF16 decision shows as a pre-seeded append-only row.
- The awareness-gap block (T2-30) is visible to the CRO and deciding SMF only. It is removed entirely, not hidden, for the chair.

**Pass 6: S4 Escalation health (beat 4, BRC chair).**
- AI band.
- The single item removed at the ERC on 14 October 2026 with no reason (vulnerable-customer exceptions, amber for 3 quarters), which is the same item as T2-34 / T2-35.
- Exception feed and override log, with a manifest version diff.
- KRI tiles T2-36, T2-37 and T2-38 (label: "Which closed actions have not moved their metric?").
- CRO actions on the chair preview appear as a separate labelled strip.
- The restore proposal creates a new manifest version; the chair decides.

**Pass 7: clean-up and self-audit.**
- Remove internal codes from card faces; they may appear in drills only.
- Check no forbidden verbs appear and no `forecast` label remains (it must say `projection`).
- Check the AI marker is on every AI element and every number has a denominator.
- Check dark-mode colour rules and keyboard focus states.
- Run through the Stage 7 demo storyline end to end in the browser, beats 1→4, with no dead drills.
- Then fill in an audit table against:
  - Stage 4 hard fails HF-1 to HF-10;
  - Stage 9C AUTO_REJECT and HARD_ENFORCE items;
  - the product does-not-do list.

  For each, give pass/fail and evidence (file and line, or a screenshot). Fix every fail before reporting done.

## 4. Definition of done
- The `v8-board` variant renders S1–S4 with the viewer switch, and v6 and v7 are unchanged.
- The four-beat demo runs end to end with no dead ends. Numbers tie out across screens (see the tie-out table).
- Every Stage 9C fix (V-1 to V-11) is visible in the UI.
- Lint, typecheck and build are clean. Each pass is a separate commit.
- You have given me:
  - the list of files created and changed;
  - the audit table;
  - any spec items you could not implement, and why.
