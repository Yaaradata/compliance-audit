# System Capabilities & Data Model
## AI-Powered Audit & Compliance Solution — Lion Brewery (Ceylon) PLC

**Builds on:** Stage 0 (Foundational Understanding) + Stage 1 (Persona Definition)
**Audience:** product managers (write user stories from Part 1) and backend/data engineers (write schema from Part 2)
**Grounding systems (from Stage 0/1):** SAP (production, inventory, dispatch, finance), Excise portal + resident Excise Unit register, **Fool Proof Sticker portal**, **FL licence register**, **ASYCUDA** (Sri Lanka Customs), LIMS (**status: OPEN — not yet implemented; ingestion must tolerate instrument exports + Excel + paper**), DMS, bank/CBSL feeds, line/IoT counters.

**Persona key:** **P1** CTO/Tech Leadership · **P2** Excise Compliance Officer/Finance Lead · **P3** QA Manager/Head of Quality · **P4** Distribution/Sales Ops Manager · **P5** Regulatory Affairs/Export Compliance · *(EHS = Stage 0 P8/P9 function owner; not a Stage 1 persona — flagged where used.)*

> All duty rates, figures and sample values below are **illustrative / config-driven** (see **C36**) and carry the **[VERIFY]** items from Stage 0/1 (POS count, ~Rs 64.8 bn liability, SAP/LIMS maturity). This is an architecture document, not legal/tax advice.

---

# PART 1 — SYSTEM CAPABILITIES

*Columns: ID · Capability · What it does (one behaviour) · Persona served · Pain resolved (Stage 0) · Trigger · Output · AI role · Human-in-the-loop · Priority.*

## Production & Batch Compliance

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C1 | Batch genealogy assembly | Assembles a single batch's full record (inputs, process, QC, packaging, label, sticker, release) on one view | P3, P1 | Batch-evidence "archaeology" across LIMS/paper (F3) | User action / inspection | Batch dossier view | Reconciliation / generation | View only; no decision | Phase 2 |
| C2 | Authoritative ABV registry | Stores one signed ABV per batch and propagates it to excise + label + spec | P3, P2, P5 | ABV triple-dependency errors | Batch release | Canonical ABV record | Classification / reconciliation | QA confirms ABV at release | **MVP** |
| C3 | Pre-release spec-breach detection | Flags any QC parameter outside SLS/internal spec before release sign-off | P3 | Out-of-spec release risk | QC result posted | Pre-release alert | Detection | QA decides release | Phase 2 |
| C4 | Batch release workflow + e-sign | Gates packaging/sale on a completeness check and a QA electronic signature | P3 | Release sign-off is manual/unevidenced | Batch ready | Release record / hold | Classification | **QA signs release (safety+legal)** | Phase 2 |
| C5 | First-time-right tracking | Computes and trends batch FTR; flags rework/waste drivers | P3, P1 | Rework/waste invisible | Batch outcome | Dashboard metric | Prediction / detection | Analyst review | Phase 3 |

## Excise & Duty Management

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C6 | Live duty-position engine | Computes duty owed in near-real-time from removals × LPA × current rate | P2, P1 | Duty position only known after manual close | Removal event | Live duty figure | Reconciliation / generation | Finance reviews | **MVP** |
| C7 | Three-way excise reconciliation | Continuously matches SAP removals ↔ resident Excise register ↔ duty paid; flags breaks | P2 | Manual, after-the-fact 3-way recon (F1) | Removal / daily | Reconciliation exception queue | Reconciliation / detection | Finance investigates break | **MVP** |
| C8 | Auto-draft excise return + workpaper | Generates the monthly duty return with a line-traceable workpaper | P2 | Manual return assembly in Excel (F1/F7) | Month-end / schedule | Draft return + workpaper | Generation | **Finance signs declaration** | **MVP** |
| C9 | Declared-vs-actual drift detection | Flags divergence between declared duty basis and measured ABV/volume | P2, P3 | ABV/volume drift = tax exposure | Declaration vs batch data | Drift alert | Detection | Finance/QA reconcile | Phase 2 |
| C10 | Duty-on-removal vs cash-collected tracker | Surfaces the working-capital gap between pre-funded duty and trade receipts | P2 | Removal-vs-collection timing mismatch | Removal + AR update | Cash-timing view | Reconciliation | Finance decision | Phase 3 |

