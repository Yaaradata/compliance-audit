# Stage 0 — Foundational Understanding Document
## AI-Powered Audit & Compliance Solution — Lion Brewery (Ceylon) PLC

**Prepared for:** Product / engineering team scoping an MVP for Lion Brewery's CTO
**Brief restated:** *"Audit and compliance is consuming too much of my team's time and my time. I want to run this with AI — faster, smoother, cheaper."*
**Sections in this document:** 1–9 (complete).

> **How to read this:** Section 1 maps the operational universe. Sections 2–3 define the compliance pillars and the data behind each. Sections 4–5 cover the human and friction reality. Sections 6–8 turn it into AI design direction. Section 9 is the honesty section — what is still unknown. Figures marked **[EST]** are estimates; **[VERIFY]** items must be confirmed with Lion directly before build.
>
> *This is an informational scoping document, not legal advice. Exact statutory obligations must be confirmed with Lion's regulatory/legal counsel and the relevant authorities.*

---

## 1. DOMAIN ONTOLOGY

### 1.0 Orientation — why a brewery's ontology is not a generic F&B factory

Three structural facts about Lion shape *everything* in the compliance design:

1. **Lion is a tax-collection apparatus as much as a manufacturer.** Roughly two-thirds to three-quarters of a beer's shelf price is tax, and the largest number Lion produces daily is not litres of beer — it is **excise duty owed to the State**, assessed on *litres of pure alcohol* removed from the brewery. The Excise Department physically supervises the bonded brewery. This makes Lion closer to a mint or a customs warehouse than a soft-drinks plant. Most compliance pain radiates from here.
2. **The product is a controlled substance with a near-fixed, licensed retail universe.** Lion can only sell into a small, government-capped set of licensed outlets (~4,500 nationally). The distribution network is a *closed, enumerable graph* — good news for an AI system: the universe of legitimate customers is finite and knowable.
3. **It is effectively a single-site manufacturer with a global tail.** ~90% of volume flows through one integrated brewery at Biyagama, but ~15% of *output* is exported into a dozen-plus jurisdictions, each with its own import-label and food-safety regime. The compliance surface is "narrow but deep" domestically, "shallow but very wide" on export.

### 1.1 Core manufacturing processes

The line is continuous-then-batch. Each transition is also a compliance/measurement checkpoint (`⟶ CHECKPOINT`).

| Stage | What physically happens | Audit relevance |
|---|---|---|
| **1. Raw material intake** | Malted barley, hops, adjuncts, yeast, brewing water, CO₂, packaging (returnable glass, cans, crowns, labels) | Supplier COAs, import permits (malt/hops mostly imported), pesticide/heavy-metal limits. `⟶ goods-receipt vs PO vs COA` |
| **2. Milling & mashing** | Grain milled, mixed with hot water; starch → fermentable sugar (wort) | Recipe control; allergen (gluten/barley) basis |
| **3. Lautering** | Spent grain separated from wort | Spent grain tracked as by-product (animal feed → traceability) |
| **4. Boiling & hopping** | Wort boiled, hopped, sterilised | Energy/emissions logging; recipe adherence |
| **5. Fermentation** | Yeast + wort → alcohol + CO₂. **ABV — and excise liability — is created here.** | `⟶ originates the tax base; most audit-sensitive point in the building` |
| **6. Maturation** | Cold conditioning | Tank-residence + temperature logs |
| **7. Filtration** | Yeast/haze removed | Clarity/micro spec; filter integrity |
| **8. Carbonation** | CO₂ to target volume | Spec conformance |
| **9. Bright-beer storage** | Finished beer awaiting packaging | **In-bond stock reconciliation point** (beer exists, duty not yet "removed") |
| **10. Packaging — filling** | 625 ml & 330 ml returnable glass; 500 ml & 330 ml cans; kegs. **~92% of bottles reused** | `⟶ fill-volume × ABV × units = duty event; returnable-bottle float reconciliation` |
| **11. Labelling & coding** | Labels, statutory text, batch/date code, price marking, **excise security sticker** | `⟶ statutory label content + sticker reconciliation (1.4)` |
| **12. Secondary packaging** | Crates / shrink-wrap, palletised | Lot integrity for recall |
| **13. Warehouse → dispatch** | To bonded FG warehouse, released against excise permits | `⟶ "removal from bond" = duty crystallises + transport permit must exist` |

**Expert nuance:** the excise-relevant quantity is **litres of pure alcohol (LPA)**, not litres of beer. A 4.8% lager and an 8% stout off the same line carry very different duty per bottle. The system's "unit of truth" must be **(units packaged) × (fill volume) × (measured ABV of that batch)**, reconciled against what was declared to Excise. Drift between fermentation-tank ABV, packaging-line ABV, and declared ABV is simultaneously a quality issue *and* a tax-exposure issue — the highest-leverage data point in the plant.

### 1.2 Plants — how many, where, what each does

**Headline: Lion is, for practical purposes, a single-site brewer.**

| Site | Location | Role | Status |
|---|---|---|---|
| **Biyagama main brewery** | No. 254, Colombo Road, Biyagama (~20–25 km E of Colombo, industrial zone) | Entire integrated operation: brewing, fermentation, filtration, bottling, canning, kegging, warehousing, dispatch. Brews Lion (Lager, Strong, Extra Strong, Stout), Carlsberg (licensed), and the Three Coins/Millers portfolio. | **Active — primary.** Capacity ~2 m hL/yr; production ~1.5 m hL/yr **[EST]**; effective working capacity **[VERIFY]** |
| **Craft / Innovation Centre** | Co-located at Biyagama | Rs ~4 bn small-batch craft facility (opened Dec 2024); ~2,000 L specialty/export batches (white wheat, red ale, fruit infusions, Belgian blonde, Ceylon-tea beer, coffee stout). | **Active — new.** Adds SKU complexity + export-first profile |
| **Meegoda (ex-Millers/McCallum)** | Meegoda, suburban Colombo | Acquired 2014 with the Three Coins portfolio. | **Closed — production consolidated to Biyagama.** Historical brand source only |
| **Pearl Springs (Pvt) Ltd** | Group subsidiary | Bottled-water / corporate vehicle used in the Millers acquisition. | Relevant to *group* consolidation; **[VERIFY]** any separate site/scope |

