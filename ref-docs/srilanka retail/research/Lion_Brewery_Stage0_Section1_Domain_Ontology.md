# Stage 0 — Foundational Understanding Document
## AI-Powered Audit & Compliance Solution — Lion Brewery (Ceylon) PLC

**Document scope:** Section 1 only — *Domain Ontology*
**Prepared for:** Product / engineering team scoping an MVP for Lion Brewery's CTO
**Brief restated:** "Audit and compliance is consuming too much of my team's time and my time. I want to run this with AI — faster, smoother, cheaper."

> **Reading note for the product team:** This section maps the *physical and operational universe* the AI system has to observe and reason over. It deliberately stays descriptive (the "what exists") rather than prescriptive (the "what to build" — that is Section 8). Wherever a figure is an estimate or carries a confidence flag, it is marked **[EST]** or **[VERIFY]**. Sources are listed at the end.

---

## 1. DOMAIN ONTOLOGY

### 1.0 Orientation — why a brewery's ontology is not a generic F&B factory

Three structural facts about Lion shape *everything* in the compliance design and are easy for a generalist to miss:

1. **Lion is a tax-collection apparatus as much as a manufacturer.** In Sri Lanka roughly two-thirds to three-quarters of a beer's shelf price is tax, and the largest single number Lion produces every day is not litres of beer — it is **excise duty owed to the State**, assessed on *litres of pure alcohol* produced and removed from the brewery. The Excise Department physically supervises the brewery. This makes the brewery a *bonded, supervised manufacturing environment*, closer to a mint or a customs warehouse than to a soft-drinks plant. Most compliance pain radiates from this.
2. **The product is a controlled substance with a near-fixed, licensed retail universe.** Lion cannot freely expand its points of sale — it can only sell into a small, government-capped set of licensed outlets (≈4,500 nationally). The "distribution network" is therefore a *closed, enumerable graph*, which is good news for an AI system: the universe of legitimate customers is finite and knowable.
3. **It is effectively a single-site manufacturer with a global tail.** ~90% of volume flows through one integrated brewery at Biyagama, but ~15% of *output* is exported into a dozen-plus jurisdictions, each with its own import-label and food-safety regime. The compliance surface is "narrow but deep" domestically and "shallow but very wide" on export.

Hold these three in mind; every sub-section below is an elaboration of one of them.

---

### 1.1 Core manufacturing processes

The brewing line is a continuous-then-batch flow. Each transition below is also a **compliance/measurement checkpoint** — flagged `⟶ CHECKPOINT`.

| Stage | What physically happens | Why it matters for audit |
|---|---|---|
| **1. Raw material intake** | Malted barley, hops, brewing adjuncts, yeast, brewing water (Biyagama is used specifically for its consistent water quality), CO₂, packaging (returnable glass, cans, crowns, labels) | Supplier COAs, import permits for malt/hops (almost entirely imported), pesticide/heavy-metal limits, halal-relevant handling questions. `⟶ CHECKPOINT: goods-receipt vs PO vs COA` |
| **2. Milling & mashing** | Grain milled, mixed with hot water; enzymes convert starch to fermentable sugar (wort) | Process recipe control; allergen (gluten/barley) declaration basis |
| **3. Lautering / wort separation** | Spent grain separated from sweet wort | Spent grain is a tracked by-product (sold as animal feed → traceability + food-safety-for-feed angle) |
| **4. Boiling & hopping** | Wort boiled, hops added for bitterness/aroma; sterilised | Energy/emissions logging; recipe adherence |
| **5. Fermentation** | Cooled wort + yeast in fermentation tanks; sugars → alcohol + CO₂ over days/weeks. **This is where ABV — and therefore excise liability — is created.** | `⟶ CHECKPOINT: this stage *originates the tax base*. ABV measurement here is the single most audit-sensitive data point in the building.` |
| **6. Maturation / conditioning** | Beer matured cold to develop flavour and clarify | Tank-residence and temperature logs |
| **7. Filtration** | Yeast and haze removed; beer clarified to spec | Clarity/microbiological spec; filter integrity records |
| **8. Carbonation** | CO₂ adjusted to target volume; for canned/bottled lager | Spec conformance |
| **9. Bright-beer storage** | Finished beer held in bright tanks awaiting packaging | **Stock-in-bond reconciliation point** — beer exists but duty not yet "removed" |
| **10. Packaging — filling** | Returnable 625 ml & 330 ml glass bottles; 500 ml & 330 ml cans; kegs for on-trade. **~92% of bottles are returnable/reused** | `⟶ CHECKPOINT: fill-volume × ABV × units = duty event. Returnable-bottle float is its own reconciliation nightmare (see 1.6).` |
| **11. Labelling & coding** | Front/back labels, statutory text, batch/date coding, price marking | `⟶ CHECKPOINT: statutory label content (see 1.4)` |
| **12. Secondary packaging & palletising** | Crates / shrink-wrap / cartons, palletised | Lot integrity for recall traceability |
| **13. Warehouse → dispatch** | Finished goods to bonded FG warehouse, then released against excise permits | `⟶ CHECKPOINT: "removal from bond" = the moment duty crystallises and an excise transport permit must exist.` |

