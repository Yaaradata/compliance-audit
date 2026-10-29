# UK Board Risk View — build pack (v1, 27 October 2026)

This pack contains everything produced by the research factory pipeline for the `v8-board` variant of the UK Banking Audit product. Start with `CLAUDE_CODE_PROMPT.md`.

**Run:** Yaara Risk & Compliance, UK Board Risk View.
- Primary persona: CRO (SMF4) at board altitude.
- Secondary: the BRC chair.
- Intent: sales demo.
- Demo firm: Fernbridge Building Society (fictional).

## Folder map

| Folder | Contents | Status |
|---|---|---|
| `00_config/` | Run configuration, Phase 3 brief (all confirmed decisions), product, methodology, domain and persona profiles | Final |
| `01_research/` | Stage 0 engine outputs (GP, OP, GM), research-level merged corpus, Stage 1 mining ×3, Stage 2 use-case merge, Stage 3 insight-card catalogue | Final (reference only) |
| `02_spec/` | Stage 4 personas, Stage 5 data model, Stage 6 UI spec, Stage 7 UX blueprint, Stage 8 frontend architecture. Stages 6–8 include the 9C fixes; see the revision table at the end of each | Draft, accepted for build |
| `03_data/` | Stage 9A mock data universe, Stage 9B mock data behaviour | **Pending.** Will be added in pack v2 |
| `04_quality/` | Stage 9C build-quality filter (governance rule IDs per screen and component) | Final |
| `05_build/` | Stage 10 Cursor build prompt (pass sequence) | **Pending.** Will be added in pack v2 |

## Decisions locked for the build
- **Beachhead:** structured data only. The committee-minutes features are Tier 3 extensions, not built.
- **Theme:** light-first with a dark toggle. Lime is never used for status.
- **Unverified:** grey outline, the word "Unverified" and a broken-link glyph. It is never a RAG colour.
- **Beat order:**
  1. headroom and growth against control capacity;
  2. green that is not defensible;
  3. restriction test fails and reportability is drafted for an SMF;
  4. BRC chair: "is bad news reaching me?".
- **Screens:** S1 Board Risk View; S2 Principal-risk drill; S3 Restrictions and reportability; S4 Escalation health (BRC chair).
- **Variant:** `v8-board`. v6 and v7 are untouched, and the auth files are untouched.

## Open items to confirm during the build
These were not checked against the live repo:
- the router guards;
- the `DomainDrillPanel` lens-toggle prop;
- the `SuppressionLedger` label;
- the variant type;
- the folder conventions.

The prompt makes Claude Code check all of these before writing code.

Before any client demo, check every regulatory date and clock against the primary rule text. See `01_research/UKRISK-stage1-merged-27Oct2026.md`, section M-G.
