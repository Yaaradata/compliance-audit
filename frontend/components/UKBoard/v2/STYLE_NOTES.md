# UK Board v2 — style notes copied from UK Banking Audit v7 (read-only study)

Source: `components/UKBankingAudit/` (v7). Nothing there is edited; patterns are copied into this folder.

## Global

| Token | v7 value |
|---|---|
| Page background | `bg-slate-50` |
| Header | `sticky top-0 z-30 bg-white border-b border-slate-200`; row `px-6 py-3 flex items-center gap-6` |
| Main area | `px-6 py-6`, sections `space-y-6` |
| Standard card | `rounded-xl border border-slate-200 bg-white shadow-sm p-5` |
| Board panel | `rounded-2xl border border-slate-200/90 bg-white shadow-sm p-3 sm:p-4` |
| Tile | `rounded-[10px]` or `rounded-md`; hover `hover:shadow-md` |
| Page title | `text-2xl font-extrabold tracking-tight text-slate-900`; sub `mt-1 text-sm text-slate-600` |
| Section h2 | `text-base font-bold text-slate-900` |
| Card title | `text-[13px] font-bold leading-tight` or `text-sm font-semibold` |
| KPI | `text-2xl`–`text-4xl font-bold tabular-nums` |
| Label | `text-[10px] font-bold uppercase tracking-wider text-slate-500` |
| Body | `text-[13px]` / `text-xs` / `text-[11.5px] leading-snug text-slate-600` |
| Brand indigo | logo `bg-gradient-to-br from-indigo-600 to-indigo-800`; active tab `border-indigo-600 text-indigo-700`; primary `bg-indigo-600 hover:bg-indigo-700 text-white`; links `text-indigo-600 hover:text-indigo-800` |
| AI accent | violet (`text-violet-700`, `bg-violet-50`, `border-violet-100`) |

## Status tokens (`ragTokens.ts`)

| | bg | border | text | solid pill | dot | left rail |
|---|---|---|---|---|---|---|
| Red | `bg-red-50` | `border-red-300` | `text-red-600` | `bg-red-600 text-white` | `bg-red-500` | `border-l-red-500` |
| Amber | `bg-amber-50` | `border-amber-300` | `text-amber-700` | `bg-amber-500 text-white` | `bg-amber-500` | `border-l-amber-500` |
| Green | `bg-emerald-50` | `border-emerald-300` | `text-emerald-600` | `bg-emerald-600 text-white` | `bg-emerald-500` | `border-l-emerald-500` |
| Unconfirmed (UK Board only) | `bg-slate-50` | `border-dashed border-slate-300` | `text-slate-600` | outline `border-slate-400 text-slate-600` + broken-link icon | `bg-slate-400` | `border-l-slate-400` |

Pill: `rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide`.

## Patterns

| Pattern | v7 recipe | UK Board use |
|---|---|---|
| Brand header | RC tile `h-8 w-8 rounded-md`; name `text-sm font-semibold tracking-tight` with `.uk` in `text-indigo-600`; subtitle `text-[10px] text-slate-500 -mt-0.5`; persona chips in `bg-slate-100 rounded-lg p-0.5`, chip `px-3 py-1.5 text-xs font-medium rounded-md`, active `bg-white shadow-sm`; search `w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md`; Live chip with `h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse` | Header |
| Sub-tabs | row `px-6 flex items-center gap-1 border-t border-slate-100`; tab `px-4 py-2 text-xs font-medium border-b-2`, active `border-indigo-600 text-indigo-700` | 6 tabs |
| Posture banner | `rounded-xl border-[1.5px] p-5` + status bg/border; dot `h-3.5 w-3.5 rounded-full`; label `text-[11px] font-bold uppercase tracking-widest`; word `text-2xl font-extrabold`; line 1 `text-sm text-slate-700`; line 2 `text-[13px] font-semibold text-slate-600` | Overview banner |
| Category card | `flex flex-col border-[1.5px] px-3 py-2.5 rounded-[10px] h-full` + status bg/border; title `text-[13px] font-bold`; summary `text-[11.5px] leading-snug text-slate-600 line-clamp-3`; footer `mt-auto flex justify-between`; trend `text-[13px] font-semibold tabular-nums` with ↗/↘/→ | Franchise cards |
| Side panel + signal cards | panel `flex h-full flex-col rounded-2xl …`, scroll `overflow-y-auto`; card `relative rounded-[10px] border border-slate-200 bg-white pl-3` with rail `absolute inset-y-0 left-0 w-[3px]`; metric `text-base font-extrabold` | For your decision; horizon |
| Change list | item `rounded-r-lg border-l-[3px] bg-stone-50/80 py-2.5 pl-3.5 pr-3` + rail; text `text-[13px] text-slate-700`; tag `rounded px-2 py-0.5 text-[10px] font-semibold` + status bg/text; standing `text-[10.5px] font-medium uppercase tracking-wide text-slate-400` | Overview change lists; removed items |
| Measure tile + appetite bar | value `text-2xl font-bold tabular-nums`; track `h-1.5 rounded-full bg-slate-100`; tick `w-px bg-slate-900`; OVER/WITHIN `text-[9px] font-bold uppercase tracking-wider` | Appetite dials (kept as the v2 dial with zones) |
| Sparkline | polyline `strokeWidth 1.5`; stroke red `#e11d48` / amber `#d97706` / green `#059669` / neutral `#64748b`; fill `#fee2e2` / `#fef3c7` / `#d1fae5` / `#f1f5f9` | Trend tiles |
| Path to green | strip `rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2`; "Path to Green" `text-[9px] font-bold uppercase text-slate-500`; `% ` `text-[10px] font-bold`; `AMBER → GREEN`; `n/m actions` `text-[10px] text-slate-500` | Footer of red/amber cards |
| Profile header | `rounded-xl border bg-white p-5`; name `text-xl font-bold`; role chip `text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded`; score `text-4xl font-bold` | Owner cards |
| Timeline | list `divide-y divide-slate-100`; row `px-5 py-3 flex gap-3`; dot `h-2 w-2 rounded-full bg-indigo-500`; type `text-[10px] uppercase tracking-wider font-bold text-indigo-700`; date `text-[10px] text-slate-500`; label `text-xs text-slate-800` | Agent activity; decision history |
| Insight card | `flex flex-col rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-md`; source tag `text-[10px] font-semibold text-slate-500`; severity pill; title `text-sm font-bold`; body `text-xs text-slate-600`; footer `border-t border-slate-100 pt-3 text-[10px]` | Agent cards |
| Three-bucket | `grid md:grid-cols-3 md:divide-x divide-slate-100`, column `p-4`, count `text-3xl font-bold` + status text, dot `h-3 w-3 rounded-full` | Sign-off status |

## Dropped for the board

Rule IDs, control and evidence IDs (`font-mono` refs), RULE/LLM dot legend, model names and versions, OCS/RSS scores, hashes. AI provenance becomes the purple sparkle + "AI agent" or "Rule check".