**Implication:** because manufacturing is one site, the *plant-floor data problem is tractable* — you instrument one brewery, not a federated estate. Complexity lives **downstream** (the ~4,500-outlet graph, exports, settlement) and **upstream** (imported raw-material compliance). MVP scoping should be biased *away* from "smart factory" theatre and *toward* distribution / excise / export reconciliation.

### 1.3 Quality control & lab testing checkpoints

- **QC gate 1 — Incoming materials:** malt, hops, adjuncts, water, CO₂, packaging. Moisture, microbial load, pesticide/heavy-metal screen, packaging migration; reconcile supplier COA vs actual test.
- **QC gate 2 — In-process:** wort gravity, pH, fermentation temperature, yeast viability, dissolved oxygen, **ABV trajectory**, diacetyl, CIP/tank sterility.
- **QC gate 3 — Finished/bright-beer release (critical):** final ABV, carbonation, clarity/turbidity, colour (EBC), bitterness (IBU), foam stability, **microbiological sterility**, fill-volume, sensory sign-off. The gate that authorises packaging/sale.
- **QC gate 4 — Packaging line:** fill level, seal/crown/seam integrity, **label placement & legibility, date/batch code, security-sticker presence**.
- **Stability / shelf-life:** retained samples vs best-before claim.
- **Water & effluent:** intake potability + **wastewater discharge testing** (CEA parameters) — an environmental pillar, not just QC.

**Nuance:** the export-oriented craft line raises allergen/additive declaration and input-traceability requirements far above the mainstream lager, so the *long tail of SKUs drives most of the QC paperwork*. AI value concentrates at **gate 3 (release)** and **gate 4 (code/label/sticker verification)** — where a failure converts directly into a recall or a labelling/excise violation.

### 1.4 Labelling & regulatory marking requirements

Beer labels are simultaneously a **food label, a tax instrument, and a public-health-regulated object**:

- **Statutory text:** product name/type, **ABV %**, **net volume**, manufacturer name & address, **batch/lot + date code**, allergen basis, statutory/health warnings.
- **Price marking:** Excise rules require the **selling price printed on each bottle** by manufacturer/wholesaler and displayed at the premises — unusual vs generic FMCG and an audit trip-wire.
- **Excise security sticker / banderole (CONFIRMED, current):** since **January 2022** every locally manufactured liquor bottle — **beer included** — must carry an Excise security sticker (contractor: Madras Security Printers; ~Rs 1.21/sticker; "Foolproof" and "Digital Printing" variants). The programme covers ~70 manufacturers + ~18 importers and is credited with >60% excise-revenue growth in three years. Lion must reconcile **stickers issued ↔ bottles produced ↔ duty paid**. This is now a core, non-optional reconciliation.
- **Standards marking:** conformance to applicable **SLSI / SLS** specifications for beer and labelling/packaging.
- **Advertising restriction context:** alcohol advertising is heavily restricted under **NATA** (see §7); on-pack and trade content is constrained.
- **Export labels (per destination):** each market imposes its own mandatory set (allergen format, language, health statements, importer-of-record). The same beer may need **3–5 different label artworks**.

**Automation nuance:** label/marking compliance is the most *AI-tractable* domain — visually verifiable and rule-bound. A vision model + rules table can check "is each mandatory element present, legible, correctly positioned, and matched to the batch's actual ABV / price / sticker?" High priority, high confidence.

### 1.5 Distribution chain & point-of-sale universe

**The national licensed-outlet universe (the closed graph Lion sells into):**
- **~4,500 total liquor licences nationally** (early 2025), spanning retail wine stores *and* on-premise points (bars, restaurants, hotels, clubs).
- **~1,500** are retail liquor vendors ("wine stores", FL 4 / FL 22).
- New licences are tightly capped and politically sensitive — only ~361 new licences across all categories in 2024 (172 FL 4). The retail count barely moves year to year.

