import { chromium } from "playwright";
import { SignJWT } from "jose";
import fs from "fs";
import path from "path";

// Load frontend/.env without printing secrets
const envPath = path.resolve("D:/office/compliance-audit/frontend/.env");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.slice(1, -1);
  }
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const OUT = path.resolve("D:/office/compliance-audit/frontend/.verify-mlro-v7");
const URL = "http://localhost:3000/UKBankingAudit/v7";

async function mintSessionCookie() {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  return new SignJWT({
    email: "verify@local",
    name: "Layout Verify",
    role: "admin",
    access: "*",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
}

async function gotoMlro(page) {
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(400);
  const mlroBtn = page.getByRole("button", { name: /MLRO \(SMF17\)/i }).first();
  await mlroBtn.waitFor({ timeout: 20000 });
  await mlroBtn.click();
  await page.locator("#mlro-panel-kri-strip").waitFor({ timeout: 20000 });
  const ops = page.getByRole("button", { name: /Operational Dashboard/i }).first();
  if (await ops.count()) {
    await ops.click();
    await page.waitForTimeout(300);
  }
}

async function measureDefault(page) {
  return page.evaluate(() => {
    const pickCard = (id) => {
      const root = document.getElementById(id);
      if (!root) return null;
      const card = root.querySelector(":scope > div") || root.firstElementChild;
      if (!card) return null;
      const r = card.getBoundingClientRect();
      return {
        id,
        top: r.top + window.scrollY,
        bottom: r.bottom + window.scrollY,
        height: Math.round(r.height * 10) / 10,
        width: Math.round(r.width * 10) / 10,
      };
    };

    const zoneB = {
      alert: pickCard("mlro-panel-alert-backlog"),
      rail: (() => {
        const el = document.getElementById("mlro-panel-sar-edd");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          id: "mlro-panel-sar-edd",
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
          height: Math.round(r.height * 10) / 10,
          width: Math.round(r.width * 10) / 10,
        };
      })(),
    };

    const zoneC = {
      sanctions: pickCard("mlro-panel-sanctions"),
      training: pickCard("mlro-panel-fc-training"),
    };

    let dashTop = Infinity;
    let dashBottom = 0;
    for (const id of [
      "mlro-panel-kri-strip",
      "mlro-panel-alert-backlog",
      "mlro-panel-sar-edd",
      "mlro-panel-sanctions",
      "mlro-panel-fc-training",
    ]) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      dashTop = Math.min(dashTop, r.top + window.scrollY);
      dashBottom = Math.max(dashBottom, r.bottom + window.scrollY);
    }
    const h1 = document.querySelector("h1");
    if (h1) {
      const r = h1.getBoundingClientRect();
      dashTop = Math.min(dashTop, r.top + window.scrollY);
    }

    const workspace = document.getElementById("mlro-panel-kri-strip")?.closest(".min-w-0.space-y-4");
    let workspaceHeight = null;
    if (workspace) {
      workspaceHeight = Math.round(workspace.getBoundingClientRect().height * 10) / 10;
    }

    // PTG: find footers containing Path to Green
    const ptgNodes = [...document.querySelectorAll("*")].filter((el) => {
      if (el.children.length > 8) return false;
      const direct = [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent || "")
        .join("");
      return /Path to Green/i.test(el.textContent || "") && (el.textContent || "").length < 400;
    });
    const seen = new Set();
    const ptg = [];
    for (const el of ptgNodes) {
      const card =
        el.closest(".rounded-xl") ||
        el.closest("[class*='rounded-xl']") ||
        el.closest("[class*='border-2']");
      if (!card || seen.has(card)) continue;
      seen.add(card);
      const footer =
        el.closest("[class*='border-t']") ||
        el.parentElement;
      const cr = card.getBoundingClientRect();
      const fr = footer.getBoundingClientRect();
      const prev = footer.previousElementSibling;
      const gapAbove = prev
        ? Math.round((fr.top - prev.getBoundingClientRect().bottom) * 10) / 10
        : null;
      ptg.push({
        cardBottomGap: Math.round((cr.bottom - fr.bottom) * 10) / 10,
        gapAbovePrev: gapAbove,
        footerAtCardFoot: Math.abs(cr.bottom - fr.bottom) < 2,
        insideCard: true,
        sample: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
      });
    }

    const truncated = [];
    document.querySelectorAll("button[aria-expanded]").forEach((btn) => {
      btn.querySelectorAll("*").forEach((el) => {
        if (el.scrollWidth > el.clientWidth + 1) {
          truncated.push({
            where: "collapse-row",
            text: (el.textContent || "").trim().slice(0, 80),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          });
        }
      });
    });
    // eyebrow / header truncate
    document.querySelectorAll(".truncate").forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1) {
        const inCollapse = !!el.closest("button[aria-expanded]");
        const looksHeader =
          inCollapse ||
          /uppercase|tracking-wider|font-bold/.test(el.className) ||
          el.closest("header") ||
          el.matches("h1,h2,h3");
        if (looksHeader) {
          truncated.push({
            where: "header-truncate-class",
            text: (el.textContent || "").trim().slice(0, 80),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          });
        }
      }
    });

    const collapseRows = [...document.querySelectorAll("button[aria-expanded='false']")].map(
      (btn) => {
        const spans = [...btn.querySelectorAll("span, div")];
        const summaryEl = [...btn.querySelectorAll("span")].find(
          (s) => s.textContent && !/▾/.test(s.textContent) && s.children.length === 0,
        );
        const sumWrap = summaryEl ? summaryEl.getClientRects().length > 1 : false;
        const titleEl = btn.children[0];
        return {
          title: (titleEl?.textContent || "").trim().slice(0, 70),
          summary: (summaryEl?.textContent || "").trim().slice(0, 50),
          titleTrunc: !!(titleEl && titleEl.scrollWidth > titleEl.clientWidth + 1),
          sumTrunc: !!(summaryEl && summaryEl.scrollWidth > summaryEl.clientWidth + 1),
          sumWrap,
          height: Math.round(btn.getBoundingClientRect().height * 10) / 10,
        };
      },
    );

    // Face StatTiles under sanctions / training / alert — measure widths
    const tileRoots = [];
    for (const id of [
      "mlro-panel-alert-backlog",
      "mlro-panel-sanctions",
      "mlro-panel-fc-training",
      "mlro-panel-sar-edd",
      "mlro-panel-fraud",
    ]) {
      const root = document.getElementById(id);
      if (!root) continue;
      root.querySelectorAll("[class*='rounded-md'][class*='border']").forEach((el) => {
        const t = (el.textContent || "").replace(/\s+/g, " ");
        if (!/(OVER|WITHIN|UNDER|appetite|target )/i.test(t)) return;
        // skip nested deep system health / expanded only when collapsed face
        const r = el.getBoundingClientRect();
        if (r.height > 200 || r.width < 40) return;
        tileRoots.push({
          panel: id,
          w: Math.round(r.width),
          h: Math.round(r.height),
          sample: t.trim().slice(0, 60),
        });
      });
    }

    // Delta beside number: for tight/sm tiles check flex row baseline
    const deltaBeside = [];
    document.querySelectorAll("#mlro-panel-sanctions [class*='items-baseline'], #mlro-panel-fc-training [class*='items-baseline'], #mlro-panel-alert-backlog [class*='items-baseline']").forEach((row) => {
      const kids = [...row.children];
      if (kids.length < 2) return;
      const a = kids[0].getBoundingClientRect();
      const b = kids[1].getBoundingClientRect();
      deltaBeside.push({
        verticalStack: b.top > a.bottom - 2,
        topDiff: Math.round(Math.abs(a.top - b.top) * 10) / 10,
        sample: (row.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
      });
    });

    // 2-across collapsed baselines in sanctions
    const sanctions = document.getElementById("mlro-panel-sanctions");
    const pairBaselines = [];
    if (sanctions) {
      const collapseGrid = [...sanctions.querySelectorAll("div")].find((d) => {
        const cls = d.className?.toString?.() || "";
        return cls.includes("md:grid-cols-2") && d.querySelector("button[aria-expanded]");
      });
      if (collapseGrid) {
        const kids = [...collapseGrid.children].filter((c) =>
          c.querySelector("button[aria-expanded]"),
        );
        for (let i = 0; i + 1 < kids.length; i += 2) {
          const a = kids[i].getBoundingClientRect();
          const b = kids[i + 1].getBoundingClientRect();
          pairBaselines.push({
            pair: i / 2,
            topDiff: Math.round(Math.abs(a.top - b.top) * 10) / 10,
            bottomDiff: Math.round(Math.abs(a.bottom - b.bottom) * 10) / 10,
            titleA: kids[i].querySelector("button")?.childNodes[0]
              ? (kids[i].querySelector("button")?.textContent || "").trim().slice(0, 45)
              : "",
            titleB: (kids[i + 1].querySelector("button")?.textContent || "")
              .trim()
              .slice(0, 45),
          });
        }
      }
    }

    // Card overflow of column
    const overflows = [];
    for (const id of [
      "mlro-panel-alert-backlog",
      "mlro-panel-sar-edd",
      "mlro-panel-sanctions",
      "mlro-panel-fc-training",
      "mlro-panel-fraud",
    ]) {
      const col = document.getElementById(id);
      if (!col) continue;
      const card = col.querySelector(":scope > div") || col.firstElementChild;
      if (!card) continue;
      const cr = col.getBoundingClientRect();
      const ar = card.getBoundingClientRect();
      if (ar.width > cr.width + 1) {
        overflows.push({ id, colW: cr.width, cardW: ar.width });
      }
    }

    return {
      zoneB,
      zoneC,
      dashSpan: Math.round((dashBottom - dashTop) * 10) / 10,
      dashTop,
      dashBottom,
      workspaceHeight,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      scroll: {
        overflowX:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
      },
      ptg,
      truncated,
      collapseRows,
      tileRoots,
      maxTileWidth: tileRoots.length ? Math.max(...tileRoots.map((t) => t.w)) : 0,
      tilesOver280: tileRoots.filter((t) => t.w > 280),
      deltaBeside,
      pairBaselines,
      overflows,
      zoneBDiff: Math.abs((zoneB.alert?.height || 0) - (zoneB.rail?.height || 0)),
      zoneCDiff: Math.abs((zoneC.sanctions?.height || 0) - (zoneC.training?.height || 0)),
      zoneBTopDiff: Math.abs((zoneB.alert?.top || 0) - (zoneB.rail?.top || 0)),
      zoneBBottomDiff: Math.abs((zoneB.alert?.bottom || 0) - (zoneB.rail?.bottom || 0)),
      zoneCTopDiff: Math.abs((zoneC.sanctions?.top || 0) - (zoneC.training?.top || 0)),
      zoneCBottomDiff: Math.abs(
        (zoneC.sanctions?.bottom || 0) - (zoneC.training?.bottom || 0),
      ),
    };
  });
}