## Labeling & Regulatory Marking

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C11 | Fool Proof Sticker reconciliation | Reconciles stickers ordered (portal) ↔ applied (line) ↔ scrapped/voided ↔ duty-paid units, at serial/range level | P2 | Manual sticker count (F2) | Order / line scan / daily | Sticker variance report | Reconciliation / detection | Finance + Excise officer verify | **MVP** |
| C12 | Label artwork registry (SKU × market) | Maintains the single current legal artwork per SKU per destination market | P5 | Per-market artwork drift (F4) | Artwork approval | Versioned artwork registry | Classification | Reg/legal approves artwork | Phase 2 |
| C13 | On-pack label verification (vision) | Checks a packaged label image vs rules + that batch's ABV/price/sticker | P3, P5 | Wrong on-pack element → recall (F4) | Packaging / sample image | Pass/fail with reasons | Detection / classification | Reg sign-off on novel claims | Phase 2 |
| C14 | Price-marking compliance check | Verifies the mandated selling price is present/correct on pack | P5, P2 | Price-on-bottle rule breaches | Label check / price change | Compliance flag | Detection | Reg confirms | Phase 2 |

## Distribution & POS Licence Management

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C15 | Canonical outlet master (FL-keyed) | Maintains an outlet master keyed on FL licence number with live validity status | P4 | Outlet master not keyed to licence (F6) | Sync w/ FL register | Outlet master | Reconciliation | Data steward resolves conflicts | Phase 2 |
| C16 | Pre-dispatch outlet-validity check | Returns go/amber/hold per load based on destination licence validity | P4 | Manual outlet validation; ship-to-suspended risk (F6) | Dispatch order | Go/hold decision | Detection / classification | Ops overrides with reason | Phase 2 |
| C17 | Transport-permit generation/check | Ensures a valid Excise transport permit accompanies each load | P4 | Paper permits / seizure risk | Dispatch order | Permit / block | Generation / detection | Ops confirms | Phase 2 |
| C18 | Diversion / volume anomaly detection | Flags abnormal volume patterns to an outlet for review | P4 | Diversion liability | Dispatch pattern | Anomaly flag (review, not auto-block) | Detection / prediction | Ops/compliance review | Phase 3 |
| C19 | Returnable-deposit float reconciliation | Reconciles bottles shipped vs returned vs broken vs deposit liability | P4, P2 | Empties/deposit drift (F10) | Dispatch/return event | Deposit variance report | Reconciliation | Finance validates | Phase 3 |

## Export Compliance

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C20 | Dossier completeness check | Verifies all required docs are present/valid per destination before shipment | P5 | Manual per-consignment dossier check (F9) | Shipment created | Completeness score + gaps | Classification / detection | Reg clears shipment | Phase 2 |
| C21 | Destination label-conformity check | Confirms artwork matches the destination market's rules pre-ship | P5 | Container held for label error | Pre-ship | Conformity flag | Detection / classification | Reg sign-off | Phase 2 |
| C22 | ASYCUDA entry reconciliation | Matches export declaration (ASYCUDA) lines to shipment/batch data | P5 | Customs entry mismatch | CusDec lodged | Reconciliation exception | Reconciliation | Broker/reg confirm | Phase 3 |
| C23 | FX-repatriation deadline tracking | Tracks export-proceeds receipt vs CBSL repatriation timeline | P5, P2 | Manual FX-timeline tracking | Shipment / bank event | FX deadline alert | Detection | Finance acts | Phase 3 |

## Quality & Lab Management

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C24 | Lab/instrument data ingestion | Ingests QC results from LIMS (when live), instrument exports, Excel and OCR'd paper | P3 | Lab data fragmentation (F3); LIMS OPEN | Result posted/imported | Structured QC results | Classification / generation (OCR) | Lab tech validates OCR'd values | Phase 2 |
| C25 | COA auto-reconciliation | Matches incoming-material COAs to spec and goods-receipt | P3 | Manual COA reconciliation | COA received | COA match/exception | Reconciliation / detection | QA reviews exceptions | Phase 2 |
| C26 | HACCP evidence-chain assembly | Compiles CCP/HACCP records into an inspection-ready chain per batch/period | P3 | HACCP records scattered | Inspection / schedule | HACCP evidence pack | Generation | QA validates | Phase 3 |

