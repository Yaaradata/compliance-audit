import type { CarbonLensBlock } from "./types";
import { attachCarbonLensDrills } from "./carbon-lens-drills";

/** Deep-drill mock slices for Carbon Lens (FY24–25 illustrative, consistent with bankScope3MockData totals). */
const carbonLensBlockBase: CarbonLensBlock = {
  portfolioIntro:
    "Category 15 (financed emissions) dominates Bharatiya Axis Bank Ltd’s Scope 3 footprint. Carbon Lens reconciles PCAF asset-class attributions to the **~417.4 Mt** executive roll-up; wholesale corporate tiles below are **business-loan slices** that sum to the **~198 Mt** business-loans line, not the full bank total.",
  financed: {
    portfolio_overview: {
      leaf: "portfolio_overview",
      title: "Portfolio overview — financed emissions",
      narrative:
        "Consolidated Category 15 view across all asset classes. Weighted PCAF score and coverage drive assurance readiness; NZBA alignment gaps are concentrated in power, steel, and listed hydrocarbon sleeves.",
      methodology: "PCAF Financial Institutions Standard v2 — attributed share of borrower Scope 1+2 (where available) plus asset-class proxies.",
      pcafBand: "Weighted 3.4 (amber)",
      assetClassIds: ["bl", "eq", "pf", "mrt", "veh", "tf", "sme", "sov"],
      kpis: [
        { label: "Attributed financed tCO₂e", value: "417.36 Mt", hint: "FY24–25 close", trendPct: 2.1 },
        { label: "WACI", value: "673 tCO₂e / ₹cr", trendPct: -0.8 },
        { label: "PCAF coverage", value: "58.2%", trendPct: 4.6 },
        { label: "High+med. climate risk ₹cr", value: "1,84,200", trendPct: 3.4 },
      ],
      lineItems: [
        { id: "fe-po-1", label: "Business loans & unlisted equity", metric1: "₹2,18,400 cr", metric2: "198.42 Mt", metric3: "PCAF 3.1", risk: "High", detail: "Sector concentration — power & steel" },
        { id: "fe-po-2", label: "Listed equity & bonds", metric1: "₹1,40,000 cr", metric2: "112.60 Mt", metric3: "PCAF 2.4", risk: "Medium", detail: "Oil & gas sleeve vs NZBA pathway" },
        { id: "fe-po-3", label: "Project finance", metric1: "₹48,600 cr", metric2: "54.88 Mt", metric3: "PCAF 3.6", risk: "High", detail: "Infra & thermal exposure review" },
        { id: "fe-po-4", label: "Retail — housing + vehicles", metric1: "₹1,69,200 cr", metric2: "22.46 Mt", metric3: "PCAF 4.1", risk: "Medium", detail: "Label coverage & ICE fleet share" },
        { id: "fe-po-5", label: "SME + trade + sovereign", metric1: "₹73,800 cr", metric2: "28.76 Mt", metric3: "PCAF 4.2", risk: "Medium", detail: "Sparse primary data on SME & LC" },
      ],
    },
    corporate_loans: {
      leaf: "corporate_loans",
      title: "Corporate loans & unlisted equity",
      narrative:
        "Wholesale book — attributed emissions from borrower-reported or estimated Scope 1+2, allocated by economic share. **~198 Mt** here is the business-loan & unlisted equity sleeve only; **Sectors / GHG** show the full **~417 Mt** financed inventory including bonds, project finance, and retail.",
      methodology: "PCAF Option 1 + revenue-based proxies for non-reporting borrowers.",
      pcafBand: "3.1",
      assetClassIds: ["bl"],
      kpis: [
        { label: "Outstanding", value: "₹2,18,400 cr" },
        { label: "Attributed tCO₂e", value: "198.42 Mt", trendPct: 1.8 },
        { label: "Borrowers (active)", value: "4,200", hint: "Corporate names on risk system" },
        { label: "Coverage with primary data", value: "62%", trendPct: 5.2 },
      ],
      lineItems: [
        { id: "cl-1", label: "Power & utilities sleeve", sublabel: "186 relationships · BL attribution", metric1: "₹42,800 cr", metric2: "77.9 Mt (BL)", metric3: "Sector total 159.8 Mt", risk: "High" },
        { id: "cl-2", label: "Steel & metals", sublabel: "264 relationships · BL attribution", metric1: "₹31,200 cr", metric2: "48.0 Mt (BL)", metric3: "Sector total 98.5 Mt", risk: "High" },
        { id: "cl-3", label: "Real estate & construction", sublabel: "512 relationships · BL attribution", metric1: "₹28,600 cr", metric2: "12.0 Mt (BL)", metric3: "Sector total 24.6 Mt", risk: "Medium" },
        { id: "cl-4", label: "Chemicals & petrochemicals", sublabel: "96 relationships · BL attribution", metric1: "₹16,800 cr", metric2: "10.8 Mt (BL)", metric3: "Sector total 22.1 Mt", risk: "High" },
        { id: "cl-5", label: "Other diversified corporate", sublabel: "Balance of book", metric1: "₹98,800 cr", metric2: "49.7 Mt", metric3: "Blended proxy", risk: "Medium" },
      ],
    },
    project_finance: {
      leaf: "project_finance",
      title: "Project finance",
      narrative:
        "Economic-share attribution at facility level for infra, renewables, and thermal generation. Data quality improves where independent engineer reports exist.",
      methodology: "PCAF project finance methodology — construction vs operation phase split.",
      pcafBand: "3.6",
      assetClassIds: ["pf"],
      kpis: [
        { label: "Outstanding", value: "₹48,600 cr" },
        { label: "Attributed tCO₂e", value: "54.88 Mt", trendPct: -1.4 },
        { label: "Renewables share of PF emissions (avoided)", value: "18%", hint: "WesternWind cluster" },
        { label: "Thermal / grid-linked watch", value: "High concentration", hint: "Engagement queue" },
      ],
      lineItems: [
        { id: "pf-1", label: "WesternWind Renewables — hybrid solar-wind", metric1: "₹3,800 cr", metric2: "0.18 Mt", metric3: "PCAF 1", risk: "Low", detail: "NZBA-aligned" },
        { id: "pf-2", label: "Eastern Grid Power — supercritical coal", metric1: "₹5,200 cr", metric2: "16.5 Mt", metric3: "PCAF 2", risk: "High" },
        { id: "pf-3", label: "Konkan Cement — clinker line", metric1: "₹2,800 cr", metric2: "0.81 Mt", metric3: "PCAF 3", risk: "Medium" },
        { id: "pf-4", label: "Port & logistics corridor", metric1: "₹1,400 cr", metric2: "0.42 Mt", metric3: "PCAF 4", risk: "Medium" },
      ],
    },
    retail_loans: {
      leaf: "retail_loans",
      title: "Retail loans — housing & vehicles",
      narrative:
        "Mortgages use built-environment energy-label proxies; vehicle book uses fleet mix and fuel efficiency factors. Retail is material in exposure count but small in attributed tCO₂e vs wholesale.",
      methodology: "PCAF residential real estate + motor vehicle methods; India grid factors CEA 2024.",
      pcafBand: "4.1 blended",
      assetClassIds: ["mrt", "veh"],
      kpis: [
        { label: "Mortgage outstanding", value: "₹1,28,000 cr" },
        { label: "Vehicle loans", value: "₹41,200 cr" },
        { label: "Combined attributed tCO₂e", value: "22.46 Mt", trendPct: 5.2 },
        { label: "Retail accounts", value: "23.0 Lac", hint: "Active loan accounts" },
      ],
      lineItems: [
        { id: "rl-1", label: "Green-rated housing pool (A+ label+)", metric1: "₹18,400 cr", metric2: "1.1 Mt", metric3: "Label coverage 41%", risk: "Low" },
        { id: "rl-2", label: "Unlabelled housing — metro", metric1: "₹62,000 cr", metric2: "8.9 Mt", metric3: "Proxy EF", risk: "Medium" },
        { id: "rl-3", label: "EV / hybrid auto book", metric1: "₹6,200 cr", metric2: "0.31 Mt", metric3: "Improving mix", risk: "Low" },
        { id: "rl-4", label: "ICE passenger & two-wheeler", metric1: "₹35,000 cr", metric2: "9.3 Mt", metric3: "Fleet proxy", risk: "Medium" },
      ],
    },
    msme_loans: {
      leaf: "msme_loans",
      title: "MSME loans",
      narrative:
        "High count, smaller ticket — emissions estimated via revenue-based physical asset proxies until borrower questionnaires roll out nationally.",
      methodology: "PCAF SME — physical activity proxy + sector EEIO where disclosed revenue available.",
      pcafBand: "4.6",
      assetClassIds: ["sme"],
      kpis: [
        { label: "Outstanding", value: "₹31,800 cr" },
        { label: "Attributed tCO₂e", value: "11.82 Mt", trendPct: 2.0 },
        { label: "Primary data coverage", value: "27%", trendPct: 3.1 },
        { label: "Borrowers", value: "1,840", hint: "CGTMSE + standard SME" },
      ],
      lineItems: [
        { id: "ms-1", label: "MSME Packwell Cluster", metric1: "₹420 cr", metric2: "0.062 Mt", metric3: "PCAF 4", risk: "Medium" },
        { id: "ms-2", label: "Tier-2 manufacturing basket", metric1: "₹8,600 cr", metric2: "3.1 Mt", metric3: "Proxy", risk: "Medium" },
        { id: "ms-3", label: "Agro-processing MSME", metric1: "₹4,200 cr", metric2: "1.4 Mt", metric3: "Mixed", risk: "Low" },
      ],
    },
    trade_finance: {
      leaf: "trade_finance",
      title: "Trade finance",
      narrative:
        "Letters of credit and guarantees mapped to counterparty sectors and commodity intensities. Volatility linked to commodity price and shipping routes.",
      methodology: "PCAF trade finance — facilitated emissions factor set v2025.03.",
      pcafBand: "4.4",
      assetClassIds: ["tf"],
      kpis: [
        { label: "Outstanding / facilitated", value: "₹22,400 cr" },
        { label: "Attributed tCO₂e", value: "8.14 Mt", trendPct: 0.9 },
        { label: "Coverage", value: "31%" },
        { label: "Top commodity sleeve", value: "Metals & ores", hint: "LC book" },
      ],
      lineItems: [
        { id: "tf-1", label: "Steel & ores — Singapore counterparty", metric1: "₹4,200 cr", metric2: "2.1 Mt", metric3: "Score 4", risk: "High" },
        { id: "tf-2", label: "Agri commodities — domestic", metric1: "₹3,800 cr", metric2: "0.9 Mt", metric3: "Score 4", risk: "Low" },
        { id: "tf-3", label: "BlueHarbor Shipping — bunker linked", metric1: "₹1,100 cr", metric2: "0.17 Mt", metric3: "Score 4", risk: "Medium" },
      ],
    },
    investment_portfolio: {
      leaf: "investment_portfolio",
      title: "Investment portfolio — listed & sovereign",
      narrative:
        "Listed equity and bonds use EVIC attribution; sovereign bonds use PCAF sovereign pathway. Treasury ALCO reviews concentration vs climate scenarios quarterly.",
      methodology: "PCAF listed equity & debt + sovereign bonds.",
      pcafBand: "2.7 blended",
      assetClassIds: ["eq", "sov"],
      kpis: [
        { label: "Listed book", value: "₹1,40,000 cr" },
        { label: "Sovereign bonds", value: "₹19,600 cr" },
        { label: "Combined attributed tCO₂e", value: "121.8 Mt", trendPct: 2.6 },
        { label: "Data quality (weighted)", value: "PCAF 2.5", hint: "Better disclosure than wholesale" },
      ],
      lineItems: [
        { id: "ip-1", label: "Listed OilCo Holdings sleeve", metric1: "₹4,800 cr", metric2: "0.89 Mt", metric3: "High carbon tilt", risk: "High" },
        { id: "ip-2", label: "Nifty climate index replication", metric1: "₹12,400 cr", metric2: "4.2 Mt", metric3: "Score 2", risk: "Low" },
        { id: "ip-3", label: "G-Sec & SDL — general government", metric1: "₹19,600 cr", metric2: "9.2 Mt", metric3: "Sovereign PCAF", risk: "Low" },
      ],
    },
  },
  ownOperations: {
    business_travel: {
      leaf: "business_travel",
      title: "Business travel",
      narrative: "Scope 3 Category 6 — emissions from employee and guest travel for client meetings, training, and board-related travel.",
      scope3CategoryLabel: "Category 6 — Business travel",
      tCO2e: 28400,
      pctOfScope12And3NonFinanced: 38,
      methodology: "DEFRA 2024 factors × airline RPK from T&E system; rail & road from invoice distance.",
      dataQuality: "Secondary (carrier-level)",
      yoyPct: -4.2,
      spendOrActivityINRCr: 186,
      notes: "Post-COVID hybrid policy capped international business class; domestic rail substitution pilot in FY25 H2.",
      kpis: [
        { label: "tCO₂e (FY25)", value: "28,400", trendPct: -4.2 },
        { label: "T&E spend (proxy)", value: "₹186 cr" },
        { label: "Data quality", value: "Secondary" },
        { label: "Branches with travel policy", value: "100%" },
      ],
      lineItems: [
        { id: "bt-1", label: "International air — long haul", metric1: "14,200 t", metric2: "₹62 cr T&E", metric3: "Top routes: LHR, SIN", risk: "Medium" },
        { id: "bt-2", label: "Domestic air", metric1: "9,800 t", metric2: "₹48 cr", metric3: "Delhi–Mumbai trunk", risk: "Low" },
        { id: "bt-3", label: "Rail + road reimbursements", metric1: "4,400 t", metric2: "₹76 cr", metric3: "Mileage claims", risk: "Low" },
      ],
    },
    employee_commuting: {
      leaf: "employee_commuting",
      title: "Employee commuting",
      narrative: "Scope 3 Category 7 — home-to-work emissions for India branch and office network, blended survey and proxy fill.",
      scope3CategoryLabel: "Category 7 — Employee commuting",
      tCO2e: 19800,
      pctOfScope12And3NonFinanced: 26,
      methodology: "Hybrid survey (42% response) + India metro mode-share defaults for gaps.",
      dataQuality: "Spend + survey hybrid",
      yoyPct: 1.1,
      notes: "Bangalore & Mumbai hubs drive two-wheeler + metro mix; WFH 2.1 days/week corporate policy applied.",
      kpis: [
        { label: "tCO₂e", value: "19,800", trendPct: 1.1 },
        { label: "Survey response", value: "42%" },
        { label: "WFH days / week", value: "2.1" },
        { label: "FTE in scope", value: "1,85,000" },
      ],
      lineItems: [
        { id: "ec-1", label: "Metro cities — survey-based", metric1: "11,200 t", metric2: "1,85,000 FTE share", metric3: "Response 44%", risk: "Low" },
        { id: "ec-2", label: "Tier-2/3 branches — proxy", metric1: "6,100 t", metric2: "2,400 branches", metric3: "Default EF", risk: "Medium" },
        { id: "ec-3", label: "Offshore support centres", metric1: "2,500 t", metric2: "Contractor shuttles", metric3: "Vendor data", risk: "Low" },
      ],
    },
    purchased_goods_services: {
      leaf: "purchased_goods_services",
      title: "Purchased goods & services",
      narrative: "Scope 3 Category 1 — upstream emissions from procurement of non-fuel goods and services supporting bank operations.",
      scope3CategoryLabel: "Category 1 — Purchased goods & services",
      tCO2e: 14200,
      pctOfScope12And3NonFinanced: 19,
      methodology: "Spend-based India EEIO (EXIO-India desk) + supplier PCFs for top 40 vendors by INR.",
      dataQuality: "Mixed",
      yoyPct: -2.0,
      spendOrActivityINRCr: 8420,
      notes: "IT services, security, cash logistics, and facilities management dominate spend mass.",
      kpis: [
        { label: "tCO₂e", value: "14,200", trendPct: -2.0 },
        { label: "Addressable spend", value: "₹8,420 cr" },
        { label: "Top-40 PCF coverage", value: "62%" },
        { label: "Vendors in scope", value: "1,240" },
      ],
      lineItems: [
        { id: "pg-1", label: "IT & cloud services (vendor scope)", metric1: "5,800 t", metric2: "₹2,400 cr", metric3: "PCF coverage 62%", risk: "Low" },
        { id: "pg-2", label: "Cash logistics & ATM fleet", metric1: "3,900 t", metric2: "₹1,100 cr", metric3: "Diesel HGV model", risk: "Medium" },
        { id: "pg-3", label: "Facilities & housekeeping", metric1: "2,600 t", metric2: "₹860 cr", metric3: "Spend-based", risk: "Low" },
      ],
    },
    it_data_centers: {
      leaf: "it_data_centers",
      title: "IT & data centers",
      narrative: "Operational and outsourced data centre energy attributable to the bank’s digital infrastructure and cloud workloads.",
      scope3CategoryLabel: "Category 1 / outsourced — Data centres",
      tCO2e: 8960,
      pctOfScope12And3NonFinanced: 12,
      methodology: "Colo PUE + CEA grid EF for Mumbai & Chennai DCs; cloud region attribution from CSP dashboards.",
      dataQuality: "Primary (PUE)",
      yoyPct: 6.4,
      notes: "GPU uplift for fraud analytics cluster — flagged for FY26 efficiency programme.",
      kpis: [
        { label: "tCO₂e", value: "8,960", trendPct: 6.4 },
        { label: "Blended PUE", value: "1.56" },
        { label: "Renewable PPA (colo)", value: "40%" },
        { label: "Racks in scope", value: "4,200" },
      ],
      lineItems: [
        { id: "dc-1", label: "Primary DC — Navi Mumbai", metric1: "4,200 t", metric2: "PUE 1.52", metric3: "Grid 0.71 kg/kWh", risk: "Medium" },
        { id: "dc-2", label: "DR site — Chennai", metric1: "2,800 t", metric2: "PUE 1.61", metric3: "Renewable PPA 40%", risk: "Low" },
        { id: "dc-3", label: "Hyperscaler cloud — shared responsibility", metric1: "1,960 t", metric2: "Allocated scope 3", metric3: "CSP report", risk: "Low" },
      ],
    },
    waste_capital_goods: {
      leaf: "waste_capital_goods",
      title: "Waste & capital goods",
      narrative: "Scope 3 Categories 2 & 5 — embodied emissions in capital equipment (ATMs, IT, branches) and operational waste treatment.",
      scope3CategoryLabel: "Categories 2 & 5 — Capital goods & waste",
      tCO2e: 3640,
      pctOfScope12And3NonFinanced: 5,
      methodology: "Capex register × industry capital goods factors; e-waste tonnage × India treatment EF.",
      dataQuality: "Secondary",
      yoyPct: 8.3,
      notes: "FY25 ATM refresh cycle increased capital goods spike; e-waste chain certified recyclers 78%.",
      kpis: [
        { label: "tCO₂e", value: "3,640", trendPct: 8.3 },
        { label: "Capex in model", value: "₹420 cr" },
        { label: "E-waste recycled", value: "78%" },
        { label: "ATM units refreshed", value: "12,400" },
      ],
      lineItems: [
        { id: "wc-1", label: "ATM & branch capex", metric1: "2,100 t", metric2: "₹420 cr capex", metric3: "FY25 peak", risk: "Low" },
        { id: "wc-2", label: "IT hardware (laptops/servers)", metric1: "980 t", metric2: "Mass balance", metric3: "Vendor returns", risk: "Low" },
        { id: "wc-3", label: "Operational waste — branches", metric1: "560 t", metric2: "Paper + plastic", metric3: "EPR aligned", risk: "Low" },
      ],
    },
  },
  green: {
    carbon_green_loans: {
      leaf: "carbon_green_loans",
      title: "Green loans",
      narrative: "Use-of-proceeds tracked loans — renewable energy, green buildings, EV fleets, water, waste, biodiversity per RBI/SEBI-aligned taxonomy.",
      kpis: [
        { label: "Outstanding", value: "₹18,640 cr" },
        { label: "Accounts", value: "842" },
        { label: "Third-party verified", value: "78%" },
        { label: "Est. CO₂e avoided / yr", value: "18.2 Mt", hint: "Impact model" },
      ],
      lineItems: [
        { id: "gl-1", label: "WesternWind Renewables", metric1: "₹3,800 cr", metric2: "RE — verified", metric3: "1.28 Mt/yr avoided", risk: "Low" },
        { id: "gl-2", label: "UrbanGreen Housing", metric1: "₹1,200 cr", metric2: "IGBC Platinum", metric3: "0.42 Mt/yr", risk: "Low" },
        { id: "gl-3", label: "EVolve Mobility", metric1: "₹860 cr", metric2: "EV fleet", metric3: "In review", risk: "Medium" },
      ],
      complianceNote: "BRSR Principle 6 green finance annex — tie-out to audited sampling 9.4% of accounts.",
    },
    carbon_green_bonds: {
      leaf: "carbon_green_bonds",
      title: "Green bonds",
      narrative: "Outstanding green bond programmes with SPO and allocation reporting; CBI certification on flagship series.",
      kpis: [
        { label: "Outstanding", value: "₹12,400 cr" },
        { label: "Series count", value: "2 live" },
        { label: "Avg allocation %", value: "92.5%" },
        { label: "CBI certified", value: "50%", hint: "By notional" },
      ],
      lineItems: [
        { id: "gb-1", label: "IN002024Green01", metric1: "₹5,000 cr", metric2: "Allocation 94%", metric3: "DNV SPO", risk: "Low" },
        { id: "gb-2", label: "IN002023Green02", metric1: "₹3,200 cr", metric2: "Allocation 91%", metric3: "Sustainalytics SPO", risk: "Low" },
      ],
      complianceNote: "SEBI Green Bond Framework — checklist item 8 (impact assurance) still open.",
    },
    carbon_green_deposits: {
      leaf: "carbon_green_deposits",
      title: "Green deposits",
      narrative: "RBI ring-fenced green deposit scheme — proceeds mapped to eligible green project register with quarterly impact reporting.",
      kpis: [
        { label: "Mobilised", value: "₹9,800 cr" },
        { label: "Retail vs corporate", value: "62% / 38%" },
        { label: "RBI checklist gaps", value: "1 item", hint: "Customer communication" },
        { label: "Allocator confirmation", value: "In progress" },
      ],
      lineItems: [
        { id: "gd-1", label: "Rooftop solar — MSME beneficiary pool", metric1: "₹2,400 cr", metric2: "312 MW equiv.", metric3: "Ring-fenced", risk: "Low" },
        { id: "gd-2", label: "Wind repowering — Gujarat", metric1: "₹1,800 cr", metric2: "180 MW", metric3: "Third-party allocator", risk: "Low" },
      ],
      complianceNote: "RBI/2023-24/104 — plain-language customer communication flagged Gap Identified in master tracker.",
    },
    carbon_sustainability_linked_loans: {
      leaf: "carbon_sustainability_linked_loans",
      title: "Sustainability-linked loans (SLL)",
      narrative: "Pricing linked to SBTi adoption, renewable share, or water intensity KPIs — step-up/down margin triggers monitored quarterly.",
      kpis: [
        { label: "Facilities", value: "64" },
        { label: "Avg KPI performance", value: "87% vs target" },
        { label: "Active margin triggers", value: "12" },
        { label: "Borrowers off-track", value: "5", hint: "Watchlist" },
      ],
      lineItems: [
        { id: "sll-1", label: "Deccan Auto — SBTi + EV mix KPI", metric1: "₹600 cr", metric2: "On track", metric3: "Step-down eligible FY26", risk: "Low" },
        { id: "sll-2", label: "ChemNova — water intensity KPI", metric1: "₹400 cr", metric2: "Behind 8%", metric3: "Step-up armed", risk: "Medium" },
      ],
      complianceNote: "LMA APAC SLL Principles alignment — external counsel review scheduled Q1 FY26.",
    },
  },
  climate: {
    physical_risk: {
      leaf: "physical_risk",
      title: "Physical risk — collateral & operations",
      narrative:
        "District-level hazard overlay on CRE and infra collateral; cyclone, flood, and heat stress drive insurance covenant recommendations.",
      kpis: [
        { label: "Collateral in high-hazard bands", value: "₹18,420 cr" },
        { label: "Top-10 districts by value", value: "See map list", hint: "Climate Risk view" },
        { label: "Flood + cyclone overlap (Mumbai/Kochi)", value: "₹6,400 cr" },
        { label: "RBI TCFD disclosure", value: "Required", hint: "Para 7" },
      ],
      lineItems: dataPhysicalLines(),
      regulatoryRef: "RBI Disclosure Framework on Climate-related Financial Risks (March 2024) — physical risk metrics.",
    },
    transition_risk: {
      leaf: "transition_risk",
      title: "Transition risk — policy, technology, market",
      narrative: "Portfolio register of transition risks with exposure, horizon, and mitigation — aligned to risk taxonomy used in ICAAP supplement.",
      kpis: [
        { label: "High magnitude transition", value: "₹41,000 cr", hint: "Policy + tech" },
        { label: "Disclosed in annual report", value: "60%", hint: "10-row register" },
        { label: "CBAM-sensitive clients (steel/cement)", value: "₹8,200 cr" },
        { label: "Engagement actions FY25", value: "214", hint: "Borrower meetings" },
      ],
      lineItems: dataTransitionLines(),
      regulatoryRef: "RBI climate risk — transition risk identification & scenario linkage.",
    },
    climate_stress_testing: {
      leaf: "climate_stress_testing",
      title: "Climate stress testing",
      narrative: "Orderly, disorderly, and hot-house scenarios — NPA and CET1 sensitivities reviewed by Board Risk Committee with conditions.",
      kpis: [
        { label: "NPA ratio shock (central)", value: "+0.62%" },
        { label: "CET1 impact", value: "-42 bps", hint: "Illustrative" },
        { label: "Scenarios tested", value: "3" },
        { label: "Last board sign-off", value: "2025-09-12" },
      ],
      lineItems: [
        { id: "st-1", label: "Orderly transition", metric1: "NPA +0.35%", metric2: "CET1 -22 bps", metric3: "Baseline", risk: "Low" },
        { id: "st-2", label: "Disorderly transition", metric1: "NPA +0.78%", metric2: "CET1 -48 bps", metric3: "Credit migration", risk: "High" },
        { id: "st-3", label: "Hothouse world", metric1: "NPA +0.91%", metric2: "CET1 -55 bps", metric3: "Physical + sovereign", risk: "High" },
      ],
      regulatoryRef: "RBI climate stress testing expectations — annual integration with ICAAP.",
    },
  },
};

