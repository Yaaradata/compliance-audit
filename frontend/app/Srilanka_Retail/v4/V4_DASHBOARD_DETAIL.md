# Keystone V4 Dashboard — Simple, Plain-English Walkthrough

**What this is:** Keystone is a control room (a "dashboard") for the finance and audit teams at **Lion Brewery (Ceylon) PLC** — a beer company in Sri Lanka.

**Who uses it:** The CFO (Chief Financial Officer — the top finance boss), the Audit Committee (the board group that double-checks the company's money and rules), and the Board.

**The big idea in one line:** *The painful, multi-day job of preparing the monthly board report becomes a quick review.*

- **Where it lives:** `frontend/app/Srilanka_Retail/v4`
- **Main entry:** `frontend/components/Srilanka_Retail/v4/KeystoneV4Demo.tsx`
- **Data layer:** `frontend/lib/Srilanka_Retail/v4/` (types, seed, constants, format)
- **Original prototype:** `frontend/KeystonePrototype_v4.jsx`

V4 keeps the same six-screen story as V2 (C1–C6) and the same single shared data store, but adds **duty-at-stake on C2**, **receivables ageing and dispatch filters on C3**, **richer evidence packs on C4**, a **slimmer live-metric strip on C5**, and a **modular TypeScript codebase** with its own light/dark theme.

This guide walks through the screen **piece by piece**, one tab at a time (C1 to C6). For every piece you get: what it is, what it's telling you, why the CFO cares, and any short forms spelled out in plain words.

---

## First, the one idea that's on every screen: "every number shows where it came from"

The golden rule of this dashboard is: **you never see a number without a small coloured tag next to it.** That tag tells you how much you can trust the number. Think of it like a freshness label on food.

| Tag you'll see | Colour | What it really means (in plain words) | What the CFO should do |
|------|------|---------|------|
| **SOURCED** | green | The number came straight from a real company system (like the accounting software). It's solid. | Trust it. |
| **VERIFIED** | green with a tick | Same as sourced, but someone also double-checked it. | Trust it the most. |
| **ILLUSTRATIVE** | amber/yellow | A rough estimate, not a hard fact yet. | Roughly right, but confirm before quoting it. |
| **ASSUMPTION** | grey | A guess used to fill a hole because the real number isn't available. | Question it. |
| **LION-VALIDATE** | grey | Lion's own team still needs to confirm this. | It's an open to-do. |
| **OPEN** | grey | The real number isn't ready yet, so it's shown as a range or left blank on purpose. | A known gap — nobody made up a fake number. |
| **PXTY** | amber ring | A stand-in number used temporarily until the real one arrives. | Temporary placeholder. |

**Why this matters:** Auditors (the outside people who inspect the books) trust a dashboard that is honest about what's a fact and what's a guess. Showing the source of every number is what makes it "audit-ready."

When a field is genuinely unknown, V4 shows a **[VALIDATE]** placeholder (for example *"Jehan to confirm"*) instead of inventing a number.

A few short forms you'll meet often, in plain words:

- **KRI** = "Key Risk Indicator" — a number you keep an eye on as an early warning, like a smoke alarm for a business risk.
- **ECL** = "Expected Credit Loss" — the money you set aside in case some customers never pay you.
- **ABV** = "Alcohol By Volume" — how strong the beer is (the alcohol percentage).
- **DSO** = "Days Sales Outstanding" — how long customers take to pay (same idea as "credit-days").
- **FL** = a type of liquor licence in Sri Lanka (for example, "FL-3" is the wholesale level — selling in bulk).
- **SLTDA** = Sri Lanka Tourism Development Authority — the government body that licences tourism venues like hotel bars.

---

## The frame around every screen (always there, on all six tabs)

These parts never change, no matter which tab you're on.

### 1. The name badge (top-left)

The **Lion Brewery logo** image, with **"Lion Brewery (Ceylon) PLC"** underneath in small text.

- **What it tells you:** which company's numbers you're looking at.
- **Why the CFO cares:** makes sure you're in the right company before you trust anything on screen.
- **Note vs V2:** V4 uses the same Lion logo treatment as V2 (not the small Keystone shield icon).

### 2. The row of tabs (across the top — there's no side menu)

Six tabs in one line: **C1 Four-Way Reconciliation · C2 Quality Gate + ABV · C3 Dispatch + Receivables · C4 Evidence Packs · C5 Risk Matrix + Exceptions · C6 Board Report.**

- Each tab shows its code (C1–C6), a little icon, and its name.
- **C1** and **C6** have a small blue **"HERO"** label — these are the two star screens (catching a problem live, and building the board report).
- After you fix the problem on C1, small **green dots** pop up on **C4, C5, and C6** — a hint that fresh proof just landed on those screens.
- **Why the CFO cares:** at a glance you can see where the action is and where new evidence just appeared.

### 3. The title strip

- On the left: a small label **"Keystone · {screen name}"** and a big heading showing the current tab's name.
- On the right: a **"Period: May 2026"** button (which month you're viewing), a **light/dark theme switch**, and a **"Reset demo"** button (puts everything back to the start).
- **Why the CFO cares:** you always know which month's numbers you're reading.
- **V4 note:** Theme choice is saved in the browser (`keystone-v4-theme` in local storage).

### 4. The colour key at the bottom (on every screen)

A single line reminding you what each tag colour means (green = solid, amber = estimate, grey = guess or gap).

- **Why the CFO cares:** a constant cheat-sheet so you never misread a number's trust level.

### 5. The little pop-up message (appears briefly)

A small note at the bottom of the screen after you do something (like *"Report generated"* or *"Excise pack exported — regulator-ready PDF"*). It disappears on its own after a couple of seconds.

- **Why the CFO cares:** quick confirmation that your action worked.

### 6. Layout

- Full-width sticky header (brand + tabs, then title row).
- Main content centred at **max 1400px** — same full-screen feel as V2.

---

# C1 — Four-Way Reconciliation  *(a star screen)*

**What "reconciliation" means:** checking that two or more sets of numbers that *should* match actually do match. "Four-way" means it's checking four numbers against each other at once.

**What this whole tab is for:** Beer pays a government tax called **excise duty** (a tax on alcohol). To make sure Lion pays exactly the right tax, this screen lines up four numbers that should all be equal:

1. how much beer was packaged,
2. how many tax stickers were used,
3. how many transport permits were issued,
4. how much duty was declared.

If they don't all match, the gap is tax that might be unpaid — and unpaid tax means penalties. This screen catches that gap **the moment it happens** instead of weeks later.

**Why the CFO really cares:** Excise duty is the biggest single payment Lion makes to the government. A hidden mismatch here means unpaid tax plus a fine of up to 100% (you'd pay double). This screen puts a rupee figure on that danger, live.

### Piece 1 — The exposure banner (top strip)

- **On the left:** a heading *"Excise exposure under live reconciliation"* and a big number **Rs 160–650M** with an amber **ILLUSTRATIVE** (estimate) tag.
  - **What it's telling you:** roughly how much excise-tax risk is currently being watched. ("Exposure" = how much money is at risk.)
  - **Why it's a range, not one number:** the exact figure isn't known yet, so it honestly shows a low-to-high band instead of a made-up precise number.
- **On the right:** four small facts, each with its own trust tag:
  - **excise paid — Rs 64.8bn** (green/solid) — tax on alcohol already paid.
  - **taxes to govt — Rs 97bn** (green/solid) — total of all taxes Lion pays the government.
  - **FY2026 revenue — Rs 132.4bn** (green/solid) — total sales for the financial year 2026.
  - **penalty — up to 100%** (green/solid) — the worst-case fine on a tax shortfall (you could pay double).
- **Why the CFO cares:** it sets the stakes — against Rs 97bn of taxes and a possible double-fine, the check below is what protects the cash.

### Piece 2 — The four number cards (the "four ways")

Four cards in a 2×2 square, one per number. Each shows the label, a big figure, and which computer system it came from. A green tick means it agrees; an amber warning triangle means it doesn't.

1. **Packaged volume — 12,400 units** (from SAP ECC) — how many packs of beer were actually made.
2. **Tickets / stickers — 11,900 units** (from the Excise portal) — **the odd one out** (amber). Every bottle needs a government tax sticker; only 11,900 were recorded.
3. **Permits issued — 12,400 units** (from the Permit system) — how many transport permits were approved.
4. **Duty declared — pending** (from the Excise return) — the tax filing hasn't been submitted yet, so it shows a dash "—".

- **What it's telling you:** three numbers say 12,400 but the sticker number says 11,900 — so **500 packs of beer are unaccounted for.**
- **Why the CFO cares:** it doesn't just say "there's a problem" — it points to exactly *where* (the stickers).
- **Plain-words note:** a "Fool Proof Sticker" is the tamper-proof sticker put on each bottle to prove its tax was paid.

### Piece 3 — The verdict box (middle)

- A box giving the overall result: **"Tie-out — AT RISK"** in red, plus **"expected duty Rs 79.36M."** After you fix it, this flips to **"RECONCILED"** in green.
- **What it's telling you:** the single pass/fail answer for the whole check.
- **Why the CFO cares:** it's the one-word answer ("at risk" or "fine") you can repeat to the board.

### Piece 4 — The gap box (right)

- A red box: **"Variance — Rs 3.2M — AT RISK"** with an estimate tag and an **"Investigate"** button. When you fix the problem, this number smoothly counts down to **Rs 0.**
- **What it's telling you:** the actual money value of the gap (those 500 missing packs are worth about Rs 3.2M in tax).
- **Why the CFO cares:** it turns an operations problem into a clear money figure you can act on.

### Piece 5 — The explanation drawer (opens when you click "Investigate")

- It expands to a plain explanation: *"12,400 units packaged on dispatch window D-1184, but only 11,900 per-bottle tickets logged against issued permits — 500 units unaccounted → ~Rs 3.2M duty at risk,"* with **"Reconcile"** and **"Dismiss"** buttons.
- **What it's telling you:** the story behind the number, written the way you'd explain it to the board.
- **Why the CFO cares:** gives you the "why" in clear words, ready to drop into a board note.

### Piece 6 — The "fixed" confirmation (after you click "Reconcile")

- A green message: *"Reconciled — duty-defensibility evidence generated; added to the Excise pack (C4) and the board report (C6)."*
- **What it's telling you:** fixing it here didn't just clear a number — it automatically created the supporting paperwork on other screens.
- **Why the CFO cares:** shows the whole system is connected — one fix here updates the evidence (C4), the risk view (C5), and the board report (C6) by itself, with no re-typing.

### Piece 7 — The speed note (bottom)

- *"Detection latency: 2 min vs ~weeks manual"* with a grey "guess" tag.
- **What it's telling you:** how fast the problem was caught — about 2 minutes here, versus weeks if done by hand.
- **Why the CFO cares:** catching it fast is the whole point — and the main money-saver.

---

# C2 — Quality Gate + ABV

**What "quality gate" means:** a checkpoint that a batch of beer must pass before it's allowed to leave the factory — like a security gate that won't open until everything checks out.

**What this whole tab is for:** It shows whether one batch of beer is cleared to ship. A batch can only ship if (a) its quality tests pass, and (b) its alcohol strength matches across three records. If the alcohol strength doesn't match, the batch is held back.

**Why the CFO really cares:** the alcohol strength printed on the label decides how much tax is owed. If the lab says the beer is stronger than the label claims, you're either paying the wrong tax or mislabelling the product (both are problems). Holding the batch protects both quality and the tax figure that feeds into C1.

**What's new in V4:** C2 leads with **duty at stake** — a rupee figure for the tax misstatement this batch would cause if it shipped.

### Piece 1 — The duty-at-stake banner (V4 hero)

- A coins icon, heading *"Duty at stake — caught at the gate,"* and a big number **≈ Rs 0.6M** with an **ILLUSTRATIVE** tag.
- Subtext: *"+0.2 ABV pts understated → duty understated. Held before it reached the excise return."*
- A red **"HELD · B-2271"** badge on the right.
- **Basis line:** explains the calculation (0.2 ABV points × batch volume × duty rate) with **"Exact figure [VALIDATE — Jehan to confirm]"**.
- **What it's telling you:** this isn't just a quality hold — it's **Rs 0.6M of tax** that would have been wrong on the return if the batch had shipped.
- **Why the CFO cares:** connects the lab/label mismatch directly to money at risk, in language the board understands.

### Piece 2 — The context line (top)

- *"This batch's ABV is the duty basis — a quality number becomes a tax misstatement on the excise return. The gate stops it before it ships."*
- **Why the CFO cares:** makes the link between C2 and C1 explicit in one sentence.

### Piece 3 — The "ABV triple-check" (the heart of this screen)

- A box showing the alcohol strength from three sources:
  - **Lab-measured — 4.8%** (what the lab actually measured) — highlighted amber as the outlier.
  - **Label-declared — 4.6%** (what the bottle label says) — tagged **DUTY BASIS**.
  - **Excise-basis — 4.6%** (the strength the tax is calculated on) — tagged **DUTY BASIS**.
- Below it, a red note: *"The lab number (4.8%) disagrees with the duty basis (4.6%) by 0.2 pts."*
- **What it's telling you:** the lab found the beer 0.2 percentage points stronger than the label and the tax assume.
- **Why the CFO cares:** across a whole production run, that 0.2% difference is real tax money and a labelling problem.

### Piece 4 — The release checks row

- Three small results: **Microbiological — Pass** (green), **Sensory panel — Pass** (green), **ABV verification — Fail** (amber).
- Footer: *"release gated on ABV"*
- **What it's telling you:** the beer is safe and tastes right, but its alcohol-strength check failed — and that's what blocks release.

### Piece 5 — The data-source line

- *"Brewery Mgmt — Krones API · validation logic runs live"* with a grey **ASSUMPTION** tag.
- **Plain words:** **Krones** makes Lion's bottling-line equipment. **API** = a live, automatic data connection between two computer systems.

---

# C3 — Dispatch + Receivables

**Two plain-word definitions first:**

- **Dispatch** = sending out the goods (loading trucks and shipping beer to distributors).
- **Receivables** = money customers owe the company for beer already delivered but not yet paid for.

**What this whole tab is for:** Two money-and-risk checks in one place — (a) how much money customers owe, how it's ageing, and whether collection is improving, and (b) a shipping queue that automatically stops trucks going to any distributor whose liquor licence has expired.

**Why the CFO really cares:** This is about cash and risk. Shipping to a distributor with an expired licence is both a money risk (they may not pay) and breaking the law. The receivables card shows whether the company is collecting its money well.

**What's new in V4:** an **ageing bar** (how old the receivables are), **filter tabs** on the dispatch queue, **per-load dates and values**, and a **blocked-revenue callout** when a truck is held.

### Piece 1 — The receivables card (top)

- A wallet icon, heading *"Group trade receivables · order-to-cash,"* a big number **Rs 4.07bn** (green/solid), and a green **"down ~25% YoY"** arrow.
- On the right: **Credit-days (DSO) — [VALIDATE]** and **ECL ageing — OPEN** (not ready yet).
- **What it's telling you:** customer money owed is falling year-on-year, and two extra credit metrics are honestly left open.

### Piece 2 — Book shrinking and write-off risk (two sub-cards)

- **Book shrinking:** **Rs 5.41bn → Rs 4.07bn** (sourced) — *"less cash exposed year on year."*
- **Write-off risk:** **bad-debt Rs 23M** (sourced) — *"&lt;0.6% of book — tight credit control."*
- **Why the CFO cares:** shows improving collection with almost no write-offs.

### Piece 3 — The ageing bar (V4)

- A stacked colour bar split into three buckets:
  - **Current 0–30d — Rs 3.30bn (81%)** — green / low risk.
  - **31–60d — Rs 520M (13%)** — amber / medium.
  - **60+d — Rs 250M (6%)** — red / high.
- Tagged **ILLUSTRATIVE** with a note: *"Illustrative split — Jehan to confirm actual buckets on the call."*
- **What it's telling you:** most money is current, but a tail of older debt still needs watching.
- **Why the CFO cares:** ageing is the early warning for cash problems — V4 shows it visually instead of hiding it.

### Piece 4 — The dispatch queue heading

- A truck icon, *"Dispatch queue · distributor tier,"* underneath *"Distribution / Commercial · FL-3 wholesale,"* and on the right *"Distribution points 1,130–4,000"* with an **OPEN** tag.

### Piece 5 — Filter tabs (V4)

- Four tabs with counts: **All · Cleared · Needs attention · Blocked.**
- Click a tab to filter the truck list (for example, **Blocked** shows only L-442).
- **Why the CFO cares:** during a busy dispatch day, you can jump straight to what's blocked without scrolling.

### Piece 6 — The three truckloads

Each row shows load ID, distributor/depot, **date**, **load value**, licence type, and status colour:

1. **L-440 — Distributor #218, Borella depot (Western)** — 15 May · Rs 2.6M — licence **valid** (green) — **Cleared**.
2. **L-441 — Distributor #57, Kandy depot (Central) · on-trade chain** — 14 May · Rs 3.1M — **SLTDA lapsed** (amber) — **Cleared — flagged**.
3. **L-442 — Distributor #903, Nugegoda depot (Western)** — 14 May · Rs 4.2M — **licence expired** (red) — **Dispatch blocked** (padlock).

- **What it's telling you:** the system automatically blocks the truck whose liquor licence has expired, and flags the one whose tourism licence lapsed.
- **Why the CFO cares:** it stops illegal shipments — and the fines that follow — *before* the truck leaves.

### Piece 7 — Blocked revenue callout (V4)

- When a load is blocked, a red banner appears: *"Rs 4.2M of dispatch held this period on a lapsed licence"* (illustrative) and *"Blocked dispatch is also blocked revenue — the control protects cash, not just compliance."*
- **Why the CFO cares:** ties compliance blocking directly to cash impact.

### Piece 8 — The data-source and automation note

- *"SFA + SAP ECC"* as the data source, and *"Validate + expiry alert live · auto-block wired during onboarding."*
- **Plain words:** **SFA** = Sales Force Automation (field-sales software for ~4,000 distributor points). **Onboarding** = the initial setup period when the system is first installed.

---

# C4 — Evidence Packs

**What "evidence pack" means:** a ready-made folder of proof — all the documents a particular regulator would ask to see if they came to inspect the company.

**What this whole tab is for:** For each regulator, it keeps a folder of exactly the proof that regulator would want — and it builds that folder automatically from what the other screens already produced.

**Why the CFO really cares:** When an inspector shows up, "audit-ready" means the folder is *already done*. No scrambling for weeks to gather paperwork.

**What's new in V4:** each evidence item is **expandable** (underlying records, who signed it, when), plus **Export pack (PDF)** and **Share** buttons, and a **current/pending item count** with an audit-ready badge.

### Piece 1 — The regulator picker (row of buttons)

- Six buttons: **Excise · SLSI · FCAU · Customs · CEA · Labour.** The one you pick is highlighted.
- **The six regulators in plain words:**
  - **Excise** = the alcohol-tax department.
  - **SLSI** = Sri Lanka Standards Institution — product quality standards.
  - **FCAU** = Food Control Administration Unit — food and drink safety.
  - **Customs** = import/export taxes and paperwork.
  - **CEA** = Central Environmental Authority — environmental compliance.
  - **Labour** = Department of Labour — worker safety and employment rules.

### Piece 2 — Pack status header (V4)

- Shows **"{current}/{total} items current"** for the selected regulator.
- Green **"Audit-ready"** when all items are current; amber **"{n} pending"** when something is still outstanding.
- Subtext: *"If {regulator} requested an audit today, this file is already built."*
- **Export pack (PDF)** and **Share** buttons (each triggers a brief confirmation toast).

### Piece 3 — The list of proof items (expandable)

- For the chosen regulator, a list of documents. Each row shows:
  - A green tick (checked) or clock (pending).
  - The document name.
  - A **"from C1/C2/C3"** tag showing which screen created it.
- **Click a row** to expand **underlying records** — bullet points of what the pack actually contains, plus **Signed by**, **timestamp**, and **lineage** (which screen fed it).
- For Excise, example items include:
  - *Batch release + ABV trail — B-2271* (from C2)
  - *Dispatch licence stamps — L-440 / L-441 / L-442* (from C3)
  - *Transport-permit ↔ sticker tie-out — May 2026* (from C1)
- After you fix the problem on C1, a **new green-outlined row** appears: *"Four-way reconciliation — May 2026"* (from C1) with a **"just added"** badge.
- **Why the CFO cares:** full traceability — every piece of proof links back to the control that produced it, and you can drill into the actual records without leaving the screen.

### Piece 4 — The link to C6

- *"Every assembled pack feeds the monthly board report (C6). Prep baseline ~weeks → on-demand"* with an **ASSUMPTION** tag.
- **Why the CFO cares:** proof flows straight into the board report with no re-typing.

---

# C5 — Risk Matrix + Exceptions

**Two plain-word definitions first:**

- **Risk matrix** = a table that lists the company's main risks and rates how serious each one is.
- **Exception** = a place where the company broke a rule (and what was done about it).

**What this whole tab is for:** The big-picture risk view on one page — headline numbers, the table of risks, the list of rule-breaks (and their fixes), and a grid showing how ready the company is for each regulator.

**Why the CFO really cares:** this is the risk story for the board on a single page, with every number showing where it came from.

**What's new in V4:** a **board-pack banner** at the top (multi-day → one-click), a **slimmer three-tile metric strip** (live figures only), and a **dynamic Audit Committee rollup** driven by the posture grid.

### Piece 1 — Board-pack banner (V4)

- Blue banner: *"Monthly board pack: multi-day build → one-click export"* with **LION-VALIDATE** tag and *"→ generate on C6"*.
- **What it's telling you:** the headline value proposition — and where to actually build the report (C6).
- **Why the CFO cares:** sets up the payoff before you dive into risks.

### Piece 2 — Three headline metric tiles (V4)

A row of three primary numbers (not six — V4 keeps only live, sourced figures here):

1. **Excise exposure under live reconciliation — Rs 160–650M** (illustrative) — same band as C1.
2. **Receivables under live credit watch — Rs 4.07bn** (sourced) — FY2026, down ~25% YoY.
3. **Regulators audit-ready — 6 / 6** (sourced) — evidence packs assemble on demand (C4).

- **Why the CFO cares:** three honest talking points tied to live controls, without padding the strip with guesses.

### Piece 3 — The risk table

A table with columns: **Risk · Inherent · Control · Residual · KRI · Trend.** Five risks are listed, including:

1. **Global events and supply chain disruptions** — high → medium residual.
2. **Local market and economic risks** — KRI: contingent liabilities Rs 3.51bn (WATCH).
3. **Taxation and tariffs** — controlled by **Duty**; corporate tax 40%→45% from 1 Apr 2025.
4. **Receivables / distributor-credit exposure** — controlled by **Dispatch**; receivables improving.
5. **Business continuity / flood risk** — riverbank plant; insurance and training.

- **Column meanings:**
  - **Inherent** = risk before safeguards (impact / likelihood).
  - **Control** = the safeguard (Duty, Dispatch, etc.).
  - **Residual** = risk left after safeguards (tagged illustrative).
  - **KRI** = early-warning number.
  - **Trend** = improving / worsening / stable.

### Piece 4 — The escalation line

- *"Escalation path — Risk register → Board → Quarterly ESG Committee"* with a **SOURCED** tag.
- **Plain words:** **ESG** = Environmental, Social & Governance (responsibility/ethics matters).

### Piece 5 — The rule-break (exception) list

- Heading: *"Compliance exceptions · every 7.10 / Section-9 line tracked."*
- The one exception this period:
  - **Rule 7.10.2(a) — Minimum number of independent directors** (verified).
  - Gap **"2 of 3 required"** (crossed out) → **"Cured · compliant"** (green).
  - Disclosure, cure (Ajay Baliga appointed 2 Feb 2024), raised Nov 2023, cured 2 Feb 2024.
- Note: *"Governance posture: green — the one exception in the period was disclosed and cured. The same record drives the board report (C6)."*

### Piece 6 — The readiness grid ("if every regulator walked in tomorrow")

- Rows: **Duty, Quality, Dispatch, Evidence.** Columns: the six regulators.
- Each cell: green tick (OK), amber triangle (ATTENTION), or blank (NA).
- Below: **dynamic rollup** — items that need Audit Committee attention, for example:
  - *"Excise · Duty — four-way tie-out variance pending reconciliation"*
  - *"Customs · Dispatch — lapsed-licence load L-442 blocked; manual resolution pending"*
- After C1 reconcile, the Excise·Duty cell turns green and the rollup count drops.
- **Plain words:** **OK** = working; **ATTENTION** = needs action; **NA** = not applicable for that regulator/control pair.

---

# C6 — Board Report  *(the other star screen)*

**What this whole tab is for:** It builds the entire monthly report for the board/audit committee in one click — committees, governance rule-checks, the risk table, and the closing sign-off — all pulled from the same live data. Then you can save it as a PDF or email it.

**Why the CFO really cares:** this is the big payoff. The report that normally takes several people several days to put together is now one click, and every number already shows its source. *The monthly grind becomes a quick review.*

### Before you click "Generate" — the intro card

- A file icon, heading *"Monthly Audit-Committee Report · May 2026,"* and *"The pack assembles itself from what the plant already produced."*
- Numbered sections it will include: **1 Board-affairs compliance statement · 2 Audit Committee · 3 RPT Review Committee · 4 Auditor sign-off.**
- A **"Generate report"** button (briefly shows *"Assembling pack…"*).
- Footer: *"Board-pack prep: multi-day build → one-click export"* with **LION-VALIDATE** tag.

### After you click — the finished report

#### Piece 1 — Report header + buttons

- Title *"Audit-Committee Report — May 2026,"* line *"Lion Brewery (Ceylon) PLC · derived from live data · board-ready,"* and **Export PDF** / **Email to committee** buttons.

#### Piece 2 — The board committees

- Four committee cards (Audit, Remuneration, RPT Review, Nominations & Governance).
- Each shows remit (verified), members, and *"Meetings this year: [VALIDATE — Jehan to confirm] · matters OPEN."*
- **Plain words:** **RPT** = Related Party Transactions — deals with connected people/firms that need extra scrutiny.

#### Piece 3 — The governance rule-check

- Reuses the **same exception record from C5** (independent directors, now cured).
- Remaining rule lines marked **OPEN** pending the FY2025 governance report.
- **Why the CFO cares:** C5 and C6 can never contradict each other — same store object.

#### Piece 4 — The risk table (reused from C5)

- Shorter summary: category, residual severity, KRI value, trend — for all five risks.
- Escalation path repeated at the bottom.

#### Piece 5 — The closing sign-off

- *"Closing assurance"* (verified), Companies Act compliance statement, and thank-you to committees and board.

#### Piece 6 — Footer + "Regenerate"

- Tagline *"The monthly grind becomes a review."* and a **Regenerate** button to rebuild if data changes.

---

## Why all the tabs are connected (the most important point)

Everything on this dashboard is powered by **one shared in-memory store** (`KeystoneDataV4` in `lib/Srilanka_Retail/v4/seed.ts`). Fixing something in one place updates everywhere automatically.

Here's the chain when you fix the C1 problem:

1. You click **Reconcile** on **C1**, clearing the 500-unit gap and animating variance to **Rs 0.** →
2. Stickers stream flips to **AGREE**; tie-out becomes **RECONCILED**; posture **EXCISE|DUTY** turns **OK.** →
3. A new evidence item is appended to the **C4** Excise pack (green outline, "just added"). →
4. The **C5** readiness grid turns Excise·Duty green; green dots light up on C4/C5/C6 tabs; Audit Committee rollup drops one item. →
5. The **C6** board report uses the same risk and exception records, so the board report instantly matches what you just fixed.

**The takeaway for the CFO:** you never fix the same thing twice, and the board report can never disagree with the working screens — because they're all reading the same data.

---

## Code structure (for developers)

| Layer | Path | Role |
|-------|------|------|
| Route | `app/Srilanka_Retail/v4/page.tsx` | Next.js page, IBM Plex fonts |
| App shell | `components/.../v4/KeystoneV4Demo.tsx` | State, reconcile, generate, reset |
| Shell UI | `components/.../v4/shell/` | `BrandMark`, `TopNav`, `AppHeader`, `ProvenanceLegend` |
| Screens | `components/.../v4/screens/` | `HeroC1`, `ScreenC2`–`ScreenC6`, `ExceptionRow` |
| Primitives | `components/.../v4/primitives/ui.tsx` | Chip, Btn, Card, Eyebrow, Range, etc. |
| Theme | `components/.../v4/theme/` | `palette.ts`, `KeystoneV4ThemeProvider` |
| Data | `lib/Srilanka_Retail/v4/` | `types.ts`, `seed.ts`, `constants.ts`, `format.ts` |

---

## Quick dictionary — every short form in plain words

| Short form | What it means |
|------|------|
| **ABV** | Alcohol By Volume — how strong the beer is (alcohol %) |
| **API** | A live, automatic data link between two computer systems |
| **B-2271** | A batch ID number |
| **bn / M / Rs** | Billion / Million / Sri Lankan Rupees |
| **CEA** | Central Environmental Authority (environment regulator) |
| **CSE** | Colombo Stock Exchange (the stock market) |
| **DSO** | Days Sales Outstanding — average days to collect payment |
| **ECL** | Expected Credit Loss — money set aside in case customers don't pay |
| **ESG** | Environmental, Social & Governance (responsibility/ethics matters) |
| **Excise** | The alcohol-tax department / the alcohol tax itself |
| **FCAU** | Food Control Administration Unit (food-safety regulator) |
| **FL-3** | The wholesale liquor licence level |
| **FY2025 / FY2026** | Financial years (the company's accounting years) |
| **Fool Proof Sticker** | The tamper-proof tax sticker on each bottle |
| **Inherent / Residual risk** | Risk before safeguards / risk left after safeguards |
| **KPI** | Key Performance Indicator (a headline "how are we doing" number) |
| **KRI** | Key Risk Indicator (an early-warning number) |
| **Krones** | The maker of Lion's bottling-line machines (a data source) |
| **L-440/441/442** | Truckload ID numbers |
| **on-trade** | Venues that sell drinks for drinking on-site (bars, hotels) |
| **Onboarding** | The setup period when the system is first installed |
| **Receivables** | Money customers owe for goods already delivered |
| **Reconciliation / Tie-out** | Checking that numbers that should match actually match |
| **RPT** | Related Party Transactions (deals with connected people/firms) |
| **SAP ECC** | The company's main accounting/operations software |
| **SEC Act** | The law behind the stock-market regulator |
| **SFA** | Sales Force Automation (the distributor/field-sales software) |
| **SLSI** | Sri Lanka Standards Institution (product-standards regulator) |
| **SLTDA** | Sri Lanka Tourism Development Authority (tourism-venue licences) |
| **Variance / Exposure** | The gap between numbers / how much money is at risk |

---

## V4 vs V2 — what changed (at a glance)

| Area | V2 | V4 |
|------|----|----|
| Code | Single `KeystonePrototype.tsx` file | Modular `lib/` + `components/` + `app/` |
| Theme | Shared `keystone-theme.css` | Dedicated V4 palette + light/dark toggle |
| Logo / layout | Lion logo, full-width top nav | Same full-width shell and Lion logo |
| C2 | ABV triple-check + held batch | Adds **duty at stake (~Rs 0.6M)** hero |
| C3 | Receivables + dispatch list | Adds **ageing bar**, **filter tabs**, load **dates/values**, **blocked revenue** callout |
| C4 | Flat evidence list | **Expandable records**, export/share, **item count** status |
| C5 | Six headline tiles | **Three live tiles** + board-pack banner; **dynamic rollup** |
| C6 | Board report generator | Same flow; data **derived from live store** |

---

*Based on the V4 screen code under `frontend/components/Srilanka_Retail/v4/` and seed data in `frontend/lib/Srilanka_Retail/v4/seed.ts`. The figures here are the demo's sample data for May 2026; in real use the same fields are filled automatically from the company's systems and the government portals.*
