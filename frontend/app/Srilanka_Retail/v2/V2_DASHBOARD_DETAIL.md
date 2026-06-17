# Keystone V2 Dashboard — Simple, Plain-English Walkthrough

**What this is:** Keystone is a control room (a "dashboard") for the finance and audit teams at **Lion Brewery (Ceylon) PLC** — a beer company in Sri Lanka.
**Who uses it:** The CFO (Chief Financial Officer — the top finance boss), the Audit Committee (the board group that double-checks the company's money and rules), and the Board.
**The big idea in one line:** *The painful, multi-day job of preparing the monthly board report becomes a quick review.*

- **Where it lives:** `frontend/app/Srilanka_Retail/v2`
- **The code file:** `frontend/components/Srilanka_Retail/v2/KeystonePrototype.tsx`

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

A few short forms you'll meet often, in plain words:
- **KRI** = "Key Risk Indicator" — a number you keep an eye on as an early warning, like a smoke alarm for a business risk.
- **ECL** = "Expected Credit Loss" — the money you set aside in case some customers never pay you.
- **ABV** = "Alcohol By Volume" — how strong the beer is (the alcohol percentage).
- **FL** = a type of liquor licence in Sri Lanka (for example, "FL-3" is the wholesale level — selling in bulk).
- **SLTDA** = Sri Lanka Tourism Development Authority — the government body that licences tourism venues like hotel bars.

---

## The frame around every screen (always there, on all six tabs)

These parts never change, no matter which tab you're on.

### 1. The name badge (top-left)
A shield icon, the word **"Keystone,"** and underneath it **"Lion Brewery (Ceylon) PLC."**
- **What it tells you:** which company's numbers you're looking at.
- **Why the CFO cares:** makes sure you're in the right company before you trust anything on screen.

### 2. The row of tabs (across the top — there's no side menu)
Six tabs in one line: **C1 Four-Way Reconciliation · C2 Quality Gate + ABV · C3 Dispatch + Receivables · C4 Evidence Packs · C5 Risk Matrix + Exceptions · C6 Board Report.**
- Each tab shows its code (C1–C6), a little icon, and its name.
- **C1** and **C6** have a small blue **"HERO"** label — these are the two star screens (catching a problem live, and building the board report).
- After you fix the problem on C1, small **green dots** pop up on **C4, C5, and C6** — a hint that fresh proof just landed on those screens.
- **Why the CFO cares:** at a glance you can see where the action is and where new evidence just appeared.

### 3. The title strip
- On the left: a small label and a big heading showing the current tab's name.
- On the right: a **"Period: May 2026"** button (which month you're viewing), a **light/dark theme switch**, and a **"Reset demo"** button (puts everything back to the start).
- **Why the CFO cares:** you always know which month's numbers you're reading.

### 4. The colour key at the bottom (on every screen)
A single line reminding you what each tag colour means (green = solid, amber = estimate, grey = guess or gap).
- **Why the CFO cares:** a constant cheat-sheet so you never misread a number's trust level.

### 5. The little pop-up message (appears briefly)
A small note at the bottom of the screen after you do something (like *"Report generated"*). It disappears on its own after a couple of seconds.
- **Why the CFO cares:** quick confirmation that your action worked.

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
  - **FY2026 revenue — Rs 132.4bn** (green/solid) — total sales for the financial year 2026. ("Revenue" = sales income. "FY" = financial year, the company's 12-month accounting period.)
  - **penalty — up to 100%** (green/solid) — the worst-case fine on a tax shortfall (you could pay double).
- **Why the CFO cares:** it sets the stakes — against Rs 97bn of taxes and a possible double-fine, the check below is what protects the cash.
- **Short forms:** **bn** = billion, **M** = million, **Rs** = Sri Lankan Rupees (the currency).

### Piece 2 — The four number cards (the "four ways")
Four cards in a 2×2 square, one per number. Each shows the label, a big figure, and which computer system it came from. A green tick means it agrees; an amber warning triangle means it doesn't.
1. **Packaged volume — 12,400 units** (from SAP ECC) — how many packs of beer were actually made. ("SAP ECC" = the company's main accounting/operations software. "Units" = individual packs/bottles.)
2. **Tickets / stickers — 11,900 units** (from the Excise portal) — **the odd one out** (amber). Every bottle needs a government tax sticker; only 11,900 were recorded. ("Excise portal" = the government tax department's website/system.)
3. **Permits issued — 12,400 units** (from the Permit system) — how many transport permits were approved.
4. **Duty declared — pending** (from the Excise return) — the tax filing hasn't been submitted yet, so it shows a dash "—".
- **What it's telling you:** three numbers say 12,400 but the sticker number says 11,900 — so **500 packs of beer are unaccounted for.**
- **Why the CFO cares:** it doesn't just say "there's a problem" — it points to exactly *where* (the stickers).
- **Plain-words note:** a "Fool Proof Sticker" is the tamper-proof sticker put on each bottle to prove its tax was paid.

### Piece 3 — The verdict box (middle)
- A box giving the overall result: **"Tie-out — AT RISK"** in red, plus **"expected duty Rs 79.36M."** After you fix it, this flips to **"RECONCILED"** in green.
- **What it's telling you:** the single pass/fail answer for the whole check. ("Tie-out" = do the numbers match? "Expected duty" = the tax the check says you should owe.)
- **Why the CFO cares:** it's the one-word answer ("at risk" or "fine") you can repeat to the board.

### Piece 4 — The gap box (right)
- A red box: **"Variance — Rs 3.2M — AT RISK"** with an estimate tag and an **"Investigate"** button. When you fix the problem, this number smoothly counts down to **Rs 0.**
- **What it's telling you:** the actual money value of the gap (those 500 missing packs are worth about Rs 3.2M in tax). ("Variance" = the difference/gap between numbers.)
- **Why the CFO cares:** it turns an operations problem into a clear money figure you can act on.

### Piece 5 — The explanation drawer (opens when you click "Investigate")
- It expands to a plain explanation: *"12,400 packs were made, but only 11,900 tax stickers were recorded against the permits — 500 packs unaccounted, about Rs 3.2M of tax at risk,"* with **"Reconcile"** and **"Dismiss"** buttons.
- **What it's telling you:** the story behind the number, written the way you'd explain it to the board.
- **Why the CFO cares:** gives you the "why" in clear words, ready to drop into a board note.

### Piece 6 — The "fixed" confirmation (after you click "Reconcile")
- A green message: *"Reconciled — proof of correct duty created; added to the Excise evidence pack (C4) and the board report (C6)."*
- **What it's telling you:** fixing it here didn't just clear a number — it automatically created the supporting paperwork on other screens.
- **Why the CFO cares:** shows the whole system is connected — one fix here updates the evidence (C4), the risk view (C5), and the board report (C6) by itself, with no re-typing.

### Piece 7 — The speed note (bottom)
- *"Detection latency: 2 min vs ~weeks manual"* with a grey "guess" tag.
- **What it's telling you:** how fast the problem was caught — about 2 minutes here, versus weeks if done by hand. ("Detection latency" = the delay between a problem happening and someone noticing it.)
- **Why the CFO cares:** catching it fast is the whole point — and the main money-saver.

---

# C2 — Quality Gate + ABV

**What "quality gate" means:** a checkpoint that a batch of beer must pass before it's allowed to leave the factory — like a security gate that won't open until everything checks out.

**What this whole tab is for:** It shows whether one batch of beer is cleared to ship. A batch can only ship if (a) its quality tests pass, and (b) its alcohol strength matches across three records. If the alcohol strength doesn't match, the batch is held back.

**Why the CFO really cares:** the alcohol strength printed on the label decides how much tax is owed. If the lab says the beer is stronger than the label claims, you're either paying the wrong tax or mislabelling the product (both are problems). Holding the batch protects both quality and the tax figure that feeds into C1.

### Piece 1 — The batch heading
- On the left: a flask icon, **"Batch B-2271,"** and underneath *"Release gate · QA / Laboratory Manager."*
- On the right: a red **"HELD"** badge with a padlock.
- **What it's telling you:** which batch is being checked, and that it's currently blocked from shipping. ("Batch B-2271" is just the batch's ID number. "QA" = Quality Assurance, the team that checks product quality. "HELD" = not allowed to ship yet.)
- **Why the CFO cares:** a held batch is money sitting idle — but shipping a bad one is worse.

### Piece 2 — The three test results
- Three small boxes: **Microbiological — Pass** (green), **Sensory panel — Pass** (green), **ABV verification — Fail** (amber).
- **What it's telling you:** the beer is safe and tastes right, but its alcohol-strength check failed.
- **Why the CFO cares:** it pinpoints the *one* reason the batch is stuck — not a quality issue, a tax-strength issue.
- **Plain words:**
  - **Microbiological** = a lab test for contamination/safety (any harmful bugs?).
  - **Sensory panel** = real people tasting and smelling it to check quality.
  - **ABV verification** = checking the alcohol strength is correct.

### Piece 3 — The "ABV triple-check" (the heart of this screen)
- A box showing the alcohol strength from three sources:
  - **Lab-measured — 4.8%** (what the lab actually measured)
  - **Label-declared — 4.6%** (what the bottle label says)
  - **Excise-basis — 4.6%** (the strength the tax is calculated on)
- Below it, a red note: *"Mismatch 0.2 pts — lab 4.8% vs label 4.6%."*
- **What it's telling you:** the lab found the beer 0.2 percentage points stronger than the label and the tax assume.
- **Why the CFO cares:** across a whole production run, that 0.2% difference is real tax money and a labelling problem — and it's the exact figure that feeds the tax check on C1.
- **Plain words:** **ABV** = Alcohol By Volume (the alcohol percentage). **pts** = "percentage points," just the gap between the two percentages. **Excise-basis** = the strength figure the tax is built on.

### Piece 4 — The "release blocked" message
- A red banner with a padlock: *"Release blocked — alcohol strength must match the label and the tax before this batch can ship."*
- **What it's telling you:** the firm rule that's keeping the batch locked.
- **Why the CFO cares:** proof the control is automatic, not someone's opinion — which auditors like.

### Piece 5 — The link to C1
- *"This alcohol strength is the same figure that drives the tax calculation on the four-way check (C1)."*
- **What it's telling you:** this screen and C1 use the *same* strength number.
- **Why the CFO cares:** confirms the whole system uses one figure everywhere, so screens can't disagree.

### Piece 6 — The data-source line
- *"Brewery Mgmt — Krones API · checks run live"* with a grey "guess" tag.
- **What it's telling you:** the batch and strength data come straight from the bottling-line machines.
- **Why the CFO cares:** the numbers are pulled automatically from the production line, not typed in by hand.
- **Plain words:** **Krones** is the company that makes Lion's bottling-line equipment. **API** = "Application Programming Interface," which just means a live, automatic data connection between two computer systems.

---

# C3 — Dispatch + Receivables

**Two plain-word definitions first:**
- **Dispatch** = sending out the goods (loading trucks and shipping beer to distributors).
- **Receivables** = money customers owe the company for beer already delivered but not yet paid for.

**What this whole tab is for:** Two money-and-risk checks in one place — (a) how much money customers owe and whether that's getting better, and (b) a shipping queue that automatically stops trucks going to any distributor whose liquor licence has expired.

**Why the CFO really cares:** This is about cash and risk. Shipping to a distributor with an expired licence is both a money risk (they may not pay) and breaking the law. The receivables card shows whether the company is collecting its money well.

### Piece 1 — The receivables card (top)
- A wallet icon, the heading *"Group trade receivables · order-to-cash,"* a big number **Rs 4.07bn** (green/solid) and an **"improving"** arrow.
- Underneath: *"FY2025 Rs 5.41bn → FY2026 Rs 4.07bn · bad-debt charge Rs 23M (tight control)."*
- On the right: **Credit-days — (to be confirmed)** and **ECL ageing — OPEN (not ready yet).**
- **What it's telling you:** the money owed dropped from Rs 5.41bn last year to Rs 4.07bn this year, and almost none had to be written off — that's good collection. Two extra details aren't wired up yet, shown honestly as blank.
- **Why the CFO cares:** it shows the company is getting its cash in faster, and is honest about which credit numbers still need data.
- **Plain words:**
  - **Trade receivables** = money owed by customers for goods delivered.
  - **Order-to-cash** = the whole journey from a customer placing an order to the company actually getting paid.
  - **Bad-debt charge** = money given up as never-going-to-be-paid (here just Rs 23M, which is tiny = good control).
  - **Credit-days** = the average number of days customers take to pay.
  - **ECL ageing** = "Expected Credit Loss by age" — sorting the money owed by how long it's been overdue, to estimate what might never be paid.

### Piece 2 — The dispatch queue heading
- A truck icon, *"Dispatch queue · distributor tier,"* underneath *"Distribution / Commercial · FL-3 wholesale,"* and on the right *"Distribution points 1,130–4,000"* with an **OPEN** (not finalised) tag.
- **What it's telling you:** this is the wholesale shipping lane, and the (not-yet-confirmed) number of delivery locations served.
- **Why the CFO cares:** shows the size of the distribution network; the range signals the exact count is still being confirmed.
- **Plain words:** **FL-3** = the wholesale liquor licence level (selling in bulk to distributors). **Distribution points** = the separate places beer gets delivered to.

### Piece 3 — The three truckloads
Each row is one truckload heading to a distributor, colour-coded by licence status:
1. **L-440 — Distributor #218, Borella depot (Western region)** — licence **valid** (green) — **Cleared** to ship.
2. **L-441 — Distributor #57, Kandy depot (Central region) · hotel/bar chain** — **tourism licence lapsed** (amber) — flagged.
3. **L-442 — Distributor #903, Nugegoda depot (Western region)** — **licence expired** (red) — **Dispatch blocked** (padlock).
- **What it's telling you:** the system automatically blocks the truck (L-442) whose liquor licence has expired, and flags the one (L-441) whose tourism licence lapsed.
- **Why the CFO cares:** it stops illegal shipments — and the fines that follow — *before* the truck leaves, not after.
- **Plain words:**
  - **L-440 / L-441 / L-442** = ID numbers for each truckload.
  - **depot** = a distributor's regional warehouse. **Western / Central** = provinces (areas) of Sri Lanka.
  - **hotel/bar chain (on-trade)** = places that sell drinks to be consumed on-site, like bars and hotels.
  - **SLTDA** = Sri Lanka Tourism Development Authority — the body that licences tourism venues; "tourism licence lapsed" means that licence has run out.

### Piece 4 — The data-source and automation note
- *"SFA + SAP ECC"* as the data source (marked "set up during onboarding"), and *"Licence-check and expiry alerts are live · auto-blocking is set up during onboarding."*
- **What it's telling you:** where the data comes from, and which automatic features are already on versus set up later.
- **Why the CFO cares:** it's honest about what already works automatically and what gets switched on during setup.
- **Plain words:** **SFA** = "Sales Force Automation," the software the field-sales team uses to manage the ~4,000 distributor points. **Onboarding** = the initial setup period when the system is first installed.

---

# C4 — Evidence Packs

**What "evidence pack" means:** a ready-made folder of proof — all the documents a particular regulator would ask to see if they came to inspect the company.

**Plain word — "regulator":** a government body that makes sure companies follow the rules (for example, the tax department or the food-safety department).

**What this whole tab is for:** For each regulator, it keeps a folder of exactly the proof that regulator would want — and it builds that folder automatically from what the other screens already produced.

**Why the CFO really cares:** When an inspector shows up, "audit-ready" means the folder is *already done*. No scrambling for weeks to gather paperwork — and it proves the company's controls were actually working.

### Piece 1 — The regulator picker (row of buttons)
- Six buttons: **Excise · SLSI · FCAU · Customs · CEA · Labour.** The one you pick is highlighted; a green "solid" tag sits on the right.
- **What it's telling you:** you can switch to see any one regulator's folder.
- **Why the CFO cares:** one click shows exactly what any regulator's folder contains.
- **The six regulators in plain words:**
  - **Excise** = the alcohol-tax department.
  - **SLSI** = Sri Lanka Standards Institution — checks products meet official quality standards.
  - **FCAU** = Food Control Administration Unit — checks food and drink safety.
  - **Customs** = handles taxes and paperwork for goods crossing the border (imports/exports).
  - **CEA** = Central Environmental Authority — checks the company isn't harming the environment.
  - **Labour** = the Department of Labour — checks worker safety and employment rules.

### Piece 2 — The list of proof items
- For the chosen regulator, a list of documents, each with a green tick, a name, and a small **"from C1/C2/C3"** tag showing which screen created it. For example, for Excise:
  - *Batch release + alcohol-strength record — B-2271* (from C2)
  - *Dispatch licence stamps — L-440 / L-441 / L-442* (from C3)
  - *Transport-permit vs sticker match — May 2026* (from C1)
- After you fix the problem on C1, a **new green-outlined row** appears here: *"Four-way check — May 2026"* (from C1).
- **What it's telling you:** the folder is built from documents made elsewhere in the system — and it grows by itself as you resolve issues.
- **Why the CFO cares:** full traceability — every piece of proof links back to the control that produced it.

### Piece 3 — The "folder ready" message
- A green banner: *"Pack ready — available instantly. By hand, this takes about weeks,"* with a grey "guess" tag.
- **What it's telling you:** the folder is ready on demand, versus weeks of manual work.
- **Why the CFO cares:** this is the headline time-saving of this screen.

### Piece 4 — The link to C6
- *"Every folder feeds into the monthly board report (C6)."*
- **What it's telling you:** these folders roll up into the board report.
- **Why the CFO cares:** proof flows straight into the board report with no re-typing.

---

# C5 — Risk Matrix + Exceptions

**Two plain-word definitions first:**
- **Risk matrix** = a table that lists the company's main risks and rates how serious each one is.
- **Exception** = a place where the company broke a rule (and what was done about it).

**What this whole tab is for:** The big-picture risk view on one page — the key numbers, the table of risks, the list of rule-breaks (and their fixes), and a grid showing how ready the company is for each regulator. It answers: "If every inspector walked in tomorrow, how would we look?"

**Why the CFO really cares:** this is the risk story for the board on a single page, with every number showing where it came from.

### Piece 1 — The six headline number tiles
A row of six key numbers, each with a label and a trust tag. The important ones are shown bigger:
1. **Monthly board pack — "multi-day → one-click"** (Lion to confirm) — the report now takes one click instead of days.
2. **Excise tax at risk — Rs 160–650M** (estimate) — alcohol tax being actively watched.
3. **Receivables under credit watch — Rs 4.07bn** (solid) — customer money being monitored.
4. **Regulators we're ready for — 6 / 6** (solid) — ready for all six inspectors.
5. **Senior staff-days saved per year — ~150–300** (guess) — time freed up for senior people.
6. **Time from problem to alert — "months → days"** (guess) — problems now get flagged far faster.
- **What it's telling you:** the value of the whole system in six numbers — time saved, risk controlled, inspection coverage.
- **Why the CFO cares:** these are the quick talking points for the board, each honestly tagged.
- **Plain words:** **KPI** = "Key Performance Indicator," just a headline number that shows how well something is doing.

### Piece 2 — The risk table
A table with columns: **Risk · Inherent · Control · Residual · KRI · Trend.** It lists five risks, such as:
1. **Global events & supply-chain problems** — high risk, brought down to medium.
2. **Local economy risk** — watched via "contingent liabilities" of Rs 3,514M.
3. **Tax & tariffs** — controlled by the Duty check — note: company tax rose from 40% to 45% on 1 Apr 2025.
4. **Customer-credit risk** — controlled by Dispatch — now low — customer money owed Rs 4.07bn and improving.
5. **Flood/business-interruption risk** — the plant is near a river; managed with insurance and training.
- **What the columns mean (plain words):**
  - **Inherent** = how bad the risk is *before* any safeguards (shown as "impact / likelihood" — how damaging, and how likely).
  - **Control** = the safeguard put in place.
  - **Residual** = how bad the risk is *after* the safeguards.
  - **KRI** = "Key Risk Indicator," the early-warning number being watched.
  - **Trend** = which way it's going (improving / worsening / stable).
- **What it's telling you:** for each risk: how big it is, what's being done about it, what's left, the warning number, and the direction.
- **Why the CFO cares:** it's the standard board risk language, but filled in from live data instead of an old spreadsheet.
- **More plain words:** **Contingent liabilities** = money the company *might* have to pay in the future (like bank guarantees). **"WATCH"** next to a number = it's still okay but being kept an eye on.

### Piece 3 — The escalation line
- A bar: *"Escalation — Risk register → Board → Quarterly ESG Committee."*
- **What it's telling you:** the path a risk follows to get the right people's attention. ("Escalation" = passing a problem up to higher levels. "Risk register" = the master list of risks. "ESG Committee" = a board group for Environmental, Social & Governance matters — basically responsibility and ethics.)
- **Why the CFO cares:** proves there's a clear, agreed route for handling risks.

### Piece 4 — The rule-break (exception) list
- Heading: *"Compliance exceptions · every governance rule tracked."* It shows the one rule-break this period:
  - **Rule 7.10.2(a) — Minimum number of independent directors** (verified). The gap was **"2 of 3 required"** (shown crossed out) → now **"Cured · compliant"** (green).
  - Details: when it was disclosed, the fix (a new independent director, Ajay Baliga, appointed 2 Feb 2024), when it was raised (Nov 2023), and when it was fixed (2 Feb 2024).
- Note: *"Governance health: green — the one issue this period was disclosed and fixed. The same record feeds the board report (C6)."*
- **What it's telling you:** the single governance slip this period, tracked all the way from spotted → reported → fixed.
- **Why the CFO cares:** shows rule-breaks aren't hidden — they're logged, openly reported, and closed, with the paper trail attached.
- **Plain words:**
  - **Compliance** = following the rules.
  - **Independent director** = a board member with no other ties to the company, there to give unbiased oversight.
  - **Rule 7.10 / Section-9** = corporate-governance rules from the Colombo Stock Exchange (the stock market where Lion is listed) about how a company must be run.
  - **Cured** = the problem has been fixed and the company follows the rule again.

### Piece 5 — The readiness grid ("if every inspector walked in tomorrow")
- A grid: rows are the four controls (**Duty, Quality, Dispatch, Evidence**), columns are the six regulators. Each square is a green tick (fine), an amber triangle (needs attention), or blank (doesn't apply).
- Below it, an amber note: **"1 item → Audit Committee"** with the detail *"Customs · Dispatch — expired-licence truckload L-442 flagged; being sorted manually."*
- **What it's telling you:** one simple colour grid showing how ready the company is across every regulator and control, with the single open item handed to the Audit Committee.
- **Why the CFO cares:** it's the ultimate "are we ready for inspection?" view — green almost everywhere, with the one exception clearly named and assigned.
- **Plain words:** **OK** = the control is working; **ATTENTION** = needs action; **NA** = "not applicable," that control doesn't apply to that regulator.

---

# C6 — Board Report  *(the other star screen)*

**What this whole tab is for:** It builds the entire monthly report for the board/audit committee in one click — the committees and what they do, the governance rule-checks, the risk table, and the closing sign-off — all pulled from the same live data. Then you can save it as a PDF or email it.

**Why the CFO really cares:** this is the big payoff. The report that normally takes several people several days to put together is now one click, and every number already shows its source. *The monthly grind becomes a quick review.*

### Before you click "Generate" — the intro card
- A file icon, the heading *"Monthly Audit-Committee Report · May 2026,"* a line saying *"The report builds itself from what the factory already produced,"* and a short note that everything comes from the live data.
- A row of numbered sections it will include: **1 Board-affairs statement · 2 Audit Committee · 3 RPT Review Committee · 4 Auditor sign-off.**
- A **"Generate report"** button (it briefly says "Assembling pack…" while working).
- **What it's telling you:** what the report will contain and that it assembles itself.
- **Why the CFO cares:** sets up the before-and-after — days of work versus one click.
- **Plain words:** **RPT** = "Related Party Transactions" — deals between the company and people/firms connected to it (like owners or directors), which need extra scrutiny to stay fair. **Auditor sign-off** = the outside auditor's statement that the accounts are okay.

### After you click — the finished report
It appears as a stack of cards:

#### Piece 1 — Report header + buttons
- Title *"Audit-Committee Report — May 2026,"* a line *"Lion Brewery (Ceylon) PLC · built from live data · ready for the board,"* and two buttons: **Export PDF** (save as a file) and **Email to committee** (each shows a quick confirmation pop-up).
- **Why the CFO cares:** the finished document, ready to send with one click.

#### Piece 2 — The board committees
- Heading *"Board committees,"* then one card per committee. ("Committee" = a small group of board members focused on one job.)
  - **Audit Committee** — its job: oversee the financial reports, internal checks, the audit, and following the law (the Companies Act of 2007 and the SEC Act of 2021). Members are listed.
  - **Remuneration Committee** — its job: set fair, clear pay rules for directors and the CEO. ("Remuneration" = pay.)
  - **Related Party Transactions Review Committee** — its job: make sure deals with connected parties are handled fairly.
  - **Nominations & Governance Committee** — its job: appoint and re-elect directors, plan succession, and shape how the company is run.
- Each card shows what the committee does (with a "verified" tag), who's on it, and *"Meetings this year: (to be confirmed)."*
- **What it's telling you:** each committee's purpose and members, with the meeting counts honestly flagged as still-to-confirm.
- **Why the CFO cares:** the governance part of the board report, pre-written and sourced, with open items clearly marked.
- **Plain words:** **Companies Act No. 07 of 2007** = Sri Lanka's main company law. **SEC Act No. 19 of 2021** = the law behind the Securities and Exchange Commission (the body that polices the stock market). **Carson Cumberbatch PLC** = Lion's parent company, through which some committee work is run.

#### Piece 3 — The governance rule-check
- It reuses the **same rule-break record from C5** (the independent-directors issue, now fixed), and notes the remaining rule lines are **OPEN** (still waiting for the FY2025 governance report).
- **What it's telling you:** the compliance section, driven by the *exact same* record used on C5 — so the two screens can never contradict each other.
- **Why the CFO cares:** guarantees the board report and the risk screen tell the same story.

#### Piece 4 — The risk table (reused from C5)
- A shorter version of the five risks from C5: each with its category, its leftover (residual) severity, its warning number, and its trend.
- **What it's telling you:** the C5 risk table, summarised for the board.
- **Why the CFO cares:** consistency — same risks, same ratings, same source.

#### Piece 5 — The closing sign-off
- A shield icon, *"Closing assurance"* (verified), the legal statement that the accounts follow the Companies Act, and a thank-you note to the committees and board.
- **What it's telling you:** the formal closing words that finish a board report.
- **Why the CFO cares:** the standard sign-off text, ready to approve. ("Assurance" = a formal statement that something has been checked and is fine.)

#### Piece 6 — Footer + "Regenerate"
- On the left, the tagline *"The monthly grind becomes a review."* On the right, a **"Regenerate"** button to rebuild the report if the data changes.
- **Why the CFO cares:** you can re-run the report any time the underlying numbers change.

---

## Why all the tabs are connected (the most important point)

Everything on this dashboard is powered by **one shared set of data.** So fixing something in one place updates everywhere automatically. Here's the chain when you fix the C1 problem:

1. You click **Reconcile** on **C1**, clearing the 500-pack gap. →
2. A new piece of proof is added to the **C4** Excise folder. →
3. The **C5** readiness grid turns its Excise·Duty square green, and green dots light up on the C4/C5/C6 tabs. →
4. The **C6** board report uses the same risk and rule-break records, so the board report instantly matches what you just fixed.

**The takeaway for the CFO:** you never fix the same thing twice, and the board report can never disagree with the working screens — because they're all reading the same data.

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

*Based on the screen code in `KeystonePrototype.tsx`. The figures here are the demo's sample data for May 2026; in real use the same fields are filled automatically from the company's systems and the government portals.*
