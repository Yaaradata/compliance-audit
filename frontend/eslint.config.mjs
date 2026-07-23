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

/**
 * v6 Ownership lens: names the ORPHAN (unallocated domain), never a person as
 * culpable. Trail age is a role-level record signal — not an individual
 * capability assessment.
 */
const UKPA_OWNERSHIP_BANNED_PROSE = [
  {
    selector: "Literal[value=/failed to/i]",
    message:
      "UKPA v6 Ownership: banned prose \"failed to\". Name the orphan domain, never a person as culpable.",
  },
  {
    selector: "Literal[value=/neglected/i]",
    message:
      "UKPA v6 Ownership: banned prose \"neglected\". Trail age is a role-level record signal, not an individual assessment.",
  },
  {
    selector: "Literal[value=/underperforming/i]",
    message:
      "UKPA v6 Ownership: banned prose \"underperforming\". Name the orphan, never a person as culpable.",
  },
  {
    selector: "Literal[value=/at fault/i]",
    message:
      "UKPA v6 Ownership: banned prose \"at fault\". Name the orphan, never a person as culpable.",
  },
  {
    selector: "Literal[value=/responsible for the breach/i]",
    message:
      "UKPA v6 Ownership: banned prose \"responsible for the breach\". Name the orphan, never a person as culpable.",
  },
  {
    selector: "TemplateElement[value.raw=/failed to/i]",
    message: "UKPA v6 Ownership: banned prose \"failed to\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/neglected/i]",
    message: "UKPA v6 Ownership: banned prose \"neglected\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/underperforming/i]",
    message: "UKPA v6 Ownership: banned prose \"underperforming\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/at fault/i]",
    message: "UKPA v6 Ownership: banned prose \"at fault\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/responsible for the breach/i]",
    message: "UKPA v6 Ownership: banned prose \"responsible for the breach\" in template literal.",
  },
  {
    selector:
      "JSXText[value=/failed to|neglected|underperforming|at fault|responsible for the breach/i]",
    message:
      "UKPA v6 Ownership: banned prose in JSX. Name the orphan domain, never a person as culpable.",
  },
];

/**
 * v6 Defensibility lens: readiness phrasing only — never guarantees review
 * outcome. Scoped to DefensibilityLens so Momentum "breach" EWI copy is untouched.
 */
const UKPA_DEFENSIBILITY_BANNED_PROSE = [
  {
    selector: "Literal[value=/will fail/i]",
    message:
      "UKPA v6 Defensibility: banned prose \"will fail\". Use readiness / not producible today.",
  },
  {
    selector: "Literal[value=/non-compliant/i]",
    message:
      "UKPA v6 Defensibility: banned prose \"non-compliant\". Use evidence gap / readiness.",
  },
  {
    selector: "Literal[value=/breach/i]",
    message:
      "UKPA v6 Defensibility: banned prose \"breach\". This lens is evidential readiness, not a finding of breach.",
  },
  {
    selector: "Literal[value=/guaranteed to pass/i]",
    message:
      "UKPA v6 Defensibility: banned prose \"guaranteed to pass\". Readiness is inferred, never a guarantee.",
  },
  {
    selector: "Literal[value=/guaranteed/i]",
    message:
      "UKPA v6 Defensibility: banned prose \"guaranteed\". Readiness is inferred, never a guarantee.",
  },
  {
    selector: "TemplateElement[value.raw=/will fail/i]",
    message: "UKPA v6 Defensibility: banned prose \"will fail\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/non-compliant/i]",
    message: "UKPA v6 Defensibility: banned prose \"non-compliant\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/breach/i]",
    message: "UKPA v6 Defensibility: banned prose \"breach\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/guaranteed/i]",
    message: "UKPA v6 Defensibility: banned prose \"guaranteed\" in template literal.",
  },
  {
    selector: "JSXText[value=/will fail|non-compliant|breach|guaranteed/i]",
    message:
      "UKPA v6 Defensibility: banned prose in JSX. Use readiness / evidence gap / not producible today.",
  },
];

/**
 * v6 Momentum lens: early warning indicators only — never "prediction" or
 * "forecast" (PRA SS1/23 model-governance; deterministic projection).
 */
const UKPA_MOMENTUM_BANNED_PROSE = [
  {
    selector: "Literal[value=/prediction/i]",
    message:
      "UKPA v6 Momentum: banned prose \"prediction\". Use \"early warning indicator\".",
  },
  {
    selector: "Literal[value=/forecast/i]",
    message:
      "UKPA v6 Momentum: banned prose \"forecast\". Use \"early warning indicator\".",
  },
  {
    selector: "Literal[value=/will breach/i]",
    message:
      "UKPA v6 Momentum: banned prose \"will breach\". Permitted: \"projected\", \"early warning indicator\", \"on current trend\".",
  },
  {
    selector: "Literal[value=/certain to/i]",
    message:
      "UKPA v6 Momentum: banned prose \"certain to\". Permitted: \"projected\", \"early warning indicator\", \"on current trend\".",
  },
  {
    selector: "TemplateElement[value.raw=/prediction/i]",
    message: "UKPA v6 Momentum: banned prose \"prediction\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/forecast/i]",
    message: "UKPA v6 Momentum: banned prose \"forecast\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/will breach/i]",
    message: "UKPA v6 Momentum: banned prose \"will breach\" in template literal.",
  },
  {
    selector: "TemplateElement[value.raw=/certain to/i]",
    message: "UKPA v6 Momentum: banned prose \"certain to\" in template literal.",
  },
  {
    selector: "JSXText[value=/prediction|forecast|will breach|certain to/i]",
    message:
      "UKPA v6 Momentum: banned prose in JSX. Use \"early warning indicator\", not prediction/forecast.",
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
    // UK Banking Audit v6 — Exposure / Ownership / Momentum banned prose.
    files: [
      "components/UKBankingAudit/v6/**/*.{js,jsx,ts,tsx}",
      "lib/ukbankingaudit/v6/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...UKPA_BANNED_PROSE,
        ...UKPA_EXPOSURE_BANNED_PROSE,
        ...UKPA_OWNERSHIP_BANNED_PROSE,
        ...UKPA_MOMENTUM_BANNED_PROSE,
        {
          selector: "Literal[value=/will fail/i]",
          message: "UKPA v6: banned prose \"will fail\". Prefer readiness / evidence-gap phrasing.",
        },
        {
          selector: "Literal[value=/guaranteed/i]",
          message: "UKPA v6: banned prose \"guaranteed\". Readiness is inferred, never a guarantee.",
        },
        {
          selector: "TemplateElement[value.raw=/will fail/i]",
          message: "UKPA v6: banned prose \"will fail\" in template literal.",
        },
        {
          selector: "TemplateElement[value.raw=/guaranteed/i]",
          message: "UKPA v6: banned prose \"guaranteed\" in template literal.",
        },
        {
          selector: "JSXText[value=/will fail|guaranteed/i]",
          message: "UKPA v6: banned prose in JSX. Prefer readiness / evidence-gap phrasing.",
        },
      ],
    },
  },
  {
    // Defensibility lens only — "breach" ban must not hit Momentum EWI copy.
    files: ["components/UKBankingAudit/v6/DefensibilityLens.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...UKPA_BANNED_PROSE,
        ...UKPA_EXPOSURE_BANNED_PROSE,
        ...UKPA_OWNERSHIP_BANNED_PROSE,
        ...UKPA_MOMENTUM_BANNED_PROSE,
        ...UKPA_DEFENSIBILITY_BANNED_PROSE,
      ],
    },
  },
]);

export default eslintConfig;
