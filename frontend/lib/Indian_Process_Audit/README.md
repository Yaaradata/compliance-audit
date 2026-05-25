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
| `index.ts` | `getProcessAuditData()` singleton export |

## App / components

- `app/Indian_Process_Audit/v1|v2/page.tsx` — routing only; renders `ProcessAuditDashboard`
- `components/Indian_Process_Audit/ProcessAuditDashboard.tsx` — UI; reads `const D = getProcessAuditData()`

## V2 changes

Edit mock content in `assembleSnapshot.ts`. Keep UI changes in `components/Indian_Process_Audit/`.