**Brewing-expert nuance a generalist misses:** the excise-relevant quantity is **litres of pure alcohol (LPA)**, not litres of beer. A 4.8% lager and an 8% stout off the same line carry very different duty per bottle. The duty is *volume-of-alcohol based* (post-2018 regime), so the AI system's "unit of truth" must be **(units packaged) × (fill volume) × (measured ABV of that specific batch)** — reconciled against what was declared to Excise. Any drift between fermentation-tank ABV, packaging-line ABV, and declared ABV is simultaneously a quality issue *and* a tax-exposure issue. This dual-purpose data point is the highest-leverage thing in the entire ontology.

---

### 1.2 Plants — how many, where, what each does

**Headline: Lion is, for practical purposes, a single-site brewer.**

| Site | Location | Role / specialisation | Status |
|---|---|---|---|
| **Biyagama main brewery** | No. 254, Colombo Road, Biyagama (Western Province, ~20–25 km E of Colombo, inside the Biyagama industrial/export-processing zone) | The entire integrated operation: brewing, fermentation, filtration, bottling, canning, kegging, warehousing, dispatch. Brews Lion (Lager, Strong, Extra Strong, Stout), Carlsberg (under licence), and the consolidated Three Coins / Millers portfolio (Three Coins Lager, Irish Dark, Grand Blonde, Sando range). | **Active — primary.** Stated capacity ~2 million hL/yr; actual production ~1.5 million hL/yr. **[EST]** Some sources cite a lower ~750k–1.1m hL working level historically; capacity has been expanded. **[VERIFY current effective capacity]** |
| **Craft / Innovation Centre** | Co-located at Biyagama | Rs ~4 bn small-batch craft facility opened **Dec 2024**; produces ~2,000 L specialty batches the main line cannot (Ella Valley White Wheat, Thambapanni Red Ale, mango/cucumber-lime infusions, Belgian blonde, Ceylon Tea beer, Coffee Stout) — **primarily for export.** | **Active — new.** Adds SKU complexity and an *export-first* compliance profile. |
| **Meegoda (ex-Millers / McCallum brewery)** | Meegoda, suburban Colombo | Former independent brewery acquired with the Millers/Three Coins portfolio (2014). | **Closed / production consolidated to Biyagama.** Treat as a historical brand source, not an operating plant. |
| **Pearl Springs (Pvt) Ltd** | Subsidiary entity | Group subsidiary (bottled water / corporate vehicle used in the Millers acquisition). | Relevant to *group* consolidation, not the beer compliance core. **[VERIFY whether any separate site/process needs to be in scope]** |

**Implication for the AI system:** because manufacturing is effectively one site, the *plant-floor data-capture problem is tractable* — you are instrumenting one brewery, not a federated multi-plant estate. The complexity does **not** live on the factory floor; it lives **downstream** (the ~4,500-outlet distribution graph, exports, and settlement) and **upstream** (imported raw-material compliance). This should heavily bias MVP scoping away from "smart factory" theatre and toward distribution/excise/export reconciliation.

---

### 1.3 Quality control & lab testing checkpoints

A brewery of Lion's scale runs an in-house QC lab plus process sensors. The compliance-relevant testing layers:

- **Incoming materials (QC gate 1):** malt, hops, adjuncts, water, CO₂, packaging. Tests: moisture, microbial load, pesticide/heavy-metal screen, packaging migration. Driven by supplier COAs that must be reconciled against actual tests.
- **In-process (QC gate 2):** wort gravity/specific gravity, pH, fermentation temperature, yeast viability/count, dissolved oxygen, **ABV trajectory**, diacetyl (off-flavour marker), microbiological cleanliness of tanks (CIP verification).
- **Finished beer / bright-beer release (QC gate 3 — the critical one):** final ABV, carbonation (CO₂ volumes), clarity/turbidity, colour (EBC), bitterness (IBU), foam stability, **microbiological sterility**, fill-volume conformance, and sensory panel sign-off. This is the gate that says "this batch may be packaged and sold."
- **Packaging-line QC (QC gate 4):** fill level, seal/crown integrity, label placement and legibility, **date/batch code presence and correctness**, torque/seam integrity for cans.
- **Stability / shelf-life monitoring:** retained samples held to verify best-before claims.
- **Water & effluent:** intake water potability + **wastewater discharge testing** (Central Environmental Authority parameters) — an environmental-compliance pillar, not just brewing QC.

**Brewing-expert nuance:** for an export-oriented craft line, *allergen and additive declarations* (e.g. lactose in a stout, fruit infusions, gluten) and *traceability of every input* become materially stricter than for the domestic mainstream lager. The new craft centre therefore raises the QC-documentation bar even though it is a tiny fraction of volume — a classic "long-tail of SKUs drives most of the compliance paperwork" pattern. The AI system will get disproportionate value from automating **QC gate 3 (release) and gate 4 (packaging code/label verification)**, because those two gates are where a quality failure converts directly into either a *recall* or an *excise/labelling violation*.

---

### 1.4 Labelling & regulatory marking requirements

Beer labels in Sri Lanka are simultaneously a **food label, a tax instrument, and a public-health-regulated object**. Required/expected elements:

- **Mandatory statutory text:** product name & type (lager/stout etc.), **ABV %**, **net volume** (e.g. 625 ml / 330 ml / 500 ml), manufacturer name & address, **batch/lot code and date marking**, ingredient/allergen basis, and **health/statutory warnings** as required under liquor advertising and public-health rules.
- **Price marking:** Excise rules require the **selling price to be indicated on each and every bottle** by the manufacturer/wholesaler, and that price must be honoured/displayed at the licensed premises. This is unusual versus generic FMCG and is an audit trip-wire.
- **Excise / anti-illicit security marking:** Sri Lanka has been progressively introducing **per-bottle security stickers/banderoles** (initially driven for arrack, with the policy direction pointing toward broader coverage) to suppress illicit liquor and protect duty. Lion must track applied security stamps against duty paid. **[VERIFY exact current banderole obligation for beer specifically — policy is moving; confirm against latest Excise notification.]**
- **Standards marking:** conformance to applicable **SLSI (Sri Lanka Standards Institution)** specifications for beer and for labelling/packaging.
- **Advertising restriction context:** alcohol advertising is heavily restricted; what may appear on-pack and in trade is constrained — relevant to brand/marketing compliance even if not strictly "label content."
- **Export labels (per destination):** each export market imposes its own mandatory label set — e.g. allergen formats, language requirements, "drink-aware"/health statements, importer-of-record details, and ingredient-naming conventions. The same beer may legally need **3–5 different label artworks** across destinations.

**Compliance-automation nuance:** label compliance is the single most *AI-tractable* domain in the building because it is **visually verifiable and rule-bound** — a vision model + a rules table can check "is the mandatory element present, legible, correctly positioned, and matched to the batch's actual ABV/price?" against the packaging-line camera feed or a sampled photo. It is also where a small slip (wrong ABV printed, missing warning, wrong price) creates *both* a regulatory violation *and* a tax discrepancy. High priority, high confidence.

---

### 1.5 Distribution chain & point-of-sale universe

Lion's route-to-market splits into **off-trade (take-away)**, **on-trade (consumed on premises)**, and **export**.

**The national licensed-outlet universe (the closed graph Lion sells into):**

- Sri Lanka had **just over ~4,500 total liquor licences nationally** as of early 2025, spanning retail wine stores *and* on-premise consumption points (bars, restaurants, hotels, clubs).
- Of these, roughly **~1,500 are licensed retail liquor vendors ("wine stores," FL 4 / FL 22 category)**; the remainder are on-trade (hotels, bars, restaurants, clubs).
- New licences are **tightly capped and politically sensitive** — only ~361 new licences were issued across *all* categories in 2024 (a parliamentary controversy), of which 172 were FL 4 wine-store retail. For decades the retail count barely moved.

