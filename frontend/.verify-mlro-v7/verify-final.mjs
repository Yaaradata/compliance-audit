import { chromium } from "playwright";
import { SignJWT } from "jose";
import fs from "fs";
import path from "path";

for (const line of fs.readFileSync("D:/office/compliance-audit/frontend/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const OUT = path.resolve("D:/office/compliance-audit/frontend/.verify-mlro-v7");
const URL = "http://localhost:3000/UKBankingAudit/v7";

async function mint() {
  return new SignJWT({ email: "v@l", name: "V", role: "admin", access: "*" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
}

async function gotoMlro(page) {
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  const mlroBtn = page.getByRole("button", { name: /MLRO \(SMF17\)/i }).first();
  await mlroBtn.waitFor({ state: "visible", timeout: 30000 });
  await mlroBtn.click();
  await page.locator("#mlro-panel-kri-strip").waitFor({ state: "visible", timeout: 30000 });
  const ops = page.getByRole("button", { name: /Operational Dashboard/i }).first();
  if (await ops.count()) {
    await ops.click();
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(500);
}

function cardRootFromPanel(panelEl) {
  // Prefer bordered rounded-xl card inside panel
  const direct = [...panelEl.querySelectorAll(":scope > div")];
  const card =
    direct.find((d) => /rounded-xl|border-2/.test(d.className?.toString?.() || "")) ||
    panelEl.querySelector("[class*='rounded-xl']") ||
    panelEl.firstElementChild;
  return card;
}

async function measureViewport(page) {
  return page.evaluate(() => {
    const cardRootFromPanel = (panelEl) => {
      const direct = [...panelEl.querySelectorAll(":scope > div")];
      return (
        direct.find((d) => /rounded-xl|border-2/.test(d.className?.toString?.() || "")) ||
        panelEl.querySelector("[class*='rounded-xl']") ||
        panelEl.firstElementChild
      );
    };

    const measureBlank = (label, card) => {
      if (!card) return { label, missing: true };
      const cr = card.getBoundingClientRect();
      // Last meaningful content: deepest visible leaf with text/size, excluding PTG footer band
      const kids = [...card.children];
      const foot = [...kids]
        .reverse()
        .find((el) => /Path to Green/i.test(el.textContent || ""));
      const body = foot ? foot.previousElementSibling : kids[kids.length - 1];
      if (!body) {
        return {
          label,
          cardH: Math.round(cr.height),
          gapLastToBottom: null,
          note: "no-body",
        };
      }
      // Find bottom-most non-empty content inside body (or whole card if no foot)
      const scanRoot = foot ? body : card;
      const nodes = [...scanRoot.querySelectorAll("*")].filter((n) => {
        const r = n.getBoundingClientRect();
        if (r.height < 2 || r.width < 2) return false;
        // skip invisible
        const st = getComputedStyle(n);
        if (st.visibility === "hidden" || st.display === "none") return false;
        return true;
      });
      let lastBottom = 0;
      for (const n of nodes) {
        lastBottom = Math.max(lastBottom, n.getBoundingClientRect().bottom);
      }
      // Also consider body itself text bottom
      lastBottom = Math.max(lastBottom, body.getBoundingClientRect().bottom);

      // Content ends at last content; bottom border is card bottom.
      // If PTG footer exists, "last content" for blank-space check is the footer
      // bottom (footer is content) — OR the gap between body and footer.
      // Spec: distance between last content element and bottom border.
      // Footer IS content, so gap should be ~0 from footer bottom to card bottom.
      // Also flag gap between body bottom and footer top (internal hole).
      const footR = foot?.getBoundingClientRect();
      const lastContentBottom = footR ? footR.bottom : lastBottom;
      const gapLastToBottom = Math.round((cr.bottom - lastContentBottom) * 10) / 10;
      const gapBodyToFoot = footR
        ? Math.round((footR.top - body.getBoundingClientRect().bottom) * 10) / 10
        : null;
      // Internal hole: unused space in flex-1 body above footer
      const bodyR = body.getBoundingClientRect();
      const padB = parseFloat(getComputedStyle(body).paddingBottom) || 0;
      const emptyInBody = Math.round((bodyR.bottom - padB - lastBottom) * 10) / 10;

      return {
        label,
        cardH: Math.round(cr.height * 10) / 10,
        gapLastToBottom,
        gapBodyToFoot,
        emptyInBody: emptyInBody > 0 ? emptyInBody : 0,
        hasPtg: !!foot,
      };
    };

    const panels = {
      alert: "mlro-panel-alert-backlog",
      sanctions: "mlro-panel-sanctions",
      fraud: "mlro-panel-fraud",
      training: "mlro-panel-fc-training",
      kri: "mlro-panel-kri-strip",
    };

    const blanks = [];
    for (const [label, id] of Object.entries(panels)) {
      const p = document.getElementById(id);
      if (!p) {
        blanks.push({ label, missing: true });
        continue;
      }
      blanks.push(measureBlank(label, cardRootFromPanel(p)));
    }

    // SAR + EDD inside sar-edd
    const rail = document.getElementById("mlro-panel-sar-edd");
    if (rail) {
      for (const child of [...rail.children]) {
        const t = child.textContent || "";
        const name = /SAR timeliness/i.test(t)
          ? "sar"
          : /EDD pipeline/i.test(t)
            ? "edd"
            : null;
        if (!name) continue;
        const card = /rounded-xl|border-2/.test(child.className?.toString?.() || "")
          ? child
          : child.querySelector("[class*='rounded-xl']") || child;
        blanks.push(measureBlank(name, card));
      }
    }

    // Columns
    const leftTop = document.getElementById("mlro-panel-alert-backlog")?.getBoundingClientRect().top;
    const leftBot = document.getElementById("mlro-panel-fraud")?.getBoundingClientRect().bottom;
    const rightTop = document.getElementById("mlro-panel-sar-edd")?.getBoundingClientRect().top;
    const rightBot = document
      .getElementById("mlro-panel-fc-training")
      ?.getBoundingClientRect().bottom;
    const leftH = leftBot - leftTop;
    const rightH = rightBot - rightTop;

    // Page span
    let dashTop = Infinity;
    let dashBottom = 0;
    const h1 = document.querySelector("h1");
    if (h1) dashTop = Math.min(dashTop, h1.getBoundingClientRect().top + window.scrollY);
    for (const id of [
      "mlro-panel-kri-strip",
      "mlro-panel-alert-backlog",
      "mlro-panel-fraud",
      "mlro-panel-fc-training",
    ]) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      dashTop = Math.min(dashTop, r.top + window.scrollY);
      dashBottom = Math.max(dashBottom, r.bottom + window.scrollY);
    }

    // Text density — primary widget
    const alert = document.getElementById("mlro-panel-alert-backlog");
    const alertText = alert?.innerText || "";
    const microLines = (alertText.match(/Tier backlogs sum to[^\n]*/g) || []).length;
    const hasInvestigationHeading = /Investigation tiers · backlog vs appetite/i.test(
      alertText,
    );
    const hasDupTier = /L1 · L1 |L2 · L2 |L3 · L3 /i.test(alertText);
    const microSample = (alertText.match(/Tier backlogs sum to[^\n]*/)||[])[0] || null;

    // Collapsed summary wrap
    const collapseWrap = [...document.querySelectorAll("button[aria-expanded='false']")]
      .map((btn) => {
        const spans = [...btn.querySelectorAll("span")].filter(
          (s) => s.children.length === 0 && s.textContent && !/▾/.test(s.textContent),
        );
        const summaryEl = spans[spans.length - 1];
        const wrap = summaryEl ? summaryEl.getClientRects().length > 1 : false;
        return wrap
          ? { title: (btn.textContent || "").trim().slice(0, 50), wrap }
          : null;
      })
      .filter(Boolean);

    // Overflow
    const overflows = [];
    for (const id of Object.values(panels).concat(["mlro-panel-sar-edd"])) {
      const col = document.getElementById(id);
      if (!col) continue;
      const card = cardRootFromPanel(col);
      if (!card) continue;
      const a = col.getBoundingClientRect();
      const b = card.getBoundingClientRect();
      if (b.width > a.width + 2) overflows.push({ id, colW: a.width, cardW: b.width });
    }

    return {
      blanks,
      gapsOver24: blanks.filter(
        (b) =>
          (b.gapLastToBottom != null && b.gapLastToBottom > 24) ||
          (b.gapBodyToFoot != null && b.gapBodyToFoot > 24) ||
          (b.emptyInBody != null && b.emptyInBody > 24),
      ),
      cols: {
        leftH: Math.round(leftH * 10) / 10,
        rightH: Math.round(rightH * 10) / 10,
        diff: Math.round(Math.abs(leftH - rightH) * 10) / 10,
      },
      dashSpan: Math.round((dashBottom - dashTop) * 10) / 10,
      ratio: Number(((dashBottom - dashTop) / window.innerHeight).toFixed(3)),
      textDensity: {
        microLines,
        microSample,
        hasInvestigationHeading,
        hasDupTier,
      },
      collapseWrap,
      overflows,
      scroll: {
        overflowX:
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      },
    };
  });
}

async function inventory(page) {
  for (let g = 0; g < 50; g++) {
    const b = page.locator("button[aria-expanded='false']").first();
    if ((await b.count()) === 0) break;
    await b.click();
    await page.waitForTimeout(40);
  }
  // expand fraud
  const fraud = page.locator("#mlro-panel-fraud button[aria-expanded='false']");
  if (await fraud.count()) await fraud.click();

  return page.evaluate(() => {
    const body = document.body.innerText;
    const need = [
      ["KRI strip", /Financial Crime KRIs/i],
      ["Alert primary", /L1 \/ L2 \/ L3 alert backlog/i],
      ["Trends chart", /Open backlog · 13 wk/i],
      ["SAR conversion", /Alert → SAR conversion|converted to SARs/i],
      ["Capacity", /Capacity vs demand|Demand exceeds/i],
      ["TM systems health", /Systems & data health/i],
      ["SAR", /SAR timeliness/i],
      ["EDD", /High-risk customer reviews/i],
      ["Past due", /Past due/i],
      ["Sanctions", /Screening & reporting/i],
      ["Payments hold", /Payments hold time/i],
      ["OFSI freeze", /OFSI freeze/i],
      ["OFSI block", /OFSI block/i],
      ["OFAC", /US OFAC · separate jurisdiction/i],
      ["List update", /List update/i],
      ["Screening systems", /Screening systems health/i],
      ["Txn screening", /Transaction screening|Txn/i],
      ["Name screening", /Name screening/i],
      ["Training", /Programme completion/i],
      ["Derivation", /Derivation & claims|AP-MLRO-2025/i],
      ["Fraud loss", /Confirmed net loss/i],
      ["Fraud APP", /APP reimbursement/i],
      ["Fraud trend", /Types trending up/i],
      ["Path to Green", /Path to Green/i],
      ["Sanctions team", /Sanctions team/i],
      ["Waivers", /Non-compliance waivers/i],
      // Pass 2 movers
      ["Fraud in left col reachable", /Fraud risk/i],
      ["Sanctions in left col", /Sanctions posture/i],
      ["Training in right col", /Financial crime training/i],
    ];
    return need.map(([label, re]) => ({ label, ok: re.test(body) }));
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
await context.addCookies([
  {
    name: "demo_session",
    value: await mint(),
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  },
]);
const page = await context.newPage();
await gotoMlro(page);

const report = { viewports: {} };
report.viewports["1920"] = await measureViewport(page);
await page.screenshot({ path: path.join(OUT, "verify-final-1920.png"), fullPage: true });

report.inventory = await inventory(page);
await page.screenshot({
  path: path.join(OUT, "verify-final-1920-expanded.png"),
  fullPage: true,
});

await page.goto(URL, { waitUntil: "domcontentloaded" });
await gotoMlro(page);

for (const vp of [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
]) {
  await page.setViewportSize(vp);
  await page.waitForTimeout(400);
  report.viewports[vp.name] = await measureViewport(page);
  await page.screenshot({
    path: path.join(OUT, `verify-final-${vp.name}.png`),
    fullPage: true,
  });
}

const m = report.viewports["1920"];
const summary = {
  blankSpace: {
    gapsOver24: m.gapsOver24,
    all: m.blanks,
  },
  columns: m.cols,
  dashSpan: m.dashSpan,
  ratio: m.ratio,
  textDensity: m.textDensity,
  inventoryFail: report.inventory.filter((x) => !x.ok),
  responsive: Object.fromEntries(
    Object.entries(report.viewports).map(([k, v]) => [
      k,
      {
        overflowX: v.scroll.overflowX,
        overflows: v.overflows,
        wrap: v.collapseWrap,
        colDiff: v.cols.diff,
      },
    ]),
  ),
};

fs.writeFileSync(path.join(OUT, "verify-final-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(summary, null, 2));
await browser.close();
