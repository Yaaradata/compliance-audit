"use client";

import { Radio } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import { SideNav } from "./layout/SideNav";
import { TopBar } from "./layout/TopBar";
import { ToastHost } from "./layout/ToastHost";
import { Dashboard } from "./screens/Dashboard";
import { ExciseWorkbench } from "./screens/ExciseWorkbench";
import { BatchTracker } from "./screens/BatchTracker";
import { PosLicences } from "./screens/PosLicences";
import { EvidenceScreen } from "./screens/EvidenceScreen";
import { Registry } from "./screens/Registry";
import { DomainDrillSlideOver } from "./overlays/DomainDrillSlideOver";
import { FindingSlideOver } from "./overlays/FindingSlideOver";
import { EvidencePackBuilderModal } from "./overlays/EvidencePackBuilderModal";
import { ReturnDraftModal } from "./overlays/ReturnDraftModal";

function ScreenRouter() {
  const { activeScreen } = useApp();
  switch (activeScreen) {
    case "dashboard":
      return <Dashboard />;
    case "excise":
      return <ExciseWorkbench />;
    case "batches":
      return <BatchTracker />;
    case "pos-licences":
      return <PosLicences />;
    case "evidence":
      return <EvidenceScreen />;
    case "registry":
      return <Registry />;
    default: {
      const _exhaustive: never = activeScreen;
      return _exhaustive;
    }
  }
}

function OverlayHost() {
  const { overlayStack } = useApp();
  return (
    <>
      {overlayStack.map((o, i) => {
        switch (o.name) {
          case "domainDrill":
            return o.domainId ? <DomainDrillSlideOver key={`dd-${i}`} domainId={o.domainId} /> : null;
          case "finding":
            return o.findingId ? <FindingSlideOver key={`f-${i}`} findingId={o.findingId} /> : null;
          case "evidencePack":
            return o.scope && o.format ? <EvidencePackBuilderModal key={`ep-${i}`} scope={o.scope} format={o.format} /> : null;
          case "returnDraft":
            return <ReturnDraftModal key={`rd-${i}`} />;
          default: {
            const _exhaustive: never = o.name;
            return _exhaustive;
          }
        }
      })}
    </>
  );
}

function InspectionBanner() {
  const { inspectionMode } = useApp();
  if (!inspectionMode) return null;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium"
      style={{ backgroundColor: "color-mix(in srgb, var(--status-risk) 22%, var(--bg-app))", color: "var(--text-primary)", borderBottom: "1px solid var(--status-risk)" }}
    >
      <Radio size={14} style={{ color: "var(--status-risk)" }} />
      Inspection mode — SLSI · Evidence packs available on every screen
    </div>
  );
}

function Layout() {
  const { inspectionMode, toggleInspectionMode } = useApp();
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SideNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <InspectionBanner />
        <div className="flex items-center justify-end px-4 py-1.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={toggleInspectionMode}
            className="rounded px-2.5 py-1 text-[11px] transition-colors"
            style={{ backgroundColor: inspectionMode ? "var(--status-risk)" : "var(--surface-raised)", color: inspectionMode ? "#fff" : "var(--text-secondary)" }}
          >
            Inspection mode {inspectionMode ? "ON" : "OFF"}
          </button>
        </div>
        <main className="lion-scroll flex-1 overflow-y-auto">
          <ScreenRouter />
        </main>
      </div>
      <OverlayHost />
      <ToastHost />
    </div>
  );
}

export function LionComplianceApp() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
