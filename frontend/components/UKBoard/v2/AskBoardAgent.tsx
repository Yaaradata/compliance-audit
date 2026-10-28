"use client";

/**
 * UK Board v2 — "Ask the board agent" panel (Board member only). Answers are pre-built from the
 * pack data, 3–5 short lines, with cited measures that open the drawer. Free text is matched to
 * these topics only; nothing is generated or sent anywhere.
 */
import { useState } from "react";
import { X } from "lucide-react";
import { D1_OPTIONS, HARM_EVENT, JOURNEYS } from "@/lib/ukboard/v2/boardMemberData";
import { useDrawer } from "./drawerContext";
import { useStore } from "./store";
import { AiTag, btn, btnPrimary, focus, Label } from "./ui";

interface Answer {
  q: string;
  keywords: string[];
  lines: string[];
  cites: { label: string; drawer: string }[];
}

const restore = D1_OPTIONS[0];
const pace = D1_OPTIONS[1];
const savingsJourney = JOURNEYS.find((j) => j.journey === "Open a savings account")!;

export const ANSWERS: Answer[] = [
  {
    q: "Can we afford to restore capacity?",
    keywords: ["afford", "capacity", "handler", "restore", "cost"],
    lines: [
      `Restoring capacity costs ${restore.cost.replace("+13 handlers · ", "")} for 13 more handlers.`,
      "It keeps the 8 Dec campaign and about £300m of inflow.",
      "Capital is 16.8% against a 13.5% limit.",
      `The queue reaches green in ${restore.toGreen.replace("~", "about ")}, after the campaign starts.`,
    ],
    cites: [
      { label: "Alert queue age", drawer: "metric:u-capacity" },
      { label: "CET1 capital", drawer: "metric:u-cet1" },
      { label: "Decision 1", drawer: "decision:1" },
    ],
  },
  {
    q: "What happens if we pace growth?",
    keywords: ["pace", "slow", "delay", "campaign"],
    lines: [
      "The campaign moves back one quarter.",
      "Savings inflow is about £300m below plan.",
      `No extra cost; the queue reaches green in ${pace.toGreen.replace("~", "about ")}.`,
      "Savings balances are ahead of plan today (+£1.1bn vs +£0.8bn).",
    ],
    cites: [
      { label: "Decision 1", drawer: "decision:1" },
      { label: "Savings & new members", drawer: "franchise:O2" },
    ],
  },
  {
    q: "Why is monitoring coverage unconfirmed?",
    keywords: ["monitoring", "unconfirmed", "coverage", "data"],
    lines: [
      "Monitoring covers 94.0% of records, down 3.1 points.",
      "The owner signed off 3 hours before the data check finished.",
      "Same-day transactions are not yet checked.",
      "Until the check is re-run, the figure stays unconfirmed.",
    ],
    cites: [{ label: "Monitoring coverage", drawer: "metric:u-tm" }],
  },
  {
    q: "Which measures will turn amber before March?",
    keywords: ["amber", "march", "turn", "early warning", "projection"],
    lines: [
      "Liquidity (LCR): amber in about 9 weeks on the projection.",
      "Stable funding (NSFR): amber next quarter.",
      "High-LTV share reaches amber later, by Q2 2027.",
      "These are straight-line projections, not certainties.",
    ],
    cites: [
      { label: "Liquidity (LCR)", drawer: "metric:u-lcr" },
      { label: "Stable funding (NSFR)", drawer: "metric:u-nsfr" },
      { label: "High-LTV lending", drawer: "metric:u-hltv" },
    ],
  },
  {
    q: "What did other banks get fined for that applies to us?",
    keywords: ["fine", "fined", "bank", "enforcement", "other"],
    lines: [
      "Starling: accounts opened despite its own restriction. Touches our restriction.",
      "Monzo: controls did not keep pace with growth. Touches our alert queue.",
      "Metro: transactions never reached monitoring. Touches our monitoring coverage.",
      "All settled with no admission.",
    ],
    cites: [
      { label: "Customer restriction", drawer: "metric:u-restriction" },
      { label: "Alert queue age", drawer: "metric:u-capacity" },
      { label: "Monitoring coverage", drawer: "metric:u-tm" },
    ],
  },
  {
    q: "Who owns the savings journey risk?",
    keywords: ["own", "owner", "accountable", "savings journey", "who"],
    lines: [
      "No product risk owner is named for opening a savings account.",
      `The control sits with the ${savingsJourney.controlOwner}.`,
      `It drew ${savingsJourney.complaints} complaints this quarter.`,
      "Ask the CRO to name a product risk owner.",
    ],
    cites: [{ label: "Head of Financial Crime", drawer: "owner:Head of Financial Crime" }],
  },
];