**Relevant Excise licence categories (legal "node types"):** FL 1 (manufacture malt liquor — *Lion's own*), FL 6 (Beer & Porter), FL 3 (Wholesale), FL 4 (Retail "wine store"), FL 22 (Beer/Ale/Stout & Wine retail), FL 7/FL 8 (Hotel / Hotel-bar), FL 11/FL 13A (Restaurant / Club).

**Lion's served base:** historically ~**2,800 active outlets, ~70% off-trade / ~30% on-trade** **[EST — older equity research; current figure is a Section 9 data gap]**. Given ~90% beer share, Lion likely touches the large majority of all active liquor-selling premises in the country.

**Channels:** (1) domestic off-trade (volume backbone, returnable-bottle, cash-heavy); (2) domestic on-trade/HORECA (kegs + packaged, credit-based, tourism-linked); (3) **imported-brand distribution arm** — Lion is sole importer/distributor of Diageo (Guinness, Johnnie Walker, Smirnoff, J&B) and Moët Hennessy (Hennessy, Moët, Dom Pérignon) brands + Corona, bolting an import/customs surface onto the company; (4) export (~15%, target 20%) — Maldives (largest), Africa, South Asia, West Asia, historically Japan/UK/Australia; craft range export-first.

**Why this matters for AI:** every legitimate node has an Excise licence number, so a *canonical outlet master keyed on licence number* can flag any dispatch to an expired/suspended/non-existent licence (a real risk — licences get suspended for tax arrears).

### 1.6 Settlement across channels — payment modes & audit risk

| Channel | Typical settlement | Primary audit risk |
|---|---|---|
| Off-trade wholesale/retail | Largely **cash** / prepaid / COD; some transfer | Cash → revenue-leakage & reconciliation risk; tying dispatch ↔ receipt ↔ duty is labour-intensive |
| On-trade (HORECA) | More **credit** (30–60 day), some digital | Ageing receivables + **diversion** (product resold off-premise) |
| Distributor layer | Transfer, credit limits, deposits | Distributor stock/returns + **returnable-bottle deposit float** |
| Imported-brand arm | Bank/import-linked | Customs duty + import-doc reconciliation |
| Export | **Bank / LC / advance**, FX | FX repatriation (CBSL), export-proceeds reconciliation, doc-vs-payment matching |

**Two beer-specific settlement traps:** (1) **Returnable-bottle deposit accounting** (~92% reused) — a perpetual reconciliation of bottles shipped vs returned vs breakage vs deposit liability; a notorious source of ghost stock. (2) **Duty is paid on "removal from bond," not on customer payment** — Lion pre-funds duty on beer that has left but isn't yet paid for; the Excise Department can suspend licences for unsettled duty, so this reconciliation is existential.

**AI angle:** highest-confidence wins are **three-way reconciliation** — (dispatch/goods-issued) ↔ (excise duty + sticker) ↔ (cash/credit settled) — flagging cash-channel gaps and deposit drift.

### 1.7 Cold chain & logistics compliance

Beer is freshness/condition-sensitive (tropical heat affects shelf-life claims, especially kegged/craft) but the bigger compliance item is the **permit chain**: every movement between bonded points and to trade requires a valid **Excise transport permit**; unpermitted transport beyond limits is an offence. Also: **returnable-empties reverse logistics**; **export logistics** (containerisation, certificates of origin / free-sale / health, destination import permits); **spent-grain by-product** traceability. *For AI, the permit chain (right-to-move documentation) is more audit-relevant and more automatable than thermal cold-chain telemetry — don't let generic "cold-chain IoT" crowd out permit-chain reconciliation.*

### 1.8 People, roles & accountability for compliance

| Role / function | Compliance accountability |
|---|---|
| Board / MD / CEO (CEO R.H. Meewakkala; Chairman A. Cabraal) | Licence integrity, CSE governance, group risk; a suspended manufacturing licence is a going-concern event |
| **CTO / Tech leadership (sponsor)** | Mandate to automate; today bears the time-cost of manual, people-heavy compliance |
| Brewing / Operations | Process adherence, batch records, in-bond stock accuracy, the LPA/ABV figures feeding excise |
| Quality / QA-QC | QC gates, SLSI conformance, release sign-off, recall traceability, COA control, lab data integrity |
| Compliance / Regulatory Affairs | Licence renewals, label conformance, liaison with SLSI/health/environment, export dossiers |
| **Finance / Excise / Tax** | The operational core: excise computation/declaration/payment/reconciliation, VAT, deposit accounting, export proceeds, tax-clearance for renewals |
| Supply chain / Logistics | Transport permits, dispatch-vs-bond reconciliation, empties, export shipping docs |
| Distributor / Sales network | Selling only into valid licensed outlets; settlement discipline; trade price-marking |
| EHS / Sustainability | Effluent/discharge (CEA), emissions, packaging/ESG reporting |
| Internal Audit / Risk | Periodic verification across all the above (the function AI partly augments) |
| **EXTERNAL — Excise officers** | **Physically supervise the bonded brewery**; their records and Lion's must agree |
| EXTERNAL — SLSI, NATA, Ministry of Health/PHIs, CEA, Customs, CBSL, BOI, destination regulators | Standards, alcohol public-health, food safety, environment, import/export, FX, zone, foreign markets |

**UX-shaping nuance:** the people who *generate* source data (floor operators, lab techs, dispatch clerks, distributor reps) are **not** the people who *suffer the audit pain* (Finance/Excise, Compliance officer, CTO). A system that demands more floor data-entry to relieve top-level pain will fail adoption → **capture data passively/at-source (sensors, OCR of permits/labels/stickers, ERP/LIMS extraction)** rather than asking the floor to type more.

### Cross-cutting "units of truth"
1. **Batch** (ABV, volume, QC release, label artwork, date code) — origin of both quality and tax facts.
2. **Litres of Pure Alcohol (LPA) per removal** — the excise tax base.
3. **Excise transport permit** — legal right-to-move; pairs every dispatch.
4. **Licensed outlet (by Excise licence no.)** — the only legitimate destination; has a validity state.
5. **Security-sticker serial** — issued ↔ applied ↔ duty-paid.
6. **Returnable-bottle deposit position** — perpetual empties reconciliation.
7. **Export consignment dossier** — per-destination label + documentation bundle.

These seven entities, and the reconciliations *between* them, are the spine of the AI solution.

---

## 2. COMPLIANCE & AUDIT PILLARS

> *Expert lens: a generalist lists "quality, safety, environment." A brewery-compliance specialist knows the centre of gravity is **excise + sticker + permit reconciliation**, that **NATA advertising rules** are a real legal exposure, and that **licence renewal is hostage to tax clearance**. The pillars below are ordered by business criticality, not alphabetically.*

| # | Pillar (description) | Internal owner | Audit frequency | Key pain at scale (why hard without AI) | Maps to (local / international) |
|---|---|---|---|---|---|
| **P1** | **Excise Duty & Revenue Assurance** — compute, declare, pay duty on LPA removed; the company's largest liability flow | Finance/Excise team + Plant + resident Excise officers | **Batch + daily (removals); monthly returns; annual** | Reconciling LPA across fermentation → packaging → removal → declaration; manual ledgers vs Excise officer records; any drift = under/over-payment or penalty | Excise Ordinance; Excise Department; alcohol-volume duty regime (2018+) |
| **P2** | **Security-Sticker / Banderole Reconciliation** — every bottle carries a serialised excise sticker | Plant/Packaging + Excise team | **Batch + daily** | Matching stickers procured ↔ applied ↔ scrapped ↔ duty-paid units; wastage/voids; tampering claims | Excise Department sticker programme (2022+); Madras Security Printers contract |
| **P3** | **Product Quality & Food Safety** — beer meets spec and is safe | QA/QC Manager | **Batch (release) + periodic + event (complaint/recall)** | Lab data scattered across LIMS/instruments/paper; COA reconciliation; demonstrating an unbroken HACCP evidence chain on demand | SLSI/SLS beer & labelling standards; Food Act No. 26 of 1980; Codex; ISO 22000 / FSSC 22000 / HACCP |
| **P4** | **Labelling, Marking & Marketing/Advertising** — on-pack legality + ad restrictions | Regulatory Affairs + Marketing | **Batch (label/code) + event (campaign)** | Per-SKU × per-market artwork version control; ABV/price/sticker match; NATA advertising prohibition exposure | Food (Labelling & Advertising) Regs 2005; NATA Act No. 27 of 2006; SLSI |
| **P5** | **Licensing & Permit Management** — FL 1 manufacturing licence + transport/movement permits | Compliance/Regulatory Affairs + Legal | **Annual renewal + per-movement (permits) + event** | FL renewal is **conditional on IRD tax clearance**; lapse = production/sales halt; transport permit per consignment | Excise Ordinance; Excise Department; IRD (tax clearance) |
| **P6** | **Distribution / Trade & Anti-Diversion** — sell only into valid licensed outlets; prevent leakage to grey market | Sales + Compliance | **Daily/monthly + event** | Validating ~thousands of outlet licences continuously; detecting diversion/over-supply; no live link to Excise licence status | Excise Ordinance licensing; Excise Department |
| **P7** | **Financial, Tax & Statutory Reporting** — VAT, corporate tax, related-party (Carlsberg licence), CSE disclosure | Finance + Company Secretary | **Monthly / quarterly / annual** | VAT/SVAT, transfer-pricing on related-party flows, timely CSE disclosures; reconciling tax sub-ledgers | IRD; CSE/SEC listing rules; LKAS/SLFRS; CA Sri Lanka |
| **P8** | **Environmental / Effluent / Emissions** — discharge, water extraction, emissions | EHS / Sustainability | **Monthly/quarterly sampling + annual EPL renewal + event** | Effluent testing cadence vs EPL conditions; water-balance reporting; evidence on inspection | National Environmental Act; CEA; Environmental Protection Licence (EPL) |
| **P9** | **Occupational Health & Safety** — pressure systems (CO₂, boilers), ammonia/glycol refrigeration, confined spaces | EHS / HR | **Periodic + event (incident)** | Statutory inspection records for pressure vessels; incident reporting; contractor safety | Factories Ordinance; Department of Labour; ISO 45001 (voluntary) |
| **P10** | **Export & Customs Compliance** — per-consignment documentation + FX | Export/Supply chain + Finance | **Per-consignment + event** | Per-destination dossiers (CoO, free-sale, health, halal where needed); FX repatriation timelines; label conformity per market | Customs Ordinance; Sri Lanka Customs; Foreign Exchange Act / CBSL; BOI; destination regulators (EU/UK/AU/GCC/Maldives/India) |
| **P11** | **Import / Sole-Distributor Compliance** — Diageo/Moët imported brands | Import arm + Finance | **Per-consignment** | Customs valuation + excise on imported liquor; bonded-warehouse reconciliation; brand-owner contractual compliance | Customs Ordinance; Excise (imported liquor); contractual |
| **P12** | **Returnable Packaging, Deposits & ESG** — deposit liability + sustainability disclosure | Finance + Sustainability | **Monthly + annual** | Reconciling deposit float (shipped/returned/broken); emerging EPR/packaging reporting; ESG narrative for CSE/investors | CSE ESG/integrated reporting; emerging Extended Producer Responsibility; CEA |
| **P13** | **Governance, Internal Audit & Anti-Bribery** — inspector-discretion exposure, controls | Internal Audit + Board | **Quarterly / annual** | Paper-heavy inspections create bribery/discretion exposure; demonstrating controls to auditors | Companies Act No. 07 of 2007; CSE listing rules; Bribery Act |

---

## 3. DATA LANDSCAPE PER PILLAR

> *Expert lens: the recurring failure mode is not "no data" — it's **data trapped in instruments, spreadsheets, paper permits, and the Excise officer's parallel ledger**, never joined on a common key (batch / licence / sticker serial). The AI opportunity is mostly a **data-integration-and-reconciliation** problem dressed as an "AI" problem.*

| Pillar | Data that exists today | Likely format | Missing / inconsistent | Data AI needs for (near-)real-time checks | Sensitivity / sovereignty |
|---|---|---|---|---|---|
| **P1 Excise** | Production logs, packaging counts, removal/gate-pass records, excise returns | ERP modules + **Excel** + **paper gate passes** + Excise officer's manual register | Live LPA per batch rarely joined to removals; reconciliation done after the fact | Batch ABV + fill volume + units packaged + removal events, all keyed to batch; declared-duty feed | Tax data — sensitive; must stay reconcilable to government records |
| **P2 Sticker** | Sticker procurement, application counts, void/scrap | Vendor records + **manual counts** | Serial-level "applied vs paid" link weak; voids under-recorded | Sticker serial issuance + line-application scans + scrap log | Anti-fraud sensitive |
| **P3 Quality** | Lab results, instrument readings, COAs, sensory sheets, CIP logs | **LIMS (if any) + instrument exports + paper/Excel** | Inconsistent capture across gates; sensory often paper; supplier COAs as PDFs/email | Structured per-batch test results + spec limits + release status | Product IP (recipes) — confidential |
| **P4 Label/Ad** | Approved artworks, packaging specs, campaign assets | **PDF/AI design files + DAM (maybe) + email approvals** | No single source of truth for "current legal artwork per SKU per market"; ad-approval trail scattered | Artwork version registry + rules table + line camera/sample images | Brand IP; market-specific |
| **P5 Licensing** | FL licences, renewals, transport permits, tax-clearance certs | **Paper certificates + PDFs + email** | Expiry dates not centrally tracked; permits paper-based | Licence/permit registry with expiry + status + linkage to dispatches | Legal documents |
| **P6 Distribution** | Outlet master, dispatch records, sales orders | ERP/CRM + **distributor spreadsheets** | Outlet master not keyed to Excise licence no.; no live licence-status check | Canonical outlet master (licence no., validity) + dispatch feed | Customer/commercial data |
| **P7 Finance/Tax** | GL, VAT returns, tax computations, CSE filings | ERP/finance system + Excel | Tax sub-ledger reconciliations manual; related-party flows under-documented | GL feeds + tax rules + filing calendar | Financial — highly sensitive; insider-info rules (listed co.) |
| **P8 Environment** | Effluent test reports, EPL, water meter logs | **Lab PDFs + paper + Excel** | Sampling cadence vs EPL conditions not tracked to deadline | Test results + EPL limits + sampling schedule | Regulatory; reputational |
| **P9 OHS** | Inspection certs, incident logs, training records | **Paper + Excel** | Pressure-vessel inspection dates scattered; near-misses under-reported | Asset inspection registry + incident feed | Personal (employee) data — privacy |
| **P10 Export** | Invoices, CoO, free-sale/health certs, shipping docs, FX inwards | **PDF + email + bank statements** | Per-destination dossier completeness checked manually; FX-timeline tracking manual | Consignment dossier checklist + destination rules + FX-receipt feed | **Cross-border: export records + destination PII may trigger data-residency/contract terms (see §7)** |
| **P11 Import** | Customs entries, bond records, brand-owner reports | Customs system + ERP + PDF | Bonded-stock reconciliation manual | Entry + duty + bond movement feed | Commercial/contractual |
| **P12 Packaging/ESG** | Deposit ledger, empties movement, sustainability metrics | ERP + Excel | Deposit float drift; ESG metrics assembled annually by hand | Bottles shipped/returned/broken + deposit liability | Investor-facing |
| **P13 Governance** | Audit reports, board packs, policy docs | DMS + PDF | Control evidence scattered; inspection logs informal | Control register + evidence index | Confidential/board |

**Cross-cutting sovereignty note:** export records and any destination-customer data can attract **foreign data-protection/contractual obligations**, and Sri Lanka's **Personal Data Protection Act No. 9 of 2022** (phasing into force) governs employee/customer personal data. AI tooling that sends data to overseas LLM endpoints should isolate (a) recipe/brand IP, (b) tax data tied to government records, and (c) personal data — and prefer in-region or contractually-bound processing for these. **[VERIFY Lion's data-residency stance and any Carlsberg-group data policies.]**