## Environmental & EHS

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C27 | Effluent/EPL cadence + limit tracking | Tracks effluent sampling cadence vs EPL conditions and results vs limits | EHS fn; P1 | Sampling-vs-deadline tracking manual (F8) | Test result / schedule | Sampling/limit alert | Detection | EHS interprets exceedance | Phase 3 |
| C28 | OHS / pressure-vessel inspection registry | Tracks statutory inspection dates for boilers/CO₂/ammonia assets | EHS fn | Overdue inspections scattered | Schedule / cert OCR | Overdue-inspection alert | Detection / classification | EHS/competent person inspects | Phase 3 |

## Audit Readiness & Evidence Management

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C29 | On-demand evidence-pack generation | Produces a domain evidence pack (excise/QC/export/dispatch) on request | P2, P3, P5, P1 | Unannounced inspector fire-drill | User action / reg visit | Evidence pack (PDF/bundle) | Generation | Owner reviews before release | **MVP (excise pack)** / Phase 2 (others) |
| C30 | Immutable audit log | Records every flag, computation, document and decision with source lineage | All | No traceable evidence trail | Any system event | Append-only log | — (system of record) | Auditor reads | **MVP** |
| C31 | Compliance-finding / CAPA tracker | Logs findings (internal/regulator) and tracks remediation to closure | P5, P1 | Findings tracked informally | Finding raised | Finding + CAPA status | Classification | Owner remediates | Phase 3 |

## Governance & Reporting

| ID | Capability | What it does | Persona | Pain resolved | Trigger | Output | AI role | Human in loop | Pri |
|---|---|---|---|---|---|---|---|---|---|
| C32 | Compliance-posture dashboard | Aggregates all pillars into a live "are we compliant now?" view | P1 | No single source of truth | Continuous | Posture dashboard | Reconciliation / generation | Exec reads | **MVP (thin)** |
| C33 | ROI metrics (hours-saved / risk) | Tracks human-hours saved and open-risk trend over time | P1 | No ROI proof for the board | Continuous / month-end | ROI metric set | Generation | Exec interprets | Phase 2 |
| C34 | Deadline radar | Surfaces upcoming licence/permit/return/sampling/FX deadlines with lead time | P5, P2, P1 | Renewal deadlines in spreadsheets (F5) | Schedule | Deadline list + alerts | Detection | Owner acts | **MVP** |
| C35 | Severity-tiered alert routing | Classifies and routes alerts (board / owner / info) by severity | All | Alert noise; wrong-person routing | Any flag | Routed alert | Classification | Recipient acts | **MVP** |
| C36 | Regulatory-config management | Holds versioned duty tables, label rules, thresholds so rules aren't hard-coded | P2, P5 | Near-annual duty hikes / changing rules | Reg change | Config version | — (curated) + change detection | Compliance approves config | **MVP** |

**MVP capability set (traceable to priority persona P2 + sponsor P1):** C2, C6, C7, C8, C11, C29(excise), C30, C32(thin), C34, C35, C36.

---

# PART 2 — DATA MODEL

## STEP 2A — ENTITIES

*Field notation: `field — type — source`. Sources: SAP, LIMS(OPEN), Excise portal/register, Sticker portal, FL register, ASYCUDA, bank/CBSL, IoT/line, DMS, manual, system.*

### PRODUCT_SKU
- **Description:** A sellable product/pack configuration (e.g. Lion Lager 625 ml returnable bottle), with target ABV and the market(s) it's sold into.
- **Key fields:** `sku_id — UUID — system` · `brand — string — SAP` · `pack_type — enum{bottle_625,bottle_330,can_500,can_330,keg} — SAP` · `target_abv_pct — decimal — SAP` · `beer_class — enum{<5%,≥5%} — SAP` · `markets[] — array<country_code> — manual` · `returnable — bool — SAP`
- **Relationships:** has many `Batch`; has many `Label_Version`.
- **Compliance hook:** C2, C12, C13, C14.

