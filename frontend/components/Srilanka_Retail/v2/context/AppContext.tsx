"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PERSONA,
  getPersona,
  type Persona,
  type PersonaId,
} from "@/lib/Srilanka_Retail/v2/personas";
import { mockData } from "@/lib/Srilanka_Retail/v2/mockData";
import type {
  CustomerLicence,
  DomainId,
  RegulatorFormat,
  ScreenId,
} from "@/lib/Srilanka_Retail/v2/types";

export type OverlayName = "domainDrill" | "finding" | "evidencePack" | "returnDraft";

export interface PackScope {
  type: "period" | "batch" | "shipment" | "domain";
  ref: string;
}

export interface Toast {
  id: number;
  message: string;
  kind: "success" | "info" | "warn";
}

interface OverlayEntry {
  name: OverlayName;
  domainId?: DomainId;
  findingId?: string;
  scope?: PackScope;
  format?: RegulatorFormat;
}

interface AppContextValue {
  // persona
  persona: Persona;
  setPersona: (id: PersonaId) => void;

  // navigation
  activeScreen: ScreenId;
  navigate: (screen: ScreenId) => void;

  // selection
  activeBatchId: string;
  setActiveBatchId: (id: string) => void;
  selectedRowId: string;
  setSelectedRowId: (id: string) => void;
  selectedFlNo: string | null;
  setSelectedFlNo: (flNo: string | null) => void;

  // overlays (stacked)
  overlayStack: OverlayEntry[];
  topOverlay: OverlayEntry | null;
  openDomainDrill: (domainId: DomainId) => void;
  openFinding: (findingId: string) => void;
  openEvidencePack: (scope: PackScope, format: RegulatorFormat) => void;
  openReturnDraft: () => void;
  closeTopOverlay: () => void;
  closeAllOverlays: () => void;

  // command bar
  inspectionMode: boolean;
  toggleInspectionMode: () => void;
  timeSelector: string;
  setTimeSelector: (label: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // toasts
  toasts: Toast[];
  pushToast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;

  // mutable demo state
  licences: CustomerLicence[];
  holdDispatch: (flNo: string) => void;
  resolvedFindings: Set<string>;
  resolveFinding: (findingId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const PERSONA_STORAGE_KEY = "lion-v2-persona";

export function AppProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(DEFAULT_PERSONA);
  const [activeScreen, setActiveScreen] = useState<ScreenId>(DEFAULT_PERSONA.homeScreen);
  const [activeBatchId, setActiveBatchId] = useState<string>("LL625-BIY-20260612-014");
  const [selectedRowId, setSelectedRowId] = useState<string>("GP-20260614-0312");
  const [selectedFlNo, setSelectedFlNo] = useState<string | null>("FL4/WP/COL/2026/0473");
  const [overlayStack, setOverlayStack] = useState<OverlayEntry[]>([]);
  const [inspectionMode, setInspectionMode] = useState(false);
  const [timeSelector, setTimeSelector] = useState("Now");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [licences, setLicences] = useState<CustomerLicence[]>(
    () => mockData.entities.customerLicences.map((l) => ({ ...l })),
  );
  const [resolvedFindings, setResolvedFindings] = useState<Set<string>>(new Set());

  // Hydrate persona from sessionStorage.
  useEffect(() => {
    const stored = sessionStorage.getItem(PERSONA_STORAGE_KEY) as PersonaId | null;
    if (stored) {
      const p = getPersona(stored);
      setPersonaState(p);
      setActiveScreen(p.homeScreen);
    }
  }, []);

  const pushToast = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setPersona = useCallback(
    (id: PersonaId) => {
      const p = getPersona(id);
      setPersonaState(p);
      sessionStorage.setItem(PERSONA_STORAGE_KEY, id);
      setActiveScreen(p.homeScreen);
      setOverlayStack([]);
      pushToast(`Switched to ${p.name} — ${p.role}`, "info");
    },
    [pushToast],
  );

  const navigate = useCallback((screen: ScreenId) => {
    setActiveScreen(screen);
    setOverlayStack([]);
  }, []);

  const openDomainDrill = useCallback((domainId: DomainId) => {
    setOverlayStack([{ name: "domainDrill", domainId }]);
  }, []);

  const openFinding = useCallback((findingId: string) => {
    setOverlayStack((prev) => [...prev, { name: "finding", findingId }]);
  }, []);

  const openEvidencePack = useCallback((scope: PackScope, format: RegulatorFormat) => {
    setOverlayStack((prev) => [...prev, { name: "evidencePack", scope, format }]);
  }, []);

  const openReturnDraft = useCallback(() => {
    setOverlayStack((prev) => [...prev, { name: "returnDraft" }]);
  }, []);

  const closeTopOverlay = useCallback(() => {
    setOverlayStack((prev) => prev.slice(0, -1));
  }, []);

  const closeAllOverlays = useCallback(() => setOverlayStack([]), []);

  const toggleInspectionMode = useCallback(() => {
    setInspectionMode((prev) => {
      const next = !prev;
      return next;
    });
  }, []);

  const holdDispatch = useCallback(
    (flNo: string) => {
      setLicences((prev) =>
        prev.map((l) =>
          l.flNo === flNo ? { ...l, dispatchDecision: "hold", eligibility: "hold" } : l,
        ),
      );
      pushToast("Dispatch blocked — audit event logged · Roshan Fernando notified", "warn");
    },
    [pushToast],
  );

  const resolveFinding = useCallback(
    (findingId: string) => {
      setResolvedFindings((prev) => new Set(prev).add(findingId));
    },
    [],
  );

  const topOverlay = overlayStack.length ? overlayStack[overlayStack.length - 1] : null;

  const value = useMemo<AppContextValue>(
    () => ({
      persona,
      setPersona,
      activeScreen,
      navigate,
      activeBatchId,
      setActiveBatchId,
      selectedRowId,
      setSelectedRowId,
      selectedFlNo,
      setSelectedFlNo,
      overlayStack,
      topOverlay,
      openDomainDrill,
      openFinding,
      openEvidencePack,
      openReturnDraft,
      closeTopOverlay,
      closeAllOverlays,
      inspectionMode,
      toggleInspectionMode,
      timeSelector,
      setTimeSelector,
      searchQuery,
      setSearchQuery,
      toasts,
      pushToast,
      dismissToast,
      licences,
      holdDispatch,
      resolvedFindings,
      resolveFinding,
    }),
    [
      persona,
      setPersona,
      activeScreen,
      navigate,
      activeBatchId,
      selectedRowId,
      selectedFlNo,
      overlayStack,
      topOverlay,
      openDomainDrill,
      openFinding,
      openEvidencePack,
      openReturnDraft,
      closeTopOverlay,
      closeAllOverlays,
      inspectionMode,
      toggleInspectionMode,
      timeSelector,
      searchQuery,
      toasts,
      pushToast,
      dismissToast,
      licences,
      holdDispatch,
      resolvedFindings,
      resolveFinding,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
