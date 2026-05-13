# ORI guided demo — speaking notes (live / Loom)

**Story title:** Mid-Cycle Vendor Seat Reduction → AML L1 Backlog → Conditional PAC Approval  
**Runtime:** about 5 minutes if you move briskly; 7–8 minutes with pauses for questions.  
**How to start:** Open **Indian Banking Audit** → top bar → **▶ Run guided demo**. Use **Next →** / **← Back**; **Escape** or **Exit demo** cleans up (drawer closes, demo state resets).

**Entity trail (keep visible for yourself):** Risk **R-FC-001** → KRI **KRI-FC-001** → Incident **INC-2026-ORI-002** → RCA **RCA-2026-ORI-02** → Preventive actions **PA-2026-ORI-02** (blocks PAC) & **PA-2026-ORI-15** → PAC note **PACN-2026-002** → Loss event **LEV-2026-002** (linked in the loss register where applicable).

---

## Opening (15 seconds)

You are looking at **Indian Banking Audit** for an Indian private-sector bank: one spine from **posture** through **KRIs**, **incidents**, **RCA**, **PAC governance**, and back to the **executive heartbeat**, ending on **“what changed this week.”** This is demo data only; the point is to show how a single operational story stays traceable across screens without anyone re-keying narrative in slides.

---

## Act I — CRO: something is wrong (Steps 1–4)

**Step 1 — Risk posture**  
Frame the CRO view: residual risk in **amber**, **KRI breach rate** called out on the tile, and **critical incidents** in the weekly strip. Say in one line: “This is the board pack view before anyone opens a workbook.”

**Step 2 — KRI monitoring**  
The demo scrolls to **KRI-FC-001** (AML alert latency). Explain **three weeks of deterioration** and an **early-April breach** window—this is the early signal that something operational is drifting, not yet a headline loss.

**Step 3 — Incident register**  
Note the guided filter: **last 30 days**, **operational_loss**. The incident tied to that KRI breach is in the list. Invite the audience to imagine their own taxonomy: same mechanics, different labels.

**Step 4 — Incident drawer**  
The drawer opens on **INC-2026-ORI-002**: **124 alerts** past SLA after a **mid-cycle BPO seat cut**, owner **SM-FCC-001**, **no booked net loss** in the row but **regulatory timeliness exposure**. Close by saying: “ORM does not wait for a P&L hit to treat this as material.”

---

## Act II — Head of ORM: cause, actions, and the PAC punchline (Steps 5–7)

**Step 5 — RCA workspace**  
Persona switches to **Head of ORM / compliance**. Walk **RCA-2026-ORI-02**: **5 whys** land on **vendor contract change**; **two preventive actions** are logged, and one is explicitly flagged as **blocking PAC** until it is closed.

**Step 6 — PAC note approvals**  
Open **PACN-2026-002** (STR / PMLA workflow capacity note). Scroll attention to the **blocking preventive actions** panel: **Approve** stays disabled while an open blocker exists; **conditional approval** is the realistic path. This is the “so what” for 2LoD: operational remediation **directly gates** policy and procedure sign-off.

**Step 7 — Close the loop (simulated)**  
Back on the RCA, the demo **highlights the blocking PA** and flashes a **“Mark closed”** toast **without mutating** the underlying mock—so repeat demos stay stable. Narrate: “In production, evidence upload and status change would lift the PAC block; here we only **simulate** closure for the storyline.”

---

## Act III — CRO again + narrative automation (Steps 8–9)

**Step 8 — Risk posture**  
Return to the CRO persona. Tie the loop verbally: fewer blocked PACs in the **ORM heartbeat** once the PA is closed (in production the KPI would move; with static mock data, **sell the intent**, not the delta).

**Step 9 — What changed this week**  
End on the **auto-drafted weekly narrative**: same incident, same RCA, same PAC blockage called out as the week’s material thread—what you would attach to a BRMC pack or send to regulators as context, not as a substitute for formal returns.

**Closing line**  
“Five minutes, one ID chain, no slide deck assembly—that is the outreach story for **OPRISK India** peer sessions and the **Loom** link for ‘show me the product.’”

**Replay:** On the last step, use **Replay** to jump back to step 1 for a second take without refreshing the page.
