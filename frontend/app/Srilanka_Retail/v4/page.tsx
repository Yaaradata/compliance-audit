/**
 * Keystone v4 — Lion Brewery (Ceylon) PLC.
 * Sidebar layout with duty-at-stake, ageing, expandable evidence packs, dynamic rollup.
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
    <div className={`${plexSans.variable} ${plexMono.variable} h-screen w-full overflow-hidden`}>
      <KeystoneV4Demo />
    </div>
  );
}
