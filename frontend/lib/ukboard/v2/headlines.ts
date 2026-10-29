/**
 * UK Board v2 — the headline bar for every tab: the tab's worst status, the main problem in at most
 * 16 words and the ask as 2–3 facts. Every figure is computed from the store; the waiting-draft count
 * comes from the session (drafts the CRO has not yet approved).
 */
import { QUEUE, FINDINGS, TUNING } from "./agentsData";
import { attestationThisMonth, BOARD_CALLS, FIG, journeysWithoutOwner, MEASURES, REPORTABLE_EVENTS, routesDecided, rollupTotals, type MeasureStatus } from "./boardStore";
import { ROUTES } from "../v1/data";
import type { PersonaId } from "./personaViews";

export type HeadlineStatus = Extract<MeasureStatus, "red" | "amber" | "within">;
export interface Headline {
  status: HeadlineStatus;
  line: string;
  ask?: string;
}

const WORD = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const word = (n: number) => WORD[n] ?? String(n);

/** Board measures not within appetite. */
export const needAttention = () => ({ n: MEASURES.filter((m) => m.status !== "within").length, of: MEASURES.length });

export function headlineOf(persona: PersonaId, tab: string, waitingDrafts: number): Headline | null {
  const att = needAttention();
  const routes = routesDecided();
  const undecided = routes.total - routes.decided;
  const r = rollupTotals();
  const a = attestationThisMonth();
  const owners = journeysWithoutOwner();
  const notAttested = a.total - a.attested;
  const lastCall = BOARD_CALLS[BOARD_CALLS.length - 1].due;
  const restriction = REPORTABLE_EVENTS[0];
  const rRoutes = ROUTES.filter((x) => x.eventId === restriction.id);
  const rDecided = rRoutes.filter((x) => x.status === "decided").length;
  const option = TUNING.options.find((o) => o.id === TUNING.recommended)!;
  const packIn = FIG.pack.items - FIG.escalation.removedFromPack;
  const key = `${persona}:${tab}`;
  const H: Record<string, Headline> = {
    "board:overview": {
      status: "amber",
      line: "Savings growth is outrunning crime checks, and a customer restriction was breached.",
      ask: `Mortgages have room to grow · ${BOARD_CALLS.length} board calls by ${lastCall} · ${undecided} of ${routes.total} regulator routes undecided`,
    },
    "board:appetite": {
      status: "amber",
      line: `${att.n} of ${att.of} measures need attention; credit has room to loosen.`,
      ask: `Tighten savings checks? · Loosen high-LTV? · ${r.offTrack} metrics below off track`,
    },
    "board:obligatory": {
      status: "red",
      line: `A customer restriction was breached ${FIG.restriction.breaches} times; regulator decisions are due now.`,
      ask: `${undecided} of ${routes.total} routes undecided · ${restriction.decider} decides · board informed`,
    },
    "board:accountability": {
      status: "amber",
      line: `${word(owners.n)} customer journeys have no risk owner; ${notAttested} owners have not attested.`,
      ask: `Escalation takes ${FIG.escalation.medianMonths} months · ${FIG.escalation.removedFromPack} item removed from the pack`,
    },
    "board:ai": {
      status: "within",
      line: "Agents draft and flag; none acted without approval.",
      ask: `${FINDINGS.length} findings this quarter · ${waitingDrafts} drafts with the CRO · 0 actions without approval`,
    },
    "chair:committee": {
      status: "amber",
      line: "One decision is yours: restore the item removed from the pack.",
      ask: `${BOARD_CALLS.length} board calls · pack ${packIn} of ${FIG.pack.items} items · ${FIG.dates.brc}`,
    },
    "chair:risk": { status: "amber", line: `${att.n} of ${att.of} measures need attention; ${undecided} regulator routes undecided.` },
    "chair:oversight": { status: "amber", line: `Bad news takes ${FIG.escalation.medianMonths} months to reach committee; ${FIG.escalation.notEscalated} issues never arrived.` },
    "cro:actions": { status: "red", line: `${rRoutes.length - rDecided} regulator cases to send now; ${waitingDrafts} drafts need your approval.` },
    "cro:risk": { status: "amber", line: `${r.offTrack} metrics below the board measures are off track; ${r.l3Red} controls are red.` },
    "cro:reporting": { status: "red", line: `Restriction breach: ${rDecided} of ${rRoutes.length} routes decided; read-across ${restriction.readAcross.toLowerCase()}.` },
    "cro:agents": { status: "within", line: `Option ${option.id} catches ${option.caught} of ${TUNING.breaches} breaches within current capacity.` },
  };
  return H[key] ?? null;
}

/** Drafts still waiting for the CRO (AI drafts not yet approved or sent back). */
export const waitingDraftCount = (drafts: Record<string, { status: string } | undefined>) => QUEUE.filter((q) => drafts[q.draftId]?.status === "ai_draft").length;

export const PAGE_SOURCES = "Sources: risk register, treasury MI, lending, savings, financial-crime, fraud, security, complaints, regulatory log, board papers · measures as at 30 Sep 2026 · feeds to 28 Oct";