**The relevant Excise licence categories (the legal "node types" in the distribution graph):**

| Licence | Meaning | Relevance to Lion |
|---|---|---|
| **FL 1** | Licence to *manufacture* malt liquor | **Lion's own manufacturing licence** |
| **FL 6** | Beer & Porter licence | Beer-specific trade |
| **FL 3** | Wholesale licence | Lion's distributors/wholesale layer |
| **FL 4** | Retail licence ("wine store") | Off-trade retail node |
| **FL 22** | Beer/Ale/Stout & Wine retail sale | Beer-skewed retail node |
| **FL 7 / FL 8** | Hotel / Hotel-bar | On-trade hospitality node |
| **FL 11 / FL 13A** | Restaurant / Club | On-trade node |

**Lion's served base:** historically reported at **~2,800 active outlets, ~70% off-trade / ~30% on-trade. [EST — from an older equity report; the real current figure must be pulled from Lion's distributor master data and is a key Section 9 data gap.]** Given the national universe is ~4,500 licensed points and Lion holds ~90% beer share, Lion almost certainly *touches the large majority* of all active liquor-selling premises in the country.

**Channels in practice:**
1. **Domestic off-trade (retail / wine stores):** the volume backbone; returnable-bottle ecosystem; cash-heavy.
2. **Domestic on-trade (HORECA — hotels, bars, restaurants, clubs):** kegs + packaged; tourism-linked; more credit-based; concentrated in Colombo, coastal/tourist belts, hill country.
3. **Imported-brand distribution arm:** Lion is the **sole importer/distributor of Diageo (Guinness, Johnnie Walker, Smirnoff, J&B) and Moët Hennessy (Hennessy, Moët, Dom Pérignon)** brands, plus Corona distribution rights. This bolts an **import/customs-duty compliance surface** onto the company that is separate from its own brewing.
4. **Export (~15% of output, target 20%):** Maldives (long-standing, large share of exports), plus Africa, South Asia, West Asia; historically Japan (first export, 1988), UK, Australia. The new craft range is export-first.

**Why this matters for AI:** the distribution graph is **finite, licensed, and enumerable** — every legitimate node has an Excise licence number. That makes it possible to build a *canonical outlet master* keyed on licence number and to flag any sale/dispatch to a node whose licence is expired, suspended, or non-existent (a real risk — licences get suspended for tax arrears). This is a high-value, very feasible AI/data use case.

---

### 1.6 Settlement across channels — payment modes & audit risk

Settlement in Sri Lankan alcohol distribution is a **mix**, and each mode injects a distinct audit risk. (Exact mix is proprietary to Lion — **[VERIFY against finance data]** — but the structural risks are well understood.)

| Channel | Typical settlement | Primary audit / compliance risk |
|---|---|---|
| **Off-trade wholesale & retail** | Largely **cash** and **prepaid / cash-on-delivery**; some bank transfer | Cash is the classic *revenue-leakage and reconciliation* risk: harder to tie a dispatch to a confirmed receipt; creates room for unrecorded or under-recorded movement; reconciliation of cash collected vs goods dispatched vs duty paid is labour-intensive. |
| **On-trade (HORECA)** | More **credit** (30–60 day terms), some digital | **Credit risk + ageing receivables**; also greater chance of *diversion* (product meant for one licensed premise resold elsewhere). |
| **Distributor / wholesale layer** | Mix of **bank transfer, credit limits, deposits** | Reconciling distributor stock, returns, and the **returnable-bottle deposit float** (see below). |
| **Imported-brand arm** | Bank-based, import-linked | Customs duty + import documentation reconciliation. |
| **Export** | **Bank / Letter of Credit / advance**, in foreign currency | Foreign-exchange repatriation rules (Central Bank), export-proceeds reconciliation, and document-vs-payment matching. |

**Two settlement-specific audit traps unique to beer:**

