/**
 * Keystone — Lion Brewery (Ceylon) PLC · v1.
 *
 * Client-side only CFO/CTO demo. IBM Plex Sans + IBM Plex Mono are scoped to
 * this route; the mono variable powers the tabular rupee numerals.
 */
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { KeystoneDemo } from "@/components/Srilanka_Retail/KeystoneDemo";
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

export default function SrilankaRetailV1Page() {
  return (
    <div
      className={`${plexSans.variable} ${plexMono.variable} min-h-screen w-full`}
      style={{ fontFamily: "var(--font-keystone-sans)" }}
    >
      <KeystoneDemo />
    </div>
  );
}
