import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Banned overstated prose under UKPA v3 + signals.
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
    files: [
      "components/UK_Process_Audit/v3/**/*.{js,jsx,ts,tsx}",
      "lib/UK_Process_Audit/signals/**/*.{js,jsx,ts,tsx}",
    ],
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
]);

export default eslintConfig;