### PRODUCTION_RUN
- **Description:** A brew/production run on the Biyagama line that yields one or more batches.
- **Key fields:** `run_id — UUID — SAP` · `process_order_no — string — SAP` · `line_id — string — SAP/IoT` · `start_ts/end_ts — datetime — SAP/IoT` · `planned_volume_hl — decimal — SAP` · `actual_volume_hl — decimal — IoT/SAP`
- **Relationships:** produces many `Batch`.
- **Compliance hook:** C1, C5, C6.

### BATCH
- **Description:** A discrete lot of finished beer — the central "unit of truth." Maps to a real batch/lot sheet + SAP batch.
- **Key fields:** `batch_id — string(coded) — SAP` · `sku_id — FK — SAP` · `run_id — FK — SAP` · `brew_date — date — SAP` · `packaged_volume_l — decimal — SAP/IoT` · `units_packaged — int — SAP/line` · `measured_abv_pct — decimal — LIMS(OPEN)/manual` · `lpa — decimal — derived` · `date_code — string — line` · `release_status — enum{pending,released,held,rejected} — system` · `released_by — FK(User) — system` · `released_ts — datetime — system`
- **Relationships:** belongs to `Production_Run`/`Product_SKU`; has many `QC_Test_Result`; has one canonical `ABV` (via measured_abv); consumes many `Material_Lot`; contributes to `Removal_Event`; carries `Fool_Proof_Sticker` ranges.
- **Compliance hook:** C1, C2, C3, C4, C6, C9, C11, C13, C29.

### QC_TEST_RESULT
- **Description:** One lab/instrument/sensory measurement at a QC gate (incoming, in-process, release).
- **Key fields:** `result_id — UUID — system` · `batch_id — FK — LIMS/manual` · `material_lot_id — FK(nullable) — LIMS` · `gate — enum{incoming,in_process,release,stability} — LIMS` · `parameter — enum{abv,gravity,ph,co2,turbidity,ebc,ibu,micro,fill_volume,sensory} — LIMS` · `value — decimal/string — LIMS/instrument/OCR` · `unit — string — LIMS` · `spec_min/spec_max — decimal — config(C36)` · `pass — bool — derived` · `tested_ts — datetime — LIMS` · `source — enum{lims,instrument,excel,paper_ocr} — system`
- **Relationships:** belongs to `Batch` (or `Material_Lot`).
- **Compliance hook:** C2, C3, C24, C26.

### MATERIAL_LOT & SUPPLIER_COA
- **Description:** An incoming raw-material lot (malt/hops/adjunct/CO₂/packaging) and its certificate of analysis.
- **Key fields (lot):** `lot_id — UUID — SAP` · `material_type — enum — SAP` · `supplier_id — FK — SAP` · `gr_no — string — SAP` · `qty/unit — decimal — SAP` · `coa_doc_id — FK(Document) — DMS`
- **Key fields (COA):** `coa_id — UUID — system` · `doc_id — FK — DMS` · `parsed_params — json — OCR` · `match_status — enum{matched,exception} — derived`
- **Relationships:** consumed by `Batch`; COA matched to spec.
- **Compliance hook:** C25, C1, C26.

### REMOVAL_EVENT
- **Description:** A "removal from bond" / gate-pass event — the moment duty crystallises. Maps to the excise gate pass.
- **Key fields:** `removal_id — UUID — SAP/Excise` · `batch_id — FK — SAP` · `units_removed — int — SAP` · `volume_l — decimal — SAP` · `lpa_removed — decimal — derived` · `removal_ts — datetime — SAP` · `transport_permit_id — FK — Excise portal` · `excise_register_ref — string — Excise register(manual)`
- **Relationships:** references `Batch`, `Transport_Permit`; rolled into `Excise_Declaration`.
- **Compliance hook:** C6, C7, C10, C17.

