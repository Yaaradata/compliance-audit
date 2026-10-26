# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

```
compliance-audit/
├── backend/          # FastAPI + PostgreSQL API server
├── frontend/         # Next.js 16 app (App Router)
└── docs/             # Architecture and integration guides
```

## Frontend commands (run inside `frontend/`)

```bash
npm run dev           # start dev server (localhost:3000)
npm run build         # production build
npm run lint          # ESLint
npm run dev:clean     # wipe .next + node_modules/.cache, then dev

# Test suites (Node native --test runner via tsx, no Jest)
npm run test:ukpa-signals   # UK Process Audit signals layer
npm run test:ukba-v5        # UKBankingAudit v5
npm run test:ukba-v6        # UKBankingAudit v6

# Run a single v7 test file directly
npx tsx --test lib/ukbankingaudit/v7/exposure.test.ts
```

There is no `test:ukba-v7` script yet — run v7 tests directly via `npx tsx --test lib/ukbankingaudit/v7/<file>.test.ts`.

## Backend commands (run inside `backend/`)

```bash
uvicorn app.main:app --reload   # dev server (localhost:8000)
pytest tests/                   # run all backend tests
pytest tests/test_aws_flow.py   # single test file
```

## Architecture overview

### Multi-tenant compliance SaaS

Banks are **tenants** that select a SWIFT architecture variant, collect cloud/manual evidence for each control, then route evidence through a multi-stage review workflow (CO → IT SME → L1/L2/L3 reviewer → external assessor → approved). Two framework schemas coexist in PostgreSQL: `swift_2025` and `swift_2026`, selected per assessment cycle.

### Backend (FastAPI)

- Entry: `backend/app/main.py`; 25 routers under `backend/app/routers/`
- Auth: JWT (HS256, 1440-min expiry) via `app/dependencies.py`
- DB: PostgreSQL with SQLAlchemy 2.0; idempotent migrations run at app startup (`app/database.py`); default schema `swift_2025`
- AI: Vertex AI (Gemini 2.5-flash-lite) primary, OpenAI (gpt-4o-mini) fallback — see `app/services/ai_service.py`
- Cloud collectors: `app/aws_evidence/`, `app/azure_evidence/`, `app/gcp_evidence/`; results stored in DB and uploaded to GCS

### Frontend (Next.js 16 App Router)

Route groups are organised by audit product under `frontend/app/`:
- `UKBankingAudit/` — UK banking (v5, v6, v7)
- `UK_Process_Audit/` — UK process audit
- `IndianBankingAudit/`, `Indian_Process_Audit/`
- `USBankingAudit/`, `Srilanka_Retail/`

`frontend/lib/` holds all data and business logic; components under `frontend/components/` are presentation only.

Path alias `@/*` maps to `frontend/` root.

### UK Banking Audit versioning (v5 → v7)

Each version is additive. `mockDataV2.ts` is the shared base — **never edit it for v6/v7 features**. v7 extends via `mockDataV7.ts` (spreads `mockDataV6`, overlays MLRO operational keys).

**v7-specific additions:**
- MLRO Operational Dashboard (`MLROWorkspaceV7`) — 6 widgets: TM Alert Backlog, SAR Timeliness, EDD Pipeline, Sanctions Screening, Training Posture, Fraud Loss
- Persona: Head of Financial Crime (SMF17)
- Shared primitives: `CollapsibleSection`, `StatTile`, `WidgetShell`/`WidgetCardFooter`

**Router guard rule (`UKBankingControlTrace.tsx`):** every `variant === "v6"` branch must have a parallel `variant === "v7"` branch, and every `variant !== "v6"` exclusion must also exclude `"v7"`. Current verified count: 13:13 (v6/v7 branches), 12:12 (exclusions).

### Data integrity guardrails

These are enforced by tests and must not be bypassed:

- **`typeContracts.test-d.ts`** (v5/v6/v7) — compile-time: `admissionPosture` non-nullable, `evidenceRef` required, no `score` field, `actorId` non-nullable
- **`noOutbound.test.ts`** — fails if any network sink (FCA/NCA POST targets) appears in v7 lib or component files
- **ESLint bans** — phrases like "has breached", "is non-compliant", "illegal", "violation", "at risk", "watch closely", "critical exposure" are banned

### Precedent corpus rules

`precedentCorpus.ts` (v6/v7) contains real UK enforcement actions in three tiers:
- `verified` — NatWest, Nationwide, Monzo, Barclays, HSBC, TSB
- `probable` — Starling, BoI, FCA Watch, Wells Fargo
- `unverified` — **Metro Bank penalty is UNRESOLVED; never put on client slides**

FCA Enforcement Watch firms are unnamed and must stay unnamed. US OCC record is a placeholder — replace before US demo.

### SWIFT reference data

`frontend/lib/frameworks/swift-cscf/` contains:
- Architecture applicability matrices (`architectures.v2025.ts`, `architectures.v2026.ts`)
- Per-control evidence field definitions (`evidence/a1-evidence.ts` … `h9-evidence.ts`)
- Domain approval order (`approval-ideology.ts`)

### CodeGraph MCP

For symbol navigation (callers/callees), use CodeGraph MCP with `limit: 100`. Example: `codegraph_callers({ symbol: "crew", limit: 100 })`. Do not grep before or after.

## Open v7 items (do not build without explicit instruction)

- Rename Exposure / Momentum / Defensibility lenses (blocked on terminology research)
- Client Risk View internals (Saurabh has sequenced this next)
- KRI strip EDD past-due **11** vs EDD widget **5** — two sources for one metric, do not silently change either number
- Five dormant `v7/mlro/` components exported but not mounted: `SuppressionLedger`, `DispositionDispersion`, `ScreeningDenominator`, `CadenceFeasibility`, `OperationalAssuranceVerdict`