function dataPhysicalLines(): import("./types").CarbonLensLineItem[] {
  return [
    { id: "ph-1", label: "Mumbai Suburban — flood + pluvial", metric1: "₹4,200 cr", metric2: "CRE + infra", metric3: "High", risk: "High", detail: "Insurance covenant uplift recommended" },
    { id: "ph-2", label: "Ernakulam — cyclone + flood", metric1: "₹3,100 cr", metric2: "Port-linked", metric3: "High", risk: "High" },
    { id: "ph-3", label: "Ahmedabad — heat stress", metric1: "₹2,800 cr", metric2: "SME collateral", metric3: "Medium", risk: "Medium" },
  ];
}

function dataTransitionLines(): import("./types").CarbonLensLineItem[] {
  return [
    { id: "tr-1", label: "Policy — carbon intensity caps (cement/steel)", metric1: "₹41,000 cr", metric2: "Long >10yr", metric3: "High", risk: "High" },
    { id: "tr-2", label: "Technology — EV / SAF disruption (auto/aviation)", metric1: "₹27,600 cr", metric2: "3–10yr", metric3: "Medium", risk: "Medium" },
    { id: "tr-3", label: "Market — commodity margin stress", metric1: "₹18,200 cr", metric2: "<3yr", metric3: "Medium", risk: "Medium" },
  ];
}

export const carbonLensBlock = attachCarbonLensDrills(carbonLensBlockBase);