---

## 4. STAKEHOLDER MENTAL MODELS

**CTO / Technology leadership (the sponsor).** Frustration: compliance is a **people-and-hours sink** with no leverage — every audit, return, and inspection pulls senior time into firefighting and manual reconciliation, and the cost scales with volume and SKU count. They see other functions digitised while compliance still runs on Excel, PDFs, and the Excise officer's ledger. *Success* = fewer human-hours per audit cycle, faster/cleaner regulator interactions, no nasty surprises (penalties, licence risk), and a dashboard that lets them answer "are we compliant right now?" in minutes, not weeks. Risk for the product team: the CTO will judge success on **demonstrable hour-savings and risk-reduction**, not model sophistication.

**Quality Manager.** Day-to-day friction: data lives in instruments, a partial LIMS, lab notebooks, and email PDFs; assembling a batch's full QC story for a release or a recall is manual archaeology. Tools: LIMS (possibly partial), instrument software, spreadsheets, paper sensory sheets. Wishes for: one-click batch genealogy ("show me everything about batch X"), automatic spec-breach flagging, and COA auto-reconciliation. They are **evidence-oriented and conservative** — they will trust AI only if it shows its working and never silently overrides a release decision.

**Compliance / Regulatory Affairs Officer.** Anxiety: a lapsed FL licence, a missed permit, a wrong label, or a NATA advertising slip can each halt sales or trigger penalties — and they often find out *after* the fact. What keeps them up: **renewal deadlines tied to tax clearance**, per-market export label drift, and inspector discretion they can't predict. Wishes for: a deadline radar, a "single source of legal truth" for current obligations, and an audit-ready evidence pack on demand. They will be the **strongest internal champion** if the tool removes the fear of the unknown audit.