async function expandAllAndInventory(page) {
  for (let guard = 0; guard < 40; guard++) {
    const btn = page.locator("button[aria-expanded='false']").first();
    if ((await btn.count()) === 0) break;
    await btn.click();
    await page.waitForTimeout(60);
  }
  return page.evaluate(() => {
    const body = document.body.innerText;
    const need = [
      ["KRI strip eyebrow", /Financial Crime KRIs/i],
      ["Alert eyebrow", /AML Programme Posture/i],
      ["Alert title", /L1 \/ L2 \/ L3 alert backlog/i],
      ["Alert tiers", /Investigation tiers/i],
      ["Backlog spark / trends", /Open backlog/i],
      ["SAR conversion", /Alert → SAR conversion|converted to SARs/i],
      ["Capacity vs demand", /capacity vs demand|Demand exceeds/i],
      ["TM / systems health", /Systems & data health/i],
      ["SAR title", /SAR timeliness|statutory window/i],
      ["EDD title", /High-risk customer reviews/i],
      ["EDD past due", /Past due/i],
      ["Sanctions title", /Screening & reporting/i],
      ["Payments hold", /Payments hold time/i],
      ["OFSI freeze", /OFSI freeze/i],
      ["OFSI block", /OFSI block/i],
      ["US OFAC separate", /US OFAC · separate jurisdiction/i],
      ["List update", /List update/i],
      ["Screening systems health", /Screening systems health/i],
      ["Txn screening block", /Transaction screening|Txn/i],
      ["Name screening block", /Name screening/i],
      ["Training title", /Programme completion/i],
      ["Derivation claims", /Derivation & claims/i],
      ["AP-MLRO narrative", /AP-MLRO-2025/i],
      ["Fraud confirmed loss", /Confirmed net loss/i],
      ["Fraud APP", /APP reimbursement/i],
      ["Fraud types trending", /Types trending up/i],
      ["Path to Green", /Path to Green/i],
      ["Sanctions team source", /Sanctions team/i],
      ["Non-compliance waivers", /Non-compliance waivers/i],
    ];
    return need.map(([label, re]) => ({ label, ok: re.test(body) }));
  });
}

