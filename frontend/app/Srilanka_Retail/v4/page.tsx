/**
 * Keystone v4 — Lion Brewery (Ceylon) PLC.
 * Top-nav shell (V2 layout) with v4 screens: duty-at-stake, ageing, evidence packs, dynamic rollup.
 */
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import KeystoneV4Demo from "@/components/Srilanka_Retail/v4/KeystoneV4Demo";

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

export default function SrilankaRetailV4Page() {
  return (
    <div
      className={`${plexSans.variable} ${plexMono.variable} min-h-screen w-full`}
      style={{ fontFamily: "var(--font-keystone-sans)" }}
    >
      <KeystoneV4Demo />
    </div>
  );
}