**Plant Floor Supervisor.** Compliance is experienced as **paperwork that interrupts production** — logs, gate passes, sticker counts, sign-offs. Digital-adoption likelihood is **moderate-to-low** unless the tool reduces, not adds, steps; touchscreen/scan workflows beat typing; Sinhala/Tamil UI matters. Design rule: **capture at source, passively** (scanners, line cameras, sensors) — never ask the floor to key in more.

**Finance / Excise team.** The heaviest burden-bearers: monthly excise and VAT returns, daily removal reconciliations, sticker accounting, returnable-deposit float, export-proceeds and FX timelines — much of it in spreadsheets cross-checked against the Excise officer's register and the bank. Their nightmare is a **reconciliation break discovered during an audit** that implies underpayment. Wishes for: automated three-way reconciliation and an always-current duty position. They will adopt fast **if the numbers tie out and are explainable to a regulator.**

**External Auditor (Excise / SLSI / Customs / financial).** What they look for: can you **produce the evidence trail on demand** and does it **tie out** — production vs removals vs duty vs stickers; lab release vs spec; permits vs movements; declared vs actual. Common failure modes they exploit: missing/late documents, unreconciled gaps, inconsistent figures between systems, and informal/paper records that can't be verified. They reward **traceability and consistency** over polish. Implication: the AI system's job is partly to make Lion *audit-ready by default* — the evidence pack should already exist before the auditor asks.

---

## 5. CURRENT PROCESS FRICTIONS (without AI)

> *Effort figures are **[EST]** for scoping only — they are illustrative ranges for a brewery at Lion's scale, to be validated by time-study in discovery (Section 9). They assume a small central compliance/finance team plus distributed plant/lab effort.*

| # | Friction (what breaks/slows/costs) | Downstream consequence | Est. manual effort **[EST]** |
|---|---|---|---|
| 1 | **Excise LPA reconciliation** across fermentation → packaging → removal done in spreadsheets after the fact | Under/over-payment, penalties, dispute with resident Excise officer | ~40–80 team-hrs/month |
| 2 | **Security-sticker reconciliation** (issued vs applied vs scrapped vs paid) by manual count | Revenue loss, fraud suspicion, audit findings | ~20–40 team-hrs/month |
| 3 | **Assembling batch QC evidence** for release/recall from scattered LIMS/paper | Delayed release (tied-up working capital), slow recall = safety/reputational risk | ~15–30 team-hrs/week |
| 4 | **Label/artwork version control** per SKU × market, approvals by email | Wrong ABV/price/warning on-pack = recall + regulatory violation | ~10–20 team-hrs/month + spikes |
| 5 | **Licence & permit deadline tracking** in spreadsheets/paper | Lapsed FL licence halts production/sales; missing transport permit = seizure | ~8–16 team-hrs/month + crisis spikes |
| 6 | **Validating outlet licence status** before dispatch (no live link) | Selling into suspended/expired outlet; diversion liability | ~20–40 team-hrs/month |
| 7 | **VAT / tax sub-ledger reconciliation** manual | Filing errors, interest/penalties, tax-clearance delay (blocks licence renewal) | ~30–60 team-hrs/month |
| 8 | **Effluent/EPL sampling-vs-deadline tracking** manual | Missed sampling = EPL breach, possible stop-notice | ~6–12 team-hrs/month |
| 9 | **Export dossier completeness** checked by hand per consignment | Shipment held at destination, demurrage, lost orders | ~4–10 team-hrs/consignment |
| 10 | **Returnable-bottle deposit float reconciliation** | "Ghost" stock, misstated deposit liability, inventory variance | ~20–40 team-hrs/month |