1. **Returnable-bottle deposit accounting (~92% of bottles are reused).** Lion runs a vast *empties* float — deposits charged out and refunded as bottles return. This is a perpetual reconciliation between bottles shipped, bottles returned, breakage, and deposit liability. It is a notorious source of "ghost" stock and reconciliation drift, and it sits at the seam between operations and finance.
2. **Excise duty is paid to the State on "removal from bond," not on customer payment.** So Lion can owe (and must pre-fund) duty on beer that has left the brewery but not yet been paid for by the trade. The mismatch between *duty-paid timing* and *cash-collected timing* is a structural working-capital and reconciliation exposure. The Excise Department can — and does — **suspend manufacturing/distribution licences for unsettled duty**, so this reconciliation is existential, not cosmetic.

**Why this matters for AI:** the highest-confidence financial-integrity wins are in **three-way reconciliation** — (dispatch/goods-issued) ↔ (excise duty declared & paid) ↔ (cash/credit settled). An AI layer that continuously matches these and flags breaks (especially cash-channel gaps and bottle-deposit drift) attacks the CTO's "consuming too much time" pain directly.

---

### 1.7 Cold chain & logistics compliance

Beer is **not** as cold-chain-critical as dairy, but it is **freshness- and condition-sensitive**, and the *logistics movement itself is legally controlled*:

- **Product condition:** beer (especially unpasteurised/craft and kegged product) degrades with heat and light. Warehousing and transit temperature, and avoidance of light exposure, affect shelf-life claims (the "best before" the label commits to). Sri Lanka's tropical ambient heat makes this a real, year-round QC factor rather than a seasonal one.
- **Legal transport control (the bigger compliance item):** every movement of liquor between bonded points and out to trade requires a valid **Excise transport permit**; possession/transport beyond set limits without a permit is an offence. So logistics compliance is less "cold chain" and more "**permit chain**" — the documentary right to move the goods.
- **Returnable-empties reverse logistics:** the empties float (1.6) is itself a logistics + reconciliation system running in the opposite direction.
- **Export logistics:** containerisation, temperature/condition in long ocean transit, destination cold-chain handoff, plus export documentation (certificates of origin, health/free-sale certificates, destination import permits).
- **Spent-grain & by-product movement:** spent grain to animal-feed buyers carries food-safety-for-feed traceability.

**Nuance:** for an AI compliance system, the *permit chain* (right-to-move documentation) is far more audit-relevant and far more automatable than thermal cold-chain telemetry. IoT temperature logging is a "nice to have" QC enhancement; **permit/movement reconciliation is a core compliance need.** Don't let a generic "cold chain IoT" framing crowd out the permit-chain priority.

---

### 1.8 People, roles & accountability structures for compliance

Compliance ownership at Lion is distributed across operations, quality, finance, regulatory affairs, and the executive — with the **Excise Department physically embedded** as an external supervisory presence. The likely accountability map:

| Role / function | Compliance accountability |
|---|---|
| **Board / MD / CEO** (CEO: R.H. (Rajiv) Meewakkala; Chairman: Amal Cabraal) | Ultimate accountability for licence integrity, listed-company governance (CSE), and group risk. A suspended manufacturing licence is a board-level/going-concern event. |
| **CTO / Technology leadership** (the sponsor) | Owns the mandate to automate; today bears the *time-cost* of compliance being manual and people-heavy. |
| **Brewing / Operations / Plant management** | Process adherence, batch records, in-bond stock accuracy, the LPA/ABV figures that feed excise. |
| **Quality / QA-QC management** | The QC gates (1.3), SLSI conformance, release sign-off, recall traceability, supplier COA control, lab data integrity. |
| **Compliance / Regulatory Affairs** | Licence renewals (FL 1 etc.), label conformance, liaison with SLSI / public-health / environmental authorities, export-market dossiers. |
| **Finance / Excise / Tax team** | The big one operationally: **excise duty computation, declaration, payment and reconciliation**; VAT; returnable-deposit accounting; export-proceeds and FX compliance; tax-clearance for licence renewals. |
| **Supply chain / Logistics / Warehouse** | Excise transport permits, dispatch-vs-bond reconciliation, empties reverse logistics, export shipping docs. |
| **Distributor / Sales network** | Selling only into valid licensed outlets; settlement discipline; trade-level stock and price-marking compliance. |
| **EHS / Sustainability** | Effluent/discharge (CEA), emissions, returnable-glass and packaging sustainability reporting (also feeds CSE/ESG disclosure). |
| **Internal Audit / Risk** | Periodic verification across all the above; the function the AI is partly meant to augment. |
| **EXTERNAL — Excise Department officers** | **Physically supervise the bonded brewery**; verify production, removals and duty. Their records and Lion's must agree. |
| **EXTERNAL — SLSI, public-health (MoPHA/FDA function), CEA, Customs, Central Bank, BOI (zone), destination regulators** | Standards, food-safety, environmental, import/export, FX and zone-incentive oversight respectively. |

