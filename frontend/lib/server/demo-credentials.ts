import "server-only";

import type { DemoRole } from "@/lib/demo-auth";

type DemoCredential = {
  email: string;
  password: string;
};

function credential(email: string | undefined, password: string | undefined): DemoCredential | null {
  const normalisedEmail = email?.trim();
  if (!normalisedEmail || !password) return null;
  return { email: normalisedEmail, password };
}

/** Read demo credentials only inside the server runtime. */
export function getDemoCredential(role: DemoRole): DemoCredential | null {
  switch (role) {
    case "compliance_officer":
      return credential(
        process.env.DEMO_COMPLIANCE_OFFICER_EMAIL,
        process.env.DEMO_COMPLIANCE_OFFICER_PASSWORD,
      );
    case "it_sme":
      return credential(process.env.DEMO_IT_SME_EMAIL, process.env.DEMO_IT_SME_PASSWORD);
    case "internal_reviewer_l1":
      return credential(
        process.env.DEMO_INTERNAL_REVIEWER_L1_EMAIL,
        process.env.DEMO_INTERNAL_REVIEWER_L1_PASSWORD,
      );
    case "internal_reviewer_l2":
      return credential(
        process.env.DEMO_INTERNAL_REVIEWER_L2_EMAIL,
        process.env.DEMO_INTERNAL_REVIEWER_L2_PASSWORD,
      );
    case "external_assessor":
      return credential(
        process.env.DEMO_EXTERNAL_ASSESSOR_EMAIL,
        process.env.DEMO_EXTERNAL_ASSESSOR_PASSWORD,
      );
    default: {
      const exhaustiveRole: never = role;
      return exhaustiveRole;
    }
  }
}