### EXCISE_DECLARATION
- **Description:** The periodic duty declaration filed to the Excise Department.
- **Key fields:** `declaration_id — UUID — system` · `period — month — system` · `total_lpa — decimal — derived` · `duty_rate_applied — decimal — config(C36)` · `duty_amount — decimal — derived` · `removals[] — FK[] — SAP/Excise` · `status — enum{draft,signed,filed,accepted,queried} — system` · `signed_by — FK(User) — system` · `excise_portal_ref — string — Excise portal`
- **Relationships:** aggregates many `Removal_Event`; links to `Fool_Proof_Sticker_Inventory` consumption.
- **Compliance hook:** C6, C7, C8, C9.

### FOOL_PROOF_STICKER_INVENTORY
- **Description:** Excise security-sticker stock and lifecycle (ordered via portal → applied on line → scrapped/voided).
- **Key fields:** `sticker_batch_id — UUID — Sticker portal` · `serial_range_start/end — string — Sticker portal` · `qty_ordered — int — Sticker portal` · `qty_applied — int — line/IoT` · `qty_voided — int — manual` · `applied_to_batch_id — FK — line` · `status — enum{ordered,received,applied,voided,reconciled} — system`
- **Relationships:** applied to `Batch`; reconciled against `Removal_Event`/`Excise_Declaration`.
- **Compliance hook:** C11.

### TRANSPORT_PERMIT
- **Description:** The Excise permit authorising movement of a load. Maps to the paper/portal transport permit.
- **Key fields:** `permit_id — UUID — Excise portal` · `permit_no — string — Excise portal` · `dispatch_order_id — FK — SAP` · `origin/destination — string — SAP` · `valid_from/to — datetime — Excise portal` · `status — enum{valid,expired,used,void} — system`
- **Relationships:** accompanies `Dispatch_Order` / `Removal_Event`.
- **Compliance hook:** C17, C7, C16.

### DISPATCH_ORDER
- **Description:** A domestic outbound load to a trade outlet.
- **Key fields:** `dispatch_id — UUID — SAP` · `customer_licence_id — FK — SAP/FL register` · `skus[] — json — SAP` · `units — int — SAP` · `dispatch_ts — datetime — SAP` · `permit_id — FK — Excise portal` · `validity_decision — enum{go,amber,hold} — derived` · `settlement_mode — enum{cash,credit,transfer} — SAP`
- **Relationships:** ships to `Customer_Licence`; carries `Transport_Permit`; draws from `Batch`.
- **Compliance hook:** C16, C17, C18, C19.

### LABEL_VERSION
- **Description:** A specific approved label artwork for a SKU in a market. Maps to the approved artwork file.
- **Key fields:** `label_id — UUID — system` · `sku_id — FK — SAP` · `market — country_code — manual` · `version — semver — system` · `artwork_doc_id — FK(Document) — DMS` · `mandatory_elements — json{abv,volume,price,warnings,sticker_zone} — config(C36)` · `effective_from — date — manual` · `status — enum{draft,approved,retired} — system`
- **Relationships:** belongs to `Product_SKU`; verified against `Batch` at packaging.
- **Compliance hook:** C12, C13, C14, C21.

### CUSTOMER_LICENCE (FL category)
- **Description:** A trade outlet's Excise licence (the legitimate destination node). Maps to a record in the FL licence register.
- **Key fields:** `customer_licence_id — UUID — system` · `fl_no — string — FL register` · `fl_category — enum{FL3,FL4,FL6,FL7,FL8,FL11,FL13A,FL22} — FL register` · `holder_name — string — FL register` · `address/district — string — FL register` · `valid_from/to — date — FL register` · `status — enum{active,suspended,expired} — FL register` · `last_synced_ts — datetime — system`
- **Relationships:** receives `Dispatch_Order`.
- **Compliance hook:** C15, C16, C18.

### EXPORT_SHIPMENT
- **Description:** An outbound export consignment. Maps to the FCAU export chain record.
- **Key fields:** `shipment_id — UUID — system` · `destination_country — code — manual` · `incoterm — enum — manual` · `skus[] — json — SAP` · `units/volume — decimal — SAP` · `asycuda_cusdec_no — string — ASYCUDA` · `bl_no — string — manual` · `fx_expected/received — decimal — bank/CBSL` · `fx_due_date — date — derived` · `status — enum{planned,docs_pending,cleared,shipped,proceeds_pending,closed} — system`
- **Relationships:** has one `Export_Document_Bundle`; draws from `Batch`; links `Label_Version` per destination.
- **Compliance hook:** C20, C21, C22, C23.

