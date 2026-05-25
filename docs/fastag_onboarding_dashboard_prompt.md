# FASTag Customer Onboarding — Single-Page Dashboard Prompt

---

## What You Are Building

A **single-page interactive onboarding dashboard** for a new FASTag customer.

This is NOT a multi-page wizard. It is NOT a documentation viewer.

It is a **living dashboard** — the entire 6-step onboarding journey is visible on one screen at all times. The left panel shows the full journey map with status. The right panel shows the active step's form/content. Completing a step updates both panels simultaneously without a page reload.

The customer should always be able to see:
- Where they are in the process
- What they have already completed
- What is coming next
- Their FASTag profile building up in real time as they fill in data

---

## Aesthetic Direction

**Theme:** Dark navy + deep slate. Financial-grade. Confident, not playful.

**Typography:**
- Display / headings: `Syne` (Google Fonts) — geometric, authoritative
- Body / labels: `DM Sans` — clean, readable at small sizes
- Monospace / tag IDs: system monospace

**Color system (CSS variables):**
```css
--navy:         #0a1628;   /* page background */
--navy-mid:     #112240;   /* panel backgrounds */
--navy-light:   #1d3461;   /* card backgrounds */
--orange:       #f97316;   /* primary accent — FASTag brand */
--orange-light: #fb923c;   /* hover states */
--teal:         #0ea5e9;   /* info, NETC references */
--green:        #10b981;   /* success, completed steps */
--amber:        #f59e0b;   /* warnings, Min KYC */
--red:          #ef4444;   /* errors, failures */
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted:   #475569;
--border:       rgba(255,255,255,0.08);
```

**Background texture:** Radial gradient mesh — orange glow top-left, teal glow bottom-right, both at 7% opacity over the navy base.

**Motion:** Step transitions animate with `translateY(12px) → 0` + `opacity 0 → 1` over 300ms ease. Completed step icons pop with a scale keyframe. Progress bar fill animates width on completion.

**What makes it unforgettable:** The FASTag card in the right column builds itself in real time — as the user fills in each step, the physical card visual (tag ID, VRN, wallet balance, KYC badge) populates with a subtle highlight flash. The customer is watching their FASTag come to life.

---

## Page Layout (Single Screen)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GLOBAL HEADER                                                          │
│  [FASTag Logo]  "New Customer Onboarding"          [NETC/NPCI badge]    │
├──────────────────────┬──────────────────────────────────────────────────┤
│                      │                                                  │
│   LEFT PANEL         │   RIGHT PANEL                                    │
│   (Journey Map)      │   (Active Step Content)                          │
│   ~30% width         │   ~70% width                                     │
│                      │                                                  │
│   • FASTag Card      │   Step form / checklist / summary                │
│     (live-builds)    │   Inline validation                              │
│                      │   Alerts & warnings                              │
│   • Step Timeline    │   Action buttons                                 │
│     1. Eligibility   │                                                  │
│     2. Identity      │                                                  │
│     3. KYC           │                                                  │
│     4. Wallet        │                                                  │
│     5. Tag Issue     │                                                  │
│     6. Activate      │                                                  │
│                      │                                                  │
│   • Compliance bar   │                                                  │
│                      │                                                  │
└──────────────────────┴──────────────────────────────────────────────────┘
```

**Responsive behavior:** On mobile (<768px), left panel collapses to a horizontal step strip at the top. Right panel fills the screen.

---

## Left Panel — Specification

### 1. FASTag Card (top of left panel)

A visual representation of the physical FASTag — styled like a credit card with an RFID chip. Starts empty/greyed. Populates field by field as steps complete.

```
┌───────────────────────────────┐
│  [RFID icon]    FASTag        │
│                               │
│  Tag ID:  FT-2026-XXXXXXX     │  ← populates on Step 5
│  Vehicle: TN01AB1234          │  ← populates on Step 2
│  Balance: ₹500                │  ← populates on Step 4
│  [ACTIVE badge]               │  ← populates on Step 6
│                               │
│  KYC: MIN · Wallet: ₹10,000   │  ← populates on Step 3
└───────────────────────────────┘
```

Fields that are not yet filled show a soft shimmer placeholder (not blank, not "N/A"). When a field populates, it flashes orange → settles to white.

### 2. Step Timeline (below the card)

A vertical timeline. Each step is a node.

**Node states:**
- `pending` — hollow circle, muted label, no action
- `active` — filled orange circle with pulse ring, bold label, "In Progress" micro-label
- `done` — green circle with checkmark, label struck-through softly, timestamp shown
- `blocked` — red circle, shown only if a step has a hard error (e.g. OV1T conflict)

**Node content (each step):**
```
● Step name
  Sub-label (dynamic — changes based on state)
  e.g. "done" → "Completed 10:23 AM"
       "active" → "Fill in your details"
       "pending" → "Complete previous step first"
       "blocked" → "Vehicle has existing FASTag"
