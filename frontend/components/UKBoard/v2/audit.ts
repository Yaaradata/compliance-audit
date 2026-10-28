/**
 * UK Board v2 — in-browser audit (development only). Run window.__ukbAudit() in the signed-in app:
 * it walks every persona and tab and reports visible words, chart count (data-chart roots), tinted
 * cards other than the posture strip, figure ids rendered twice (dev registry), question-mark card
 * titles, horizontal overflow and page height. Run it at each width to check 1440, 1280 and 1024.
 */
import { PERSONA_VIEWS, type PersonaId } from "@/lib/ukboard/v2/personaViews";
import type { Action } from "./store";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const TINT = /\bbg-(amber|red|emerald|green|yellow|violet|indigo|rose|sky)-(50|100)\b/;

function measureTab() {
  const main = document.querySelector("main")!;
  // Live innerText (keeps cell breaks); each dropdown counts as one word, not every option.
  /** A word is a token with a letter or digit; separators (·, —, ▲, ›) are not words. */
  const count = (t: string) => t.split(/\s+/).filter((x) => /[A-Za-z0-9]/.test(x)).length;
  const optionWords = [...main.querySelectorAll("select")].reduce((n, sel) => n + count(sel.innerText) - 1, 0);
  const words = count(main.innerText) - optionWords;
  const charts = main.querySelectorAll("[data-chart]").length;
  const tinted = [...main.querySelectorAll<HTMLElement>("section, [data-section] > *")].filter((el) => !el.dataset.tinted && TINT.test(el.className) && el.getBoundingClientRect().height > 40).length;
  const figs = (window as unknown as { __ukbFigures?: Map<string, number> }).__ukbFigures;
  const dups = figs ? [...figs.entries()].filter(([, n]) => n > 1).map(([k]) => k) : [];
  const questions = [...main.querySelectorAll("h1, h2")].filter((h) => h.textContent?.trim().endsWith("?")).length;
  const overflow = document.documentElement.scrollWidth > window.innerWidth || [...main.querySelectorAll<HTMLElement>("[data-section]")].some((s) => s.scrollWidth > s.clientWidth + 1);
  const height = (main.getBoundingClientRect().bottom + window.scrollY) / window.innerHeight;
  return { words, charts, tinted, dups, questions, overflow, height };
}

export function installAudit(dispatch: (a: Action) => void) {
  (window as unknown as { __ukbAudit?: () => Promise<string> }).__ukbAudit = async () => {
    const lines = [`width ${window.innerWidth} | persona | tab | words | charts | tinted | dup figures | ? titles | overflow | screens`];
    for (const p of Object.keys(PERSONA_VIEWS) as PersonaId[]) {
      dispatch({ type: "SET_PERSONA", persona: p });
      await sleep(300);
      for (const t of PERSONA_VIEWS[p].tabs) {
        dispatch({ type: "SET_TAB", tab: t.id });
        await sleep(600);
        const m = measureTab();
        lines.push(`| ${PERSONA_VIEWS[p].label} | ${t.label} | ${m.words} | ${m.charts} | ${m.tinted} | ${m.dups.join(",") || 0} | ${m.questions} | ${m.overflow ? "yes" : "no"} | ${m.height.toFixed(2)}`);
      }
    }
    dispatch({ type: "SET_PERSONA", persona: "board" });
    return lines.join("\n");
  };
}