*Aggregate: the manual load plausibly runs into several hundred team-hours/month across finance, compliance, QC and logistics — the concrete target the CTO's "consuming too much time" refers to.* **[EST — validate in discovery]**

---

## 6. AI INTERVENTION OPPORTUNITIES (per pillar)

> *Expert lens: AI reliability is **high where the rule is explicit and the data is structured/visual** (labels, deadlines, reconciliations) and **low where judgement, regulator discretion, or unstructured legal interpretation dominate**. Confidence flags below reflect that.*

| Pillar | Automate capture/verify | Flag anomalies pre-violation | Auto-generate audit pack | Human-in-the-loop (why) | Confidence |
|---|---|---|---|---|---|
| **P1 Excise** | OCR gate passes; pull ERP/line counts; compute LPA per batch | Drift between tank ABV / line ABV / declared duty; removal without permit | Monthly excise return draft + reconciliation workpaper | Finance signs the return; legal liability for declaration | **HIGH** |
| **P2 Sticker** | Scan sticker serials at application; tie to batch | Issued-vs-applied-vs-paid mismatch; abnormal voids | Sticker reconciliation report | Excise officer verification | **HIGH** |
| **P3 Quality** | Auto-ingest LIMS/instrument data per batch | Spec breach, trend drift, missing test before release | Batch genealogy + HACCP evidence pack | **QA must approve release** (safety + legal) | **MEDIUM-HIGH** |
| **P4 Label/Ad** | Vision-check on-pack vs rules + batch ABV/price/sticker; artwork registry | Wrong/missing element; outdated artwork for market; ad-rule risk | Per-SKU/market compliance certificate | Legal sign-off on novel claims & ad campaigns (NATA nuance) | **HIGH** (label) / **MEDIUM** (ad interpretation) |
| **P5 Licensing** | OCR licences/permits; extract expiry/status | Renewal deadline radar; tax-clearance dependency alerts | Licence/permit status dashboard + renewal pack | Officer files renewals; relationship management | **HIGH** |
| **P6 Distribution** | Match dispatches to outlet master (licence no.) | Dispatch to expired/suspended/unknown outlet; diversion patterns | Trade-compliance exception report | Commercial decision on holding a shipment | **MEDIUM-HIGH** |
| **P7 Finance/Tax** | Pull GL; auto-reconcile tax sub-ledgers | Mismatch vs returns; filing-deadline risk | Draft VAT/tax workpapers | Accountant/auditor sign-off; transfer-pricing judgement | **MEDIUM** |
| **P8 Environment** | Ingest effluent lab results; track sampling cadence | Result near/over EPL limit; missed sampling | EPL compliance pack | Environmental officer interprets exceedance cause | **MEDIUM-HIGH** |
| **P9 OHS** | Asset/inspection registry; OCR certs | Overdue pressure-vessel inspection; incident clustering | Safety compliance summary | Safety judgement; statutory inspection by competent person | **MEDIUM** |
| **P10 Export** | Dossier checklist auto-assembly; doc OCR | Missing cert per destination; FX-repatriation deadline | Per-consignment export compliance pack | Trade/legal judgement on destination rules | **MEDIUM** (rules vary, change) |
| **P11 Import** | Reconcile customs entries vs bond movements | Bond variance; duty mismatch | Import duty reconciliation | Customs broker/finance sign-off | **MEDIUM** |
| **P12 Packaging/ESG** | Track empties movement; compute deposit float | Float drift, inventory variance | Deposit-liability + ESG metric pack | Finance validates liability; ESG narrative is judgement | **MEDIUM-HIGH** (deposit) / **LOW-MEDIUM** (ESG narrative) |
| **P13 Governance** | Index control evidence; map to requirements | Missing control evidence; overdue actions | Internal-audit evidence index | Auditor/board judgement; anti-bribery is human/legal | **MEDIUM** |

**General human-in-loop principle:** AI **prepares, flags, and reconciles**; humans **decide and sign** anything that (a) is a legal declaration to a regulator, (b) is a product-release/safety decision, or (c) involves regulator discretion or novel legal interpretation. Never let the model file or release autonomously.

---

## 7. JURISDICTIONAL & REGULATORY NUANCES (Sri Lanka)