```

Clicking a completed step node scrolls the right panel back to that step for review (read-only).

### 3. Compliance Bar (bottom of left panel)

A small strip showing live compliance status. Updates as steps complete.

```
OV1T      [✓ CLEAR]
KYC       [⏳ Pending]
Wallet    [✓ ₹500 Loaded]
NETC Map  [— Not yet]
```

Each item is a pill: green (✓), amber (⏳), red (✗), grey (—).

---

## Right Panel — Step Content Specification

### Step 1: Eligibility Check

**Header:** "Before we begin" / "Confirm you're ready for FASTag"

**Content:** Interactive checklist — 5 items, each a clickable card row.

```
Items:
  □ I own a registered motor vehicle in India
    Sub: Private car, commercial vehicle, etc.

  □ I have a valid RC (Registration Certificate)
    Sub: Original or photocopy accepted

  □ I have a government-issued photo ID
    Sub: Aadhaar / PAN / Passport / Voter ID

  □ I have an active Indian mobile number
    Sub: Needed for OTP verification

  □ My vehicle does not already have an active FASTag
    Sub: One Vehicle One FASTag (OV1T) — NPCI rule
```

**Logic:** All 5 must be checked for "Continue" to enable.

**If item 5 is unchecked:** Show inline alert:
> ⚠️ OV1T Rule: If your vehicle has an existing FASTag, it must be deactivated at your current issuing bank before proceeding. [Learn how →]

**CTA:** `[Continue →]` (disabled until all 5 checked)

---

### Step 2: Personal & Vehicle Details

**Header:** "Tell us about you and your vehicle"

**Layout:** Two-column form grid.

**Personal section:**
- Full Name (as on ID) — text
- Mobile Number — with `[Send OTP]` button inline
- OTP Field — 6-digit input, 30s countdown, resend link
- Email Address — text
- Date of Birth — date picker

**Vehicle section (after OTP verified):**
- Vehicle Registration Number (VRN) — with inline NETC check on blur
  - Loading state: "Checking NETC mapper…"
  - Success state: ✓ "Vehicle is clear for FASTag issuance"
  - Error state: ✗ "Active FASTag found. Deactivate first."
- Vehicle Class — dropdown (Class 4 / 5 / 7 / 12 / MAV)
- Vehicle Make & Model — text
- Engine Number — text (from RC)

**Left panel update on completion:** VRN populates on the FASTag card. OV1T shows ✓ CLEAR in compliance bar.

**Validation rules:**
- VRN format: `[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}` — inline error on blur
- Mobile: 10 digits, starts with 6–9
- OTP: 6 digits, 5-minute expiry

---

### Step 3: KYC Completion

**Header:** "Complete your KYC"

**Sub-header:** "Required by RBI for all FASTag wallets."

**KYC type selector — two large cards side by side:**

```
┌──────────────────────┐  ┌──────────────────────┐
│  Minimum KYC         │  │  Full KYC            │
│  Wallet: ₹10,000     │  │  Wallet: ₹1,00,000   │
│                      │  │                      │
│  • Mobile OTP only   │  │  • Aadhaar + PAN     │
│  • Valid: 12 months  │  │  • Valid: 10 years   │
│  • Quick (2 min)     │  │  • Required for fleets│
│                      │  │                      │
│  [Select]            │  │  [Select]            │
└──────────────────────┘  └──────────────────────┘
```

Selected card highlights with orange border.

**Form fields (Full KYC):**
- Aadhaar Number — masked, triggers eKYC OTP
- PAN Number — uppercase, 10 char
- Address — auto-fill from Aadhaar eKYC if consented

**Inline alerts:**
- ✅ Info: "Your KYC is submitted to CKYCRR — no re-KYC needed for future banking products."
- ⚠️ Warning: "Min KYC expires in 12 months. You'll be reminded 30 days before."

**Left panel update on completion:** KYC badge populates on card. Compliance bar KYC shows ✓.

---

### Step 4: Load Your Wallet

**Header:** "Add money to your FASTag wallet"

**Wallet preview (mini card):**
```
FASTag Wallet
₹ [live-updating amount]
Limit: ₹10,000 (Min KYC)
```

**Quick amount buttons:** ₹200 / ₹500 (highlighted) / ₹1,000 / Custom

**Custom input:** Number field, ₹100 minimum, real-time limit check.

**Payment method selector:**
- UPI (GPay / PhonePe / Paytm)
- Net Banking
- Debit / Credit Card
- NEFT / RTGS (₹5,000+)

**Inline alerts:**
- ℹ️ "Enable auto-recharge after activation so you're never stuck at a toll."
- ⚠️ "Keep ₹200+ to avoid toll failures. Insufficient balance = declined transaction."

**Left panel update:** Balance populates on the FASTag card with a green flash. Compliance bar Wallet shows ✓.

---

### Step 5: Tag Issuance & Fitment

**Header:** "Your FASTag is being issued"

**Tag visual (animated):**
Show the FASTag sticker graphic (orange rectangle, RFID symbol, barcode lines) with a "Generating…" shimmer, then resolves to the actual Tag ID.

**Issuance channels — 4 option cards:**
```
🏦 Bank Branch     🏬 Partner Outlet     🛒 E-Commerce     🚗 Home Delivery
Visit nearest      NHAI toll plazas,     Amazon/Flipkart   Bank courier,
branch for         petrol stations       delivery, self-   fitment guide
in-person fitment                        fitment guide     included
```

**Fitment checklist (interactive, all must be confirmed):**
- ☐ Tag placed on inner side of windshield
- ☐ Top-center, behind rear-view mirror
- ☐ No metallic film or tint over the tag area
- ☐ Tag is undamaged, not torn or tampered

**Fitment diagram:** SVG of car silhouette (top-down view) with the correct placement zone highlighted in orange. Red X zones on dashboard and doors.

**Critical alert:**
> 🚫 Never transfer your FASTag to another vehicle. Tag cloning is fraud under NPCI guidelines and permanently blacklists your tag and wallet.

**Left panel update:** Tag ID populates on the FASTag card.

---

### Step 6: Review & Activate

**Header:** "Everything looks good. Let's activate."

**Summary table — all collected data:**

| Field | Value |
|---|---|
| Full Name | Ravi Kumar |
| Mobile | +91 98765 43210 |
| Vehicle Number | TN01AB1234 |
| Vehicle Class | Class 4 |
| KYC Level | Minimum KYC |
| Wallet Balance | ₹500.00 |
| Tag ID | FT-2026-TN1234567 |
| Wallet Limit | ₹10,000 |

**Post-activation timeline (vertical, 4 nodes):**
1. ✅ NETC central mapper registration — Instant
2. ⟳ Live at all toll plazas — Within 30 minutes
3. ○ First transaction settlement — T+1 business day
4. ○ Monthly statement to email — 1st of every month

**Legal consent line:**
> By activating, you agree to NPCI FASTag Terms of Service and [Bank Name]'s wallet agreement.

**CTA:** `[🚀 Activate FASTag]` — large, green, full-width

**On activation:** Left panel FASTag card shows ACTIVE badge (green, pulsing for 3s). All compliance bar items turn green. Right panel transitions to success state.

---

### Success State (replaces Step 6 content after activation)

**Content:**
- Large animated checkmark (stroke animation)
- "Your FASTag is live!" heading
- Tag ID prominently shown
- Wallet balance shown
- SMS confirmation note

**Next action cards (3 cards):**
```
⬆️ Upgrade to Full KYC          🔄 Enable Auto-Recharge       📱 Download FASTag App
Increase wallet limit            Never get stuck at a toll      Manage your tag on mobile
to ₹1,00,000                    with auto top-up
[Upgrade Now]                    [Set Up]                      [Download]
```

---

## Interactions & State Management

### Global state object (vanilla JS or React useState):

```javascript
const state = {
  currentStep: 1,          // 1–6
  completedSteps: [],       // [1, 2, 3...]
  blockedSteps: [],         // e.g. [2] if OV1T conflict

  customer: {
    name: '', mobile: '', email: '', dob: ''
  },
  vehicle: {
    vrn: '', class: '', make: '', engine: '',
    ovtStatus: null         // null | 'CLEAR' | 'CONFLICT'
  },
  kyc: {
    type: null,             // 'MIN' | 'FULL'
    status: null,           // 'PENDING' | 'VERIFIED'
    aadhaar: '', pan: ''
  },
  wallet: {
    amount: 0,
    paymentMethod: null,
    status: null            // null | 'LOADED'
  },
  tag: {
    tagId: null,
    fitmentConfirmed: false
  },
  activated: false
};
```

### Key interaction rules:

- **Step navigation:** Can always go BACK. Can only go FORWARD when current step is valid.
- **Completed steps:** Clicking a completed step in the left timeline scrolls to it in read-only mode. A pencil icon allows re-editing (with a warning that later steps may reset).
- **FASTag card updates:** On every state change that adds a new piece of data, the corresponding card field flashes orange → white over 600ms.
- **Compliance bar:** Updates immediately on each relevant state change. Never requires a full step completion to update.
- **Error recovery:** Errors never block the UI — they show inline with a clear fix action. No modal dialogs.

---

## Dummy Data for Immediate Render

Seed the UI with this demo data so it renders meaningfully without any backend:

```javascript
const demoData = {
  customer: {
    name: "Ravi Kumar",
    mobile: "9876543210",
    email: "ravi@example.com",
    dob: "1990-04-15"
  },
  vehicle: {
    vrn: "TN01AB1234",
    class: "4",
    make: "Maruti Suzuki Swift",
    engine: "K12MN1234567",
    ovtStatus: "CLEAR"
  },
  kyc: {
    type: "MIN",
    status: "VERIFIED",
    aadhaar: "XXXX-XXXX-1234",
    pan: "ABCDE1234F"
  },
  wallet: {
    amount: 500,
    paymentMethod: "UPI",
    status: "LOADED"
  },
  tag: {
    tagId: "FT-2026-TN1234567",
    fitmentConfirmed: false
  },
  activated: false
};
```

Start the demo at Step 5 so the left panel's FASTag card shows 4 out of 6 fields populated — immediately demonstrating the "building in real time" concept.

---

## Component Hierarchy

```
<App>
  ├── <GlobalHeader>
  │     ├── Logo
  │     ├── Title "New Customer Onboarding"
  │     └── NetcBadge
  │
  ├── <DashboardLayout>
  │     ├── <LeftPanel>
  │     │     ├── <FasTagCard state={state} />
  │     │     ├── <StepTimeline steps={steps} current={currentStep} />
  │     │     └── <ComplianceBar state={state} />
  │     │
  │     └── <RightPanel>
  │           ├── <StepHeader step={currentStep} />
  │           ├── <StepContent step={currentStep} state={state} />   ← switches
  │           └── <StepNavigation onNext onBack />
  │
  └── <ToastContainer />   ← for success flashes, OTP confirmations