const FALLBACK = "I can answer about growth, appetite, customers, decisions, regulators, owners and agents.";

function match(text: string): Answer | null {
  const t = text.toLowerCase();
  if (/harm|redress|rate error/.test(t)) {
    return {
      q: text,
      keywords: [],
      lines: [`${HARM_EVENT.name}: ${HARM_EVENT.contacted.toLocaleString("en-GB")} of ${HARM_EVENT.customers.toLocaleString("en-GB")} customers contacted.`, `Redress about ${HARM_EVENT.redress}; target ${HARM_EVENT.target}.`],
      cites: [{ label: "Mortgage rate error", drawer: "event:e-117" }],
    };
  }
  let best: Answer | null = null;
  let score = 0;
  for (const a of ANSWERS) {
    const s = a.keywords.filter((k) => t.includes(k)).length;
    if (s > score) {
      best = a;
      score = s;
    }
  }
  return best;
}

export default function AskBoardAgent({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const { open } = useDrawer();
  const [current, setCurrent] = useState<Answer | null>(null);
  const [text, setText] = useState("");
  const [miss, setMiss] = useState(false);
  const noted = current ? state.session.notes.some((n) => n.from === "Board agent" && n.text === current.q) : false;
  const ask = (a: Answer | null) => {
    setCurrent(a);
    setMiss(!a);
  };
  return (
    <aside role="dialog" aria-label="Ask the board agent" className="fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-full flex-col border-l border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <AiTag label="Board agent" /> Ask the board agent
        </span>
        <button type="button" aria-label="Close" onClick={onClose} className={`rounded p-1 hover:bg-slate-100 ${focus}`}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <div>
          <Label>Suggested questions</Label>
          <div className="mt-1 flex flex-col gap-1">
            {ANSWERS.map((a) => (
              <button key={a.q} type="button" aria-pressed={current?.q === a.q} onClick={() => ask(a)} className={`rounded-lg border px-3 py-2 text-left text-xs ${focus} ${current?.q === a.q ? "border-indigo-400 bg-indigo-50 text-indigo-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                {a.q}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            aria-label="Your question"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) ask(match(text));
            }}
            placeholder="Ask about this pack…"
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
          />
          <button type="button" onClick={() => text.trim() && ask(match(text))} className={btnPrimary}>
            Ask
          </button>
        </div>
        {miss ? <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">{FALLBACK}</p> : null}
        {current ? (
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
            <p className="flex items-center justify-between gap-2">
              <AiTag label="AI answer" />
              <span className="text-[10px] text-slate-500">Prepared by the board agent from this pack</span>
            </p>
            <p className="mt-1.5 text-[13px] font-semibold text-slate-900">{current.q}</p>
            <ul className="mt-1 space-y-1">
              {current.lines.map((l) => (
                <li key={l} className="text-xs text-slate-800">
                  {l}
                </li>
              ))}
            </ul>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500">Cited:</span>
              {current.cites.map((c) => (
                <button key={c.drawer} type="button" onClick={(e) => open(c.drawer, e.currentTarget)} className={`rounded font-semibold text-indigo-700 hover:underline ${focus}`}>
                  {c.label}
                </button>
              ))}
            </p>
            <button type="button" disabled={noted} onClick={() => dispatch({ type: "SAVE_NOTE", text: current.q, from: "Board agent" })} className={`${btn} mt-2`}>
              {noted ? "In my notes" : "Add to my notes"}
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