**Core acts, ordinances & bodies**
- **Excise Ordinance** (the spine) → **Excise Department** (Treasury): manufacturing licence (FL 1), duty on LPA, transport permits, possession limits, the **security-sticker programme (since Jan 2022)**, and physical supervision of the bonded brewery. The Excise Ordinance scope explicitly spans import, export, manufacture, transport, possession and sale.
- **Sri Lanka Standards Institution (SLSI)** → SLS specifications for beer, labelling and packaging.
- **Food Act No. 26 of 1980** + **Food (Labelling & Advertising) Regulations 2005** → administered by the **Ministry of Health** via Public Health Inspectors / Food & Drug Inspectors; food-safety and label content.
- **National Authority on Tobacco and Alcohol (NATA) Act No. 27 of 2006** → under the Minister of Health; monitors **production, marketing and consumption** of alcohol and enforces **advertising/promotion restrictions** (violations carry fines up to ~Rs 50,000 and/or imprisonment up to 2 years). This is a frequently underestimated exposure for a brand-heavy company.
- **Central Environmental Authority (National Environmental Act)** → Environmental Protection Licence (EPL), effluent/emissions.
- **Sri Lanka Customs (Customs Ordinance)** → import/export entries, valuation, duty.
- **Foreign Exchange Act / Central Bank (CBSL)** → export-proceeds repatriation.
- **BOI (Board of Investment)** → if Biyagama operations sit within a BOI/zone framework, additional reporting/incentive-compliance applies. **[VERIFY Lion's BOI status.]**
- **IRD** (VAT/corporate tax + **tax-clearance that gates licence renewal**), **CSE/SEC** (listed-company disclosure), **CA Sri Lanka / LKAS-SLFRS** (financial reporting), **Companies Act No. 07 of 2007**, **Personal Data Protection Act No. 9 of 2022** (phasing in).

> **Clarification for cross-referencing (Gemini/Perplexity often get this wrong):** **NMRA (National Medicines Regulatory Authority) is NOT the relevant body for beer** — it governs medicines/pharmaceuticals. The alcohol public-health regulator is **NATA**, food safety is under the **Food Act / Ministry of Health**, and product standards are **SLSI**. Do not map beer compliance to NMRA.

**Export compliance (~15% of output, target 20%)**
- **Maldives** (largest export market): import licensing/permits via Maldivian authorities; alcohol is tightly restricted to licensed resorts/bonded operations — supply is to a controlled channel.
- **EU / UK** (craft push): full food-information labelling (allergens, ingredients, ABV, importer-of-record), and excise/duty handled by the importer; EU food-contact and additive rules apply.
- **Australia**: FSANZ labelling (Country of Origin, standard drinks, allergen), strict import inspection.
- **GCC / West Asia**: alcohol import via licensed channels only; **halal-supply-chain segregation** and Arabic labelling considerations; some markets bonded/duty-free-channel only.
- **India / South Asia**: state-level excise complexity (India), BIS-type standards, high duties.
- **Japan** (historical): strict labelling + additive compliance.
- Cross-cutting export artefacts: **Certificate of Origin, Free-Sale/Health certificate, ingredient/allergen declarations, possibly halal certification, per-market label artwork, and FX-repatriation evidence.**

**Ambiguous / paper-heavy / discretion-prone areas**
- **Inspector discretion** at the bonded brewery and at trade level — outcomes can hinge on individual officers; paper records create both delay and **bribery/discretion exposure** (a governance risk, P13).
- **Transport permits** remain largely paper/manual — a classic friction and seizure risk.
- **Label/advertising interpretation under NATA** — what counts as "advertising/promotion" can be interpreted broadly (sponsorships, digital, point-of-sale).
- **Sticker programme operational edge-cases** (voids, reprints, line wastage) — reconciliation rules not always crisply documented.

**Upcoming changes (2024–2026 horizon)**
- **Near-annual excise-duty increases** (20% in Jan 2023; further with VAT 15→18% Jan 2024; another hike Jan 2025) — duty tables change frequently, so any duty-calc engine must be **config-driven, not hard-coded**, and volumes are tax-sensitive (post-hike softness reported).
- **Security-sticker programme deepening & digitisation** — credited with >60% excise-revenue growth (Rs 170 bn 2022 → Rs 226 bn 2024; Rs 190 bn in 9M-2025 vs a Rs 242 bn full-year-2025 target); a **dedicated sticker-system application** was developed and submitted to **Sri Lanka CERT** for review. Expect tighter serial-level, possibly track-and-trace, reconciliation obligations — a direct AI integration point.
- **PDPA No. 9 of 2022** phasing into enforcement → governs employee/customer/export personal data; shapes where AI may process data.
- **Emerging Extended Producer Responsibility / packaging-sustainability** expectations feeding ESG disclosure.
- **[VERIFY]** any new SLS beer-standard revision and any 2026 budget excise measures at build time (duty regimes move).

---

## 8. DESIGN IMPLICATIONS FOR THE AI SYSTEM

**The 3 first use cases (highest value × highest pain × fastest to demo)**

1. **Excise Duty & Security-Sticker Reconciliation Engine (P1 + P2).** The single highest-value, board-relevant target. Continuously computes the duty position from batch ABV × fill × units × removals, reconciles against stickers and against the Excise officer's figures, and drafts the monthly return with a defensible workpaper. *Demo:* "here is today's live duty position and any reconciliation break." High confidence, directly attacks the CTO's pain, and ties to the company's largest liability.
2. **Label & Marking Compliance Checker (P4).** Vision + rules verification that every packaged SKU carries the correct, current, legible statutory elements — ABV, net volume, price, warnings, **security sticker**, and the right artwork *for its destination market*. *Demo:* upload/scan a label → instant pass/fail with reasons. Fast to build, visually compelling, high confidence, prevents recall-grade errors.
3. **Licence, Permit & Outlet-Validity Radar (P5 + P6).** A canonical registry of FL licences, transport permits and outlet licence numbers with expiry/status, plus deadline alerts (including the tax-clearance dependency) and a pre-dispatch "is this outlet valid?" check. *Demo:* a deadline dashboard + "this dispatch is going to a suspended outlet" alert. Prevents production-halting lapses and diversion liability.

*(Why these three: each maps to a high-pain pillar, each is HIGH/MEDIUM-HIGH AI confidence, each produces a visible artefact a CTO can show a board, and together they cover excise, product, and trade — the three risk axes from §1.0.)*

**Minimum data infrastructure before AI can work**
- A **canonical data model keyed on the seven "units of truth"** (batch, LPA-removal, permit, outlet-licence, sticker-serial, deposit position, export dossier).
- **Digitised, machine-readable feeds** from: ERP (production, dispatch, finance), LIMS/instruments (QC), packaging line (counts, sticker scans, optionally line cameras), and **OCR for paper permits/licences/certs**.
- A **config-driven rules/duty-table store** (duty rates, label rules per market) — because regulation changes frequently.
- An **immutable evidence/audit log** so every flag and every generated document is traceable (auditors reward traceability).

**Integration touchpoints**
- **ERP** (production orders, inventory, dispatch, finance/GL) — likely SAP or a tier-2 ERP **[VERIFY which]**.
- **LIMS / lab instrument software** (QC results) — possibly partial; **MES** if present on the line.
- **Packaging-line PLC/sensors + sticker applicator** (counts, serials) and optional **line vision cameras** (label check).
- **Document management / email** (COAs, permits, licences, export certs) → ingestion + OCR.
- **Excise interface** — today largely the resident officer's records; design for reconciliation against them and for the **future sticker-system API** once live.
- **Banking / FX feeds** (export proceeds), **CSE/IRD filing** outputs.

**UI/UX — who uses it daily, and how**
- **Finance/Excise team (power users):** reconciliation dashboards, exception queues, one-click return/workpaper drafts. Numbers must be **explainable and exportable** for a regulator.
- **Compliance officer:** deadline radar, "current obligations" view, on-demand audit-evidence pack.
- **QA manager:** batch-genealogy view, spec-breach queue, release checklist (AI prepares, QA approves).
- **Plant floor / packaging:** **scan-and-go**, minimal typing, touchscreen, **Sinhala/Tamil** support; passive capture wherever possible.
- **CTO / leadership:** a single "are we compliant right now?" posture dashboard with hour-saved / risk-flag metrics.
- Cross-cutting: every AI output **shows its working** (source documents, the rule applied) — trust is the adoption currency here.

**Tread-carefully zones (AI error → regulatory exposure)**
- **Any figure declared to the Excise Department / IRD** — an AI miscalculation that flows into a return is a legal liability. AI drafts; a named human signs.
- **Product release / recall decisions** — safety and legal; AI flags, QA decides.
- **Label legality, especially ABV, warnings, and export-market claims** — a confident-but-wrong "pass" can ship a non-compliant product at scale.
- **Advertising/promotion under NATA** — broad, interpretation-heavy; keep legal in the loop.
- **Data handling** — recipe IP, tax data tied to government records, and personal/export data should not be sent to ungoverned overseas endpoints (PDPA + contracts).
- **Hallucinated regulatory "facts"** — duty rates and label rules must come from the config store / cited source, never the model's memory.

---

## 9. GAPS & UNCERTAINTIES

**What we don't know / couldn't confirm from public sources**
- **Exact current served-outlet count and on/off-trade split** (the ~2,800 figure is older equity research). **[VERIFY from distributor master data]**
- **Effective current brewing capacity & utilisation** (sources span ~750k hL historic to ~2 m hL stated). **[VERIFY]**
- **Settlement mix by channel** (cash vs credit vs digital %) — proprietary. **[VERIFY from finance]**
- **Current ERP/LIMS/MES stack** and degree of existing digitisation. **[VERIFY — this materially changes MVP scope]**
- **BOI/zone status** of the Biyagama site and any associated reporting. **[VERIFY]**
- **Lion's data-residency stance** and any Carlsberg-group data/governance policies constraining cloud/LLM use. **[VERIFY]**
- **Exact sticker-programme operational rules** (voids/reprints/wastage reconciliation) and the status/API of the new sticker application at CERT. **[VERIFY with Excise + Lion]**
- **Latest revenue** (LKR ~58.5 bn was FY2022; the brief's "~$500 m" looks high vs ~€350 m / LKR figures — reconcile fiscal year + FX). **[VERIFY]**
- **Pearl Springs and any non-Biyagama operations** in scope. **[VERIFY]**
- **Manual-effort hours in §5 are [EST]** — not measured.

**Key assumptions made (and what would change them)**
- *Assumed single-site manufacturing.* If a second operating site or significant outsourced packing exists, the plant-floor scope multiplies. → multi-site data model.
- *Assumed compliance pain centres on excise/sticker/permit reconciliation.* If discovery shows quality or environmental as the acute pain, reorder the first-build use cases.
- *Assumed mostly on-prem/spreadsheet data today.* If a mature ERP+LIMS already exists, the project shifts from "capture & digitise" to "integrate & reason," accelerating the MVP.
- *Assumed regulator interaction is still largely manual/paper.* If the Excise sticker API/portal is live and open, the duty-reconciliation use case can integrate directly rather than reconcile after the fact.

**Primary research / experts needed before building**
- **Lion's Head of Finance/Excise** — duty workflow, reconciliation cadence, sticker accounting, return process (the #1 interview).
- **QA/QC Manager** — LIMS reality, release/recall workflow, lab data formats.
- **Compliance/Regulatory Affairs Officer** — licence/permit calendar, export dossiers, NATA exposure.
- **IT/ERP owner** — exact systems, APIs, data access, security/residency constraints.
- **Plant & packaging supervisor** — line data capture, sticker application, realistic floor UX.
- **External: an Excise practitioner / former officer** — to codify the discretion-prone, undocumented reconciliation rules.
- **Export manager + a freight/customs broker** — per-destination documentation truth.
- A **time-and-motion study** across §5 frictions to replace the **[EST]** effort figures with measured baselines (this becomes the ROI case for the CTO).

---

## Sources & confidence notes

- **Company/plant facts** (single-site Biyagama; ~2 m hL capacity / ~1.5 m hL production; craft innovation centre Dec 2024; Meegoda/Millers closure & consolidation; ~92% returnable bottles; export ~15%, 20% target; brand portfolio; Diageo/Moët distribution): Lion Brewery / EDB profile, VLB Berlin, Sunday Times (Dec 2024), Adaderana, Wikipedia (*Lion Brewery (Sri Lanka)*, *Three Coins Beer*, *Beer in Sri Lanka*), Oxford Companion to Beer.
- **Market share ~90%** (range 82–90% across sources): *Beer in Sri Lanka* / equity coverage. **[Confidence: MEDIUM]**
- **Excise mechanics** (alcohol-volume duty since 2018; ~Rs 2,400/L alcohol for beer pre-hikes; 20% hike Jan 2023; VAT 15→18% Jan 2024; further Jan 2025 hike; price-on-bottle; mandatory book-keeping; transport permits; licence suspension for tax arrears): Sri Lanka Excise Department pages, Drinks Business, EconomyNext, Movendi, lankanewsweb.
- **Security-sticker programme** (since Jan 2022; Madras Security Printers; ~Rs 1.21/sticker; covers ~70 manufacturers + 18 importers; "Foolproof"/"Digital Printing"; revenue Rs 170 bn 2022 → 178 bn 2023 → 226 bn 2024; Rs 190 bn 9M-2025 vs Rs 242 bn target; new app submitted to Sri Lanka CERT): Daily Mirror (Apr 2026).
- **Outlet universe** (~4,500 total licences early 2025; ~1,500 retail; ~3,500 renewed; 361 new in 2024 incl. 172 FL 4) + **FL licence categories**: Daily Mirror (Jan 2025), Sri Lanka Mirror / Times Online / Newswire (Dec 2024), Excise Department licence list.
- **NATA / Food Act**: NATA Act No. 27 of 2006 (nata.gov.lk, Tobacco Control Laws, Parliament PDF); Food (Labelling & Advertising) Regulations 2005 (PHI Union of Sri Lanka).

*End of document. Sections 1–9 complete, per brief. **[EST]** and **[VERIFY]** markers indicate scoping estimates and items requiring confirmation with Lion before build.*