```

**Step content components:**
```
<EligibilityStep />
<IdentityStep />
<KycStep />
<WalletStep />
<IssuanceStep />
<ActivationStep />
<SuccessState />
```

**Shared components:**
```
<ChecklistItem checked label sublabel onToggle />
<KpiCard label value delta color />
<AlertStrip type="info|warn|error|success" message />
<FormField label placeholder validate />
<StatusPill status="done|active|pending|blocked" />
<FasTagCardField label value populated />
```

---

## Output Specification

Generate a **single self-contained HTML file** with:

- Inline CSS (no external stylesheet files, use Google Fonts CDN only)
- Vanilla JavaScript (no framework required — vanilla JS is preferred for simplicity)
- All 6 steps fully navigable
- FASTag card that updates as steps complete
- Compliance bar that updates live
- Step timeline with all node states (done / active / pending / blocked)
- Dummy data pre-loaded (start at Step 5 for demo impact)
- Success state after Step 6 activation
- No placeholder images — use SVG/CSS for all visuals
- Fully functional without any backend (all validation is client-side)
- Must render correctly in a browser or sandbox without any build step

**Quality bar:** Paste into any browser → works. No console errors. No broken layouts. No placeholder text like "Lorem ipsum" or "TODO".

---

## Self-Review Checklist

Before outputting, verify every item:

```
[ ] Left panel always visible — never hidden or collapsed on desktop
[ ] FASTag card populates field-by-field as steps complete (with flash animation)
[ ] Compliance bar shows live OV1T / KYC / Wallet / NETC status
[ ] Step timeline shows done / active / pending / blocked states
[ ] Every step has at least one inline alert (info, warning, or error)
[ ] OV1T rule is surfaced in Step 1 checklist AND Step 2 VRN field
[ ] KYC wallet limits (₹10K / ₹1L) visible before user selects KYC type
[ ] T+1 settlement lag shown in activation timeline (Step 6)
[ ] Fitment checklist in Step 5 is interactive (not static text)
[ ] Tag cloning warning is prominent in Step 5
[ ] Back navigation works from every step
[ ] Completed steps are clickable in timeline (read-only review)
[ ] Success state shows next-action cards (upgrade KYC, auto-recharge, app)
[ ] Demo starts at Step 5 with card partially populated
[ ] No console errors, no broken layout, no Lorem ipsum
[ ] Fonts load from Google CDN (Syne + DM Sans)
[ ] Entire page fits without horizontal scroll on 1280px desktop
```
