# SWIFT Architecture Diagrams

Images are copied from the repo root folder `Swift Architecture Diagrams` with normalized names.
One architecture can have multiple diagrams; the user selects one when choosing an architecture, and that selection is stored as evidence for A5 (Architecture Type Declaration).

Naming convention: `{ArchId}-{index}.png` (e.g. `A1-1.png`, `A1-2.png`, `A4-1.png`, `B-1.png`).

- **A1** — Full Local SWIFT Infrastructure (e.g. A1-1.png, A1-2.png)
- **A2** — Shared SWIFT Infrastructure (e.g. A2-1.png)
- **A3** — Connector (Alliance Lite2) (e.g. A3-1.png)
- **A4** — Customer Connector (e.g. A4-1.png, A4-2.png, A4-3.png)
- **B**  — No Local SWIFT Footprint (e.g. B-1.png, B-2.png)

Supported format: `.png`. To add new images, place them in `Swift Architecture Diagrams` with names like `A1 - 3.png`, then copy to this folder as `A1-3.png` and update `ARCHITECTURE_DIAGRAMS` in `frontend/lib/data/architectures.ts`.
