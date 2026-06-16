"use client";

import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
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

function Layout() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
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
    <ThemeProvider>
      <AppProvider>
        <Layout />
      </AppProvider>
    </ThemeProvider>
  );
}
