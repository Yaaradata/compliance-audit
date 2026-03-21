# Swift review template (UI shell)

Design tokens and layout match the provided reference (Plus Jakarta / JetBrains Mono, CSS variables, navy sidebar, two-column review).

## Rules

- **`swift-review-template.tsx`** — presentational pieces only; **no API calls, no assessment copy**.
- **`swift-review-template-page.tsx`** — wires sidebar + topbar + control header + evidence/eval columns; **all text and bodies are props**.
- **Scoped CSS** — `swift-review-template.css` applies under **`.swift-review-tpl`** only (imported by the building-block components). Wrap any subtree that uses `var(--blue)` etc. in that class; `SwiftReviewTemplatePage` sets it on the root.

## Usage

```tsx
import {
  SwiftReviewTemplatePage,
  SwiftReviewComparisonField,
  SwiftReviewFindingCard,
} from "@/components/review/swift-review-template";
```

Build `evidence.children` and `evaluation.children` from your submission + evaluation payloads. For tabs, drive `activeTabId` / `onTabChange` and render lists from your criteria arrays.

## Demo

`/demo/swift-review-template` — fullscreen overlay preview with sample findings (replace with real data).