const report = { viewports: {} };
const browser = await chromium.launch({ headless: true });
const token = await mintSessionCookie();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
await context.addCookies([
  {
    name: "demo_session",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();

await gotoMlro(page);
await page.waitForTimeout(500);
const m1920 = await measureDefault(page);
await page.screenshot({ path: path.join(OUT, "ops-1920.png"), fullPage: true });
report.viewports["1920"] = m1920;

report.inventory = await expandAllAndInventory(page);
await page.screenshot({ path: path.join(OUT, "ops-1920-expanded.png"), fullPage: true });

// Reload collapsed for other viewports
await page.goto(URL, { waitUntil: "domcontentloaded" });
await gotoMlro(page);

for (const vp of [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
]) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.waitForTimeout(500);
  report.viewports[vp.name] = await measureDefault(page);
  await page.screenshot({ path: path.join(OUT, `ops-${vp.name}.png`), fullPage: true });
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

const summary = {
  zoneB: {
    alertH: m1920.zoneB.alert?.height,
    railH: m1920.zoneB.rail?.height,
    diff: m1920.zoneBDiff,
    topDiff: m1920.zoneBTopDiff,
    bottomDiff: m1920.zoneBBottomDiff,
  },
  zoneC: {
    sanctionsH: m1920.zoneC.sanctions?.height,
    trainingH: m1920.zoneC.training?.height,
    diff: m1920.zoneCDiff,
    topDiff: m1920.zoneCTopDiff,
    bottomDiff: m1920.zoneCBottomDiff,
  },
  dashSpan: m1920.dashSpan,
  workspaceHeight: m1920.workspaceHeight,
  ratioVs1080: Number((m1920.dashSpan / 1080).toFixed(3)),
  overflowX: Object.fromEntries(
    Object.entries(report.viewports).map(([k, v]) => [k, v.scroll?.overflowX]),
  ),
  cardOverflows: Object.fromEntries(
    Object.entries(report.viewports).map(([k, v]) => [k, v.overflows]),
  ),
  inventoryFail: report.inventory.filter((x) => !x.ok),
  truncatedCount: m1920.truncated.length,
  truncated: m1920.truncated.slice(0, 15),
  collapseSumWrap: m1920.collapseRows.filter((r) => r.sumWrap || r.sumTrunc || r.titleTrunc),
  pairBaselines: m1920.pairBaselines,
  maxTileWidth: m1920.maxTileWidth,
  tilesOver280: m1920.tilesOver280,
  deltaBesideFails: m1920.deltaBeside.filter((d) => d.verticalStack),
  ptg: m1920.ptg,
  collapseSumWrapOther: {
    "1440": report.viewports["1440"]?.collapseRows?.filter(
      (r) => r.sumWrap || r.sumTrunc || r.titleTrunc,
    ),
    "1280": report.viewports["1280"]?.collapseRows?.filter(
      (r) => r.sumWrap || r.sumTrunc || r.titleTrunc,
    ),
  },
};

console.log(JSON.stringify(summary, null, 2));
await browser.close();
