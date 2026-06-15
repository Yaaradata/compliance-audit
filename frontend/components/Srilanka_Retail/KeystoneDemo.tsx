"use client";

import { useState } from "react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { KeystoneThemeProvider } from "./primitives/theme";
import { KEYSTONE_NAV, KEYSTONE_SCREENS, getNavItem, type KeystoneScreenId } from "./shell/config";
import { KeystoneHeader } from "./shell/KeystoneHeader";
import { KeystoneFooter } from "./shell/KeystoneFooter";
import "./keystone-theme.css";

function KeystoneShell() {
  const [screen, setScreen] = useState<KeystoneScreenId>("C1");
  const nodeState = useKeystoneStore((s) => s.reconciliation.nodeState);
  const resetDemo = useKeystoneStore((s) => s.resetDemo);

  const rippled = nodeState === "RECONCILED";
  const activeNav = getNavItem(screen);
  const Active = KEYSTONE_SCREENS[screen];

  function handleReset() {
    resetDemo();
    setScreen("C1");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <KeystoneHeader
        screen={screen}
        activeNav={activeNav}
        rippled={rippled}
        onSelectScreen={setScreen}
        onReset={handleReset}
        navItems={KEYSTONE_NAV}
      />

      <main className="flex-1 px-5 py-6 sm:px-8">
        <Active />
      </main>

      <KeystoneFooter />
    </div>
  );
}

export function KeystoneDemo() {
  return (
    <KeystoneThemeProvider>
      <KeystoneShell />
    </KeystoneThemeProvider>
  );
}
