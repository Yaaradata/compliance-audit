/**
 * Lion Brewery (Ceylon) PLC — AI Audit & Compliance Platform · V2.
 *
 * Full 6-screen MVP per Stage 7 build. Inter + JetBrains Mono are scoped to
 * this route; the mono variable powers tabular numerals on rupee columns.
 * Dark-mode only, all tokens scoped under `.lion-v2`.
 */
import { Inter, JetBrains_Mono } from "next/font/google";
import { LionComplianceApp } from "@/components/Srilanka_Retail/v2/LionComplianceApp";
import "@/components/Srilanka_Retail/v2/theme.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lion-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lion-mono",
});

export default function SrilankaRetailV2Page() {
  return (
    <div className={`lion-v2 h-screen w-full overflow-hidden ${inter.variable} ${jetbrains.variable}`}>
      <LionComplianceApp />
    </div>
  );
}
