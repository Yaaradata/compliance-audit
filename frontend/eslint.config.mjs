import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Banned overstated prose under UKPA signals.
 * Fail the build (eslint), not the 2am review.
 *
 * WHY "illegal": Nationwide Final Notice ¶4.72–4.73 calls the firm's
 * three-month re-notification procedure INAPPROPRIATE — not illegal,
 * systemic, or concealment.
 */
const UKPA_BANNED_PROSE = [
  {
    selector: "Literal[value=/has breached/i]",
    message:
      "UKPA: banned prose \"has breached\". Use Predicate + renderCardCopy() — never free-prose findings language.",
  },
  {
    selector: "Literal[value=/is non-compliant/i]",
    message:
      "UKPA: banned prose \"is non-compliant\". Use Predicate + renderCardCopy().",
  },
  {
    selector: "Literal[value=/illegal/i]",
    message:
      "UKPA: banned prose \"illegal\". Nationwide FN ¶4.72–4.73 says inappropriate — not illegal. One overstated word ends the catalogue.",
  },
  {
    selector: "Literal[value=/violation/i]",
    message:
      "UKPA: banned prose \"violation\". Prefer evidence-bound Predicate copy.",
  },
  {
    selector: "Literal[value=/at risk/i]",
    message: "UKPA: banned prose \"at risk\". Prefer Predicate + renderCardCopy().",
  },
  {
    selector: "Literal[value=/watch closely/i]",
    message: "UKPA: banned prose \"watch closely\". Prefer Predicate + renderCardCopy().",
  },
  {
    selector: "Literal[value=/critical exposure/i]",
    message: "UKPA: banned prose \"critical exposure\". Prefer Predicate + renderCardCopy().",
  },
  {
    selector: "TemplateElement[value.raw=/has breached/i]",
    message: "UKPA: banned prose \"has breached\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/is non-compliant/i]",
    message: "UKPA: banned prose \"is non-compliant\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/illegal/i]",
    message: "UKPA: banned prose \"illegal\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/violation/i]",
    message: "UKPA: banned prose \"violation\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/at risk/i]",
    message: "UKPA: banned prose \"at risk\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/watch closely/i]",
    message: "UKPA: banned prose \"watch closely\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/critical exposure/i]",
    message: "UKPA: banned prose \"critical exposure\" in template literal.",
  },
  {
    selector: "JSXText[value=/has breached|is non-compliant|illegal|violation|at risk|watch closely|critical exposure/i]",
    message: "UKPA: banned prose in JSX text. Use Predicate + renderCardCopy().",
  },
];

/**
 * v6-only additions: the Exposure lens ranks CLUSTERS, never people. No phrase
 * may score or verdict an individual customer.
 */
const UKPA_EXPOSURE_BANNED_PROSE = [
  {
    selector: "Literal[value=/exit this client/i]",
    message:
      "UKPA v6: banned prose \"exit this client\". The exit-candidate lens ranks clusters, never names or actions an individual customer.",
  },
  {
    selector: "Literal[value=/score this customer/i]",
    message:
      "UKPA v6: banned prose \"score this customer\". No individual customer scoring — the lens surfaces and routes; a human decides.",
  },
  {
    selector: "TemplateElement[value.raw=/exit this client/i]",
    message: "UKPA v6: banned prose \"exit this client\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/score this customer/i]",
    message: "UKPA v6: banned prose \"score this customer\" in template literal.",
  },
  {
    selector: "JSXText[value=/exit this client|score this customer/i]",
    message: "UKPA v6: banned prose in JSX text. The exposure lens ranks clusters, never individual customers.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["lib/UK_Process_Audit/signals/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...UKPA_BANNED_PROSE],
    },
  },
  {
    // UK Banking Audit v5 — same banned overstated prose, enforced structurally.
    files: [
      "components/UKBankingAudit/v5/**/*.{js,jsx,ts,tsx}",
      "lib/ukbankingaudit/v5/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": ["error", ...UKPA_BANNED_PROSE],
    },
  },
  {
    // UK Banking Audit v6 — v5's banned prose, extended for the Exposure lens:
    // it ranks clusters, never scores or verdicts an individual customer.
    files: [
      "components/UKBankingAudit/v6/**/*.{js,jsx,ts,tsx}",
      "lib/ukbankingaudit/v6/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": ["error", ...UKPA_BANNED_PROSE, ...UKPA_EXPOSURE_BANNED_PROSE],
    },
  },
]);

export default eslintConfig;
