"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, RotateCcw } from "lucide-react";
import { createInitialStore } from "@/lib/Srilanka_Retail/v4/seed";
import type { KeystoneDataV4, V4ScreenId } from "@/lib/Srilanka_Retail/v4/types";
import {
  KeystoneV4ThemeProvider,
  KeystoneV4ThemeToggle,
  useKeystoneV4Colors,
  useKeystoneV4ThemeMode,
} from "./theme/KeystoneV4ThemeProvider";
import { Eyebrow } from "./primitives/ui";
import { HeroC1 } from "./screens/HeroC1";
import { ScreenC2 } from "./screens/ScreenC2";
import { ScreenC3 } from "./screens/ScreenC3";
import { ScreenC4 } from "./screens/ScreenC4";
import { ScreenC5 } from "./screens/ScreenC5";
import { ScreenC6 } from "./screens/ScreenC6";
import { SidebarNav, V4_SIDEBAR_NAV } from "./shell/SidebarNav";

function KeystoneV4DemoInner({
  mode,
  onToggleTheme,
}: {
  mode: ReturnType<typeof useKeystoneV4ThemeMode>[0];
  onToggleTheme: () => void;
}) {
  const C = useKeystoneV4Colors();
  const [store, setStore] = useState<KeystoneDataV4>(() => createInitialStore());
  const [screen, setScreen] = useState<V4ScreenId>("C1");
  const [investigating, setInvestigating] = useState(false);
  const [varianceDisp, setVarianceDisp] = useState(3.2);
  const [rippled, setRippled] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function reconcile() {
    setInvestigating(false);
    if (reduced.current) {
      setVarianceDisp(0);
    } else {
      const start = performance.now();
      const from = 3.2;
      const dur = 850;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVarianceDisp(+(from * (1 - eased)).toFixed(2));
        if (p < 1) requestAnimationFrame(tick);
        else setVarianceDisp(0);
      };
      requestAnimationFrame(tick);
    }
    setStore((prev) => {
      const next = structuredClone(prev);
      const stk = next.reconciliation.streams.find((s) => s.key === "stickersConsumed");
      if (stk) {
        stk.status = "AGREE";
        stk.value = 12400;
      }
      next.reconciliation.nodeState = "RECONCILED";
      next.reconciliation.variance.status = "CLEARED";
      next.reconciliation.variance.amount = 0;
      if (!next.evidence.EXCISE.some((e) => e.id === "appended")) {
        next.evidence.EXCISE.push({
          id: "appended",
          label: "Four-way reconciliation — May 2026",
          from: "C1",
          status: "CHECKED",
          signedBy: "Keystone (auto)",
          ts: "live",
          records: [
            "Packaged 12,400 = permits 12,400 = tickets 12,400",
            "Expected duty Rs 79.36M reconciled · variance Rs 0",
            "Duty-defensibility evidence generated automatically",
          ],
        });
      }
      next.posture["EXCISE|DUTY"] = "OK";
      return next;
    });
    setRippled(true);
  }

  function generateReport(regen?: boolean) {
    if (regen) {
      setReportGenerated(false);
      return;
    }
    setGenerating(true);
    const finish = () => {
      setGenerating(false);
      setReportGenerated(true);
      setToast("Report generated");
    };
    if (reduced.current) finish();
    else setTimeout(finish, 650);
  }

  function reset() {
    setStore(createInitialStore());
    setInvestigating(false);
    setVarianceDisp(3.2);
    setRippled(false);
    setReportGenerated(false);
    setGenerating(false);
    setScreen("C1");
  }

  const active = V4_SIDEBAR_NAV.find((n) => n[0] === screen)!;

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden lg:block"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
      }}
    >
      <SidebarNav screen={screen} onScreenChange={setScreen} rippled={rippled} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-6 sm:px-8 lg:ml-64 lg:h-screen lg:flex-none lg:px-10 xl:px-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Eyebrow>{`Keystone · ${active[1]}`}</Eyebrow>
              <h1 className="mt-1 text-lg font-semibold tracking-tight">{active[1]}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px]"
                style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}
              >
                Period: May 2026 <ChevronDown size={13} />
              </span>
              <KeystoneV4ThemeToggle mode={mode} onToggle={onToggleTheme} />
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium focus:outline-none focus-visible:ring-2"
                style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}
              >
                <RotateCcw size={13} /> Reset demo
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {screen === "C1" && (
              <HeroC1
                store={store}
                varianceDisp={varianceDisp}
                investigating={investigating}
                setInvestigating={setInvestigating}
                onReconcile={reconcile}
              />
            )}
            {screen === "C2" && <ScreenC2 store={store} />}
            {screen === "C3" && <ScreenC3 store={store} />}
            {screen === "C4" && <ScreenC4 store={store} justAppended={rippled} onToast={setToast} />}
            {screen === "C5" && <ScreenC5 store={store} />}
            {screen === "C6" && (
              <ScreenC6
                store={store}
                generated={reportGenerated}
                generating={generating}
                onGenerate={generateReport}
                onToast={setToast}
              />
            )}

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] leading-relaxed" style={{ color: C.faint }}>
            Figures carry their provenance; most are now sourced.
            <span className="inline-flex items-center gap-1">
              <span style={{ color: C.green }}>●</span> Sourced / verified
            </span>
            <span className="inline-flex items-center gap-1">
              <span style={{ color: C.amber }}>●</span> Illustrative
            </span>
            <span className="inline-flex items-center gap-1">
              <span style={{ color: C.faint }}>●</span> Assumption / validate
            </span>
            <span className="inline-flex items-center gap-1">
              <span style={{ color: C.open }}>●</span> Open range
            </span>
          </p>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2" role="status">
          <div
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium shadow-lg"
            style={{ background: C.panel, color: C.text, border: `1px solid ${C.greenEdge}` }}
          >
            <CheckCircle2 size={15} color={C.green} /> {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KeystoneV4Demo() {
  const [mode, setMode] = useKeystoneV4ThemeMode();

  return (
    <KeystoneV4ThemeProvider mode={mode}>
      <KeystoneV4DemoInner
        mode={mode}
        onToggleTheme={() => setMode(mode === "light" ? "dark" : "light")}
      />
    </KeystoneV4ThemeProvider>
  );
}