### EXPORT_DOCUMENT_BUNDLE
- **Description:** The set of required documents for one export shipment, with present/valid status.
- **Key fields:** `bundle_id — UUID — system` · `shipment_id — FK — system` · `required_docs — json[{doc_type,required,present,valid,doc_id}] — config(C36)+DMS` · `completeness_score — decimal — derived` · `gaps[] — array — derived`
- **Relationships:** belongs to `Export_Shipment`; references `Document`.
- **Compliance hook:** C20, C29.

### EPL_LICENCE & EFFLUENT_TEST  *(EHS)*
- **Description:** The site Environmental Protection Licence and effluent test results.
- **Key fields:** `epl_id — UUID — manual/DMS` · `valid_to — date — manual` · `parameters_limits — json — config` · `test_id — UUID — lab` · `parameter/value/limit — decimal — lab` · `sampling_due — date — derived`
- **Relationships:** tests evaluated vs EPL limits.
- **Compliance hook:** C27.

### COMPLIANCE_FINDING
- **Description:** A finding raised internally or by a regulator, with remediation (CAPA). Maps to an inspection report / audit finding.
- **Key fields:** `finding_id — UUID — system` · `source — enum{internal,excise,slsi,customs,nata,cea,labour} — manual` · `pillar — enum — system` · `severity — enum{low,med,high,critical} — classification` · `description — text — manual` · `linked_entity — polymorphic FK — system` · `capa_status — enum{open,in_progress,closed} — system` · `due_date — date — manual`
- **Relationships:** links to any entity; tracked in `Audit_Event`.
- **Compliance hook:** C31, C29.

### EVIDENCE_PACK
- **Description:** A generated, point-in-time bundle of records answering an audit/inspection request. Maps to the binder handed to an auditor.
- **Key fields:** `pack_id — UUID — system` · `domain — enum{excise,qc,export,dispatch,environment,board} — system` · `scope_ref — json — system` · `generated_ts — datetime — system` · `generated_by — FK(User) — system` · `contents[] — FK[](Document/records) — system` · `hash — string — system`
- **Relationships:** references many records; logged in `Audit_Event`.
- **Compliance hook:** C29.

### AUDIT_EVENT
- **Description:** Append-only log entry for every system action, flag, computation, and human decision (source of traceability).
- **Key fields:** `event_id — UUID — system` · `event_type — enum{compute,flag,view,edit,sign,generate,override} — system` · `actor — FK(User/system) — system` · `entity_ref — polymorphic FK — system` · `before/after — json — system` · `source_lineage — json — system` · `ts — datetime — system`
- **Relationships:** references any entity.
- **Compliance hook:** C30 (and underpins all).

### REGULATORY_ACTOR
- **Description:** A regulator/authority Lion interacts with. Reference data driving routing, deadlines, document requirements.
- **Key fields:** `actor_id — UUID — system` · `name — enum{Excise Dept,SLSI,MoH/PHI,NATA,CEA,Customs,CBSL,BOI,dest_regulator} — manual` · `jurisdiction — string — manual` · `obligations[] — json — config(C36)`
- **Relationships:** linked to `Compliance_Finding`, `Document` requirements, deadlines.
- **Compliance hook:** C20, C31, C34, C36.

### DOCUMENT & USER/ROLE *(supporting)*
- **Document:** `doc_id, type, uri(DMS), ocr_json, hash` — every COA, permit, licence, cert, artwork. Hook: C13, C20, C24, C29.
- **User/Role:** `user_id, role(P1–P5/EHS/admin), language(en/si/ta)` — drives role-based views + HITL signatures. Hook: C4, C8, C30, C35.

---

## STEP 2B — RELATIONSHIPS (plain-text ER map)

