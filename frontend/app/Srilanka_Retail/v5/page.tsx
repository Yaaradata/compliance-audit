/**
 * Keystone v5 — Lion Brewery (Ceylon) PLC.
 * Sidebar layout: nav expands on hover inside the sidebar, collapses on mouse leave.
 */
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import KeystoneV5Demo from "@/components/Srilanka_Retail/v5/KeystoneV5Demo";

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

export default function SrilankaRetailV5Page() {
  return (
    <div
      className={`${plexSans.variable} ${plexMono.variable} min-h-screen w-full`}
      style={{ fontFamily: "var(--font-keystone-sans)" }}
    >
      <KeystoneV5Demo />
    </div>
  );
}