**Organisational nuance that shapes UX (preview of Section 4/8):** the people who *generate* the source data (plant-floor operators, lab technicians, warehouse/dispatch clerks, distributor reps) are **not** the people who *suffer the audit pain* (Finance/Excise team, Compliance officer, CTO). An AI system that demands more data-entry effort from the floor to relieve pain at the top will fail on adoption. The ontology therefore implies a design constraint: **capture data passively/at-source (line sensors, OCR of permits/labels, ERP/LIMS extraction) rather than asking the floor to type more.**

---

### Cross-cutting "units of truth" the AI system must anchor on

If the product team takes one thing from this ontology, it is the small set of canonical entities everything else reconciles against:

1. **Batch** → carries measured ABV, volume, QC release status, label artwork, date code. *Origin of both quality and tax facts.*
2. **Litres of Pure Alcohol (LPA) per removal** → the excise tax base. The number Lion and the Excise Department must agree on.
3. **Excise transport permit** → the legal right-to-move; pairs every dispatch.
4. **Licensed outlet (by Excise licence number)** → the only legitimate destination node; has a validity state (active/suspended/expired).
5. **Returnable-bottle deposit position** → the perpetual empties reconciliation.
6. **Export consignment dossier** → per-destination label + documentation bundle.

These six entities, and the reconciliations *between* them, are the spine of any AI audit/compliance solution for Lion.

---

## Sources & confidence notes

Company/plant facts (Biyagama single-site structure; ~2 m hL capacity / ~1.5 m hL production; craft innovation centre Dec 2024; Meegoda/Millers closure & brand consolidation; returnable-bottle ~92%; export ~15% with 20% target; brand portfolio; Diageo/Moët distribution): Lion Brewery press/EDB profile, VLB Berlin, Sunday Times (Dec 2024), Adaderana, Wikipedia (*Lion Brewery (Sri Lanka)*, *Three Coins Beer*, *Beer in Sri Lanka*), Oxford Companion to Beer.

Market share ~90% (range 82–90% across sources): *Beer in Sri Lanka* / Lion equity coverage. **[Confidence: MEDIUM — sources span 82% to 90%; treat ~90% as Lion's own positioning, ~80%+ as conservative.]**

Excise mechanics (alcohol-volume duty since 2018; ~Rs 2,400/L alcohol for beer pre-hikes; 20% hike Jan 2023; VAT 15→18% Jan 2024; further Jan 2025 hike; Excise Dept collects on behalf of State; licence suspension for tax arrears; per-bottle price marking; mandatory book-keeping; transport permits): Sri Lanka Excise Department (license list & FAQ pages), Drinks Business, EconomyNext, Movendi International, lankanewsweb.

National outlet universe (~4,500 total licences early 2025; ~1,500 retail wine stores; ~3,500 renewed; 361 new licences in 2024 incl. 172 FL 4): Daily Mirror (Jan 2025), Sri Lanka Mirror / Times Online / Newswire (Dec 2024).

**Key figures to verify with Lion directly before MVP scoping (carried into Section 9):**
- Current effective brewing capacity & utilisation **[VERIFY]**
- Exact current count and on/off-trade split of served outlets (the ~2,800 figure is from older equity research) **[VERIFY]**
- Current settlement mix by channel (cash/credit/digital %) **[VERIFY]**
- Exact current beer banderole/security-sticker obligation **[VERIFY]**
- Latest revenue (LKR ~58.5 bn was FY2022; the brief's "~$500 m" appears high versus ~€350 m / ~LKR figures — reconcile fiscal year and FX) **[VERIFY]**
- Scope of Pearl Springs and any non-Biyagama sites **[VERIFY]**

*End of Section 1. Sections 2–9 not generated, per brief.*