```
Product_SKU            → has many      → Batch
Product_SKU            → has many      → Label_Version
Production_Run         → produces many → Batch
Batch                  → has many      → QC_Test_Result
Batch                  → consumes many → Material_Lot
Material_Lot           → has one       → Supplier_COA
Batch                  → has one       → measured_ABV (canonical, on Batch)
Batch                  → applied with  → Fool_Proof_Sticker_Inventory (serial range)
Batch                  → generates many→ Removal_Event
Removal_Event          → accompanied by→ Transport_Permit
Removal_Event          → rolled into   → Excise_Declaration
Excise_Declaration     → consumes      → Fool_Proof_Sticker_Inventory (count basis)
Dispatch_Order         → ships to      → Customer_Licence
Dispatch_Order         → carries       → Transport_Permit
Dispatch_Order         → draws from    → Batch
Batch                  → verified vs   → Label_Version (at packaging)
Export_Shipment        → draws from    → Batch
Export_Shipment        → has one       → Export_Document_Bundle
Export_Shipment        → uses          → Label_Version (per destination market)
Export_Document_Bundle → references many→ Document
EPL_Licence            → evaluated by  → Effluent_Test
Compliance_Finding     → links to      → any entity (polymorphic)
Compliance_Finding     → raised by     → Regulatory_Actor
Evidence_Pack          → references many→ Batch / Excise_Declaration / Export_Shipment / Document
Audit_Event            → references    → any entity (polymorphic, append-only)
Regulatory_Actor       → defines       → required docs / deadlines (via config)
User                   → signs / acts on→ Batch (release), Excise_Declaration (file)
```

---

## STEP 2C — DERIVED METRICS & FORMULAS

| Metric | Formula | Entities used | Capability powered | Alert threshold (illustrative — config C36) |
|---|---|---|---|---|
| **LPA per batch** | `packaged_volume_l × (measured_abv_pct / 100)` | Batch | C2, C6 | n/a (input to others) |
| **Excise duty variance** | `duty_expected − duty_declared`, where `duty_expected = Σ(lpa_removed) × duty_rate_applied` | Removal_Event, Excise_Declaration | C6, C7, C8 | abs variance > 0.5% of period duty → high |
| **Fool Proof Sticker reconciliation** | `qty_ordered − qty_applied − qty_voided − qty_in_stock`; and `units_dispatched − qty_applied` | Fool_Proof_Sticker_Inventory, Removal_Event/Dispatch_Order | C11 | mismatch > 0.1% of applied → high; any negative → critical |
| **Batch first-time-right rate** | `released_without_deviation / total_batches` (period) | Batch, QC_Test_Result | C5 | < 95% → review |
| **POS licence compliance rate** | `count(active valid Customer_Licence shipped-to) / count(total active POS shipped-to)` | Customer_Licence, Dispatch_Order | C15, C16 | < 100% → any invalid = critical |
| **Export document completeness score** | `docs_present_and_valid / docs_required` per shipment | Export_Document_Bundle | C20 | < 100% before shipment → hold |
| **ABV variance (3-way)** | `max(|abv_lab − abv_label|, |abv_lab − abv_excise_basis|)` | Batch, Label_Version, Excise_Declaration | C9, C13 | > 0.3% abs → high; > 0.5% → critical |
| **Duty cash-timing gap** | `Σ duty_paid_on_removal − Σ trade_cash_collected` (rolling) | Removal_Event, Dispatch_Order | C10 | gap > config working-capital limit → review |
| **Deposit float variance** | `bottles_shipped − bottles_returned − bottles_broken − bottles_in_trade(est)` | Dispatch_Order/returns | C19 | variance > 2% → review |
| **Deadline lead time** | `due_date − today` for each obligation | Regulatory_Actor/licences/permits | C34 | < 30 days → amber; < 7 → red; tax-clearance-gated → escalate |
| **Effluent margin** | `(limit − measured_value) / limit` per parameter | Effluent_Test, EPL_Licence | C27 | margin < 10% → amber; ≤ 0 → critical |

---

## STEP 2D — SAMPLE REFERENCE DATA

*Values are realistic but illustrative; the duty rate must be pulled live from Excise config (C36).*

