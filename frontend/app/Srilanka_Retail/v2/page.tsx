/**
 * Keystone v2 — Lion Brewery (Ceylon) PLC.
 * Shares theme tokens + toggle with v1 (keystone-theme.css, KeystoneThemeProvider).
 */
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import KeystonePrototype from "@/components/Srilanka_Retail/v2/KeystonePrototype";
import "@/components/Srilanka_Retail/keystone-theme.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-keystone-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-keystone-mono",
});

export default function SrilankaRetailV2Page() {
  return (
    <div
      className={`${plexSans.variable} ${plexMono.variable} min-h-screen w-full`}
      style={{ fontFamily: "var(--font-keystone-sans)" }}
    >
      <KeystonePrototype />
    </div>
  );
}
