# Indian Process Audit — data layer

Mock and derived audit data for the process-audit UI. **Components must not embed datasets**; import via:

```ts
import { getProcessAuditData } from '@/lib/Indian_Process_Audit';
```

## Layout

| Path | Role |
|------|------|
| `types.ts` | Domain types (`AuditControl`, `EvidenceBundle`, …) |
| `assembleSnapshot.ts` | Raw controls, SOPs, cases, journeys, overview KPIs, AI intel (built once) |
| `riskCommandCenter/` | V3 cockpit + journey mock (`auditData.ts`, `cockpitData.ts`) |
| `index.ts` | `getProcessAuditData()` singleton export |

## App / components

- `app/Indian_Process_Audit/v1|v2|v3/page.tsx` — routing only; renders `ProcessAuditDashboard`
- `app/Indian_Process_Audit/v2|v3/Fast-Tag/` — versioned Fast-Tag UI (v3 is latest)
- `components/Indian_Process_Audit/ProcessAuditDashboard.tsx` — UI; reads `const D = getProcessAuditData()`

## Versioning

- **v3** — default route; Overview = Executive Risk Posture Cockpit (`components/.../cockpit/v3/`). Domain journey matrix = funnel drill (`components/.../journey/v3/`). Fast-Tag under `app/Indian_Process_Audit/v3/Fast-Tag/`.
- **v2** — frozen snapshot for comparison.
- **v1** — classic process flow (no Fast-Tag tab).

Edit mock content in `assembleSnapshot.ts`. Shared UI lives in `components/Indian_Process_Audit/`.