### 1. Sample BATCH record
```json
{
  "batch_id": "LL625-BIY-20260612-014",
  "sku_id": "SKU-LIONLAGER-625RB",
  "brand": "Lion Lager",
  "pack_type": "bottle_625",
  "run_id": "PR-BIY-20260612-03",
  "process_order_no": "4500087321",          // SAP
  "line_id": "BOTTLING-L2",
  "brew_date": "2026-06-08",
  "packaged_date": "2026-06-12",
  "date_code": "BBE2026-12-08 L2 014",
  "packaged_volume_l": 48000,
  "units_packaged": 76800,                    // 48,000 L / 0.625 L
  "measured_abv_pct": 4.8,                    // LIMS/manual, signed by QA
  "lpa": 2304.0,                              // 48,000 × 4.8%
  "sticker_serial_range": "FPS-2026-AA0480001..AA0556800",
  "release_status": "released",
  "released_by": "user_nilanthi_qa",
  "released_ts": "2026-06-12T09:42:00+05:30",
  "qc_summary": { "abv": "pass", "co2": "pass", "micro": "pass", "fill_volume": "pass" }
}
```

### 2. Sample EXCISE_DECLARATION record
```json
{
  "declaration_id": "EXD-2026-06",
  "period": "2026-06",
  "filed_to": "Excise Department of Sri Lanka",
  "total_units_removed": 3120000,
  "total_volume_l": 1950000,
  "total_lpa": 96420.0,                       // Σ batch LPA removed in June
  "duty_rate_applied": "PULL_FROM_CONFIG_C36 (illustrative: Rs/L-alcohol, beer class)",
  "duty_amount_lkr": "computed = total_lpa × duty_rate_applied",
  "sticker_units_reconciled": 3120000,
  "sticker_variance": 0,
  "removal_refs_count": 1287,
  "excise_register_match": "matched",          // C7 three-way
  "status": "draft",                           // awaiting Finance e-sign (C8)
  "prepared_by": "system",
  "signed_by": null,
  "excise_portal_ref": null
}
```

### 3. Sample EXPORT_DOCUMENT_BUNDLE checklist (one shipment → Maldives)
```json
{
  "bundle_id": "EDB-MV-20260615-007",
  "shipment_id": "EXP-MV-20260615-007",
  "destination_country": "MV",
  "required_docs": [
    {"doc_type": "commercial_invoice",        "required": true, "present": true,  "valid": true},
    {"doc_type": "packing_list",              "required": true, "present": true,  "valid": true},
    {"doc_type": "certificate_of_origin",     "required": true, "present": true,  "valid": true},
    {"doc_type": "free_sale_health_cert",     "required": true, "present": false, "valid": false},  // GAP
    {"doc_type": "asycuda_cusdec",            "required": true, "present": true,  "valid": true},
    {"doc_type": "bill_of_lading",            "required": true, "present": true,  "valid": true},
    {"doc_type": "destination_import_permit", "required": true, "present": true,  "valid": true},
    {"doc_type": "label_conformity_MV",       "required": true, "present": true,  "valid": true},
    {"doc_type": "halal_certificate",         "required": false,"present": false, "valid": false}   // not required for MV; required for GCC
  ],
  "completeness_score": 0.875,                 // 7 of 8 required present+valid
  "gaps": ["free_sale_health_cert"],
  "decision": "HOLD — do not ship until free_sale_health_cert obtained"   // C20
}
```

### 4. Sample CUSTOMER_LICENCE record (FL4 retail, Colombo)
```json
{
  "customer_licence_id": "CL-7c2a91",
  "fl_no": "FL4/WP/COL/2026/0473",
  "fl_category": "FL4",                        // retail "wine store"
  "holder_name": "ABC Wine Stores (Pvt) Ltd",
  "address": "No. 128, Galle Road, Colombo 04",
  "district": "Colombo",
  "province": "Western",
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31",
  "status": "active",                          // from FL register sync
  "last_synced_ts": "2026-06-16T06:00:00+05:30",
  "dispatch_decision_default": "go"            // feeds C16
}
```

---

*End of System Capabilities & Data Model. Part 1 = 36 capabilities across 9 groups, each traced to persona + Stage 0 friction + real artifact. Part 2 = entities, relationships, derived metrics, and sample canonical records buildable on SAP / Excise & Sticker portals / FL register / ASYCUDA / LIMS(OPEN). **[VERIFY]** items (current duty rate, POS count, SAP/LIMS maturity, ~Rs 64.8 bn liability) resolve in discovery before schema lock.*
