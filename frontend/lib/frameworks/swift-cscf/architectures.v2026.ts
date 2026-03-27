import type { ArchitectureId } from "@/lib/types";

/**
 * CSCF v2026 control applicability matrix.
 * Kept unchanged from existing implementation.
 */
export const CSCF_V2026_CONTROLS: Record<
  ArchitectureId,
  { mandatoryControls: string[]; advisoryControls: string[]; domainIds: string[] }
> = {
  A1: {
    mandatoryControls: [
      "1.1", "1.2", "1.3", "1.4",
      "2.1", "2.2", "2.3", "2.4", "2.6", "2.7", "2.8", "2.9", "2.10",
      "3.1",
      "4.1", "4.2",
      "5.1", "5.2", "5.4",
      "6.1", "6.2", "6.3", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A"],
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
  A2: {
    mandatoryControls: [
      "1.1", "1.2", "1.3", "1.4",
      "2.1", "2.2", "2.3", "2.4", "2.6", "2.7", "2.8", "2.9", "2.10",
      "3.1",
      "4.1", "4.2",
      "5.1", "5.2", "5.4",
      "6.1", "6.2", "6.3", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A"],
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
  A3: {
    mandatoryControls: [
      "1.1", "1.2", "1.3", "1.4",
      "2.1", "2.2", "2.3", "2.4", "2.6", "2.7", "2.8", "2.9", "2.10",
      "3.1",
      "4.1", "4.2",
      "5.1", "5.2", "5.4",
      "6.1", "6.2", "6.3", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A"],
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
  A4: {
    mandatoryControls: [
      "1.2", "1.3", "1.4", "1.5",
      "2.2", "2.3", "2.6", "2.7", "2.8", "2.9",
      "3.1",
      "4.1", "4.2",
      "5.1", "5.2", "5.4",
      "6.1", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A"],
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
  B: {
    mandatoryControls: [
      "1.2", "1.3", "1.4",
      "2.2", "2.3", "2.6", "2.7", "2.8", "2.9",
      "3.1",
      "4.1", "4.2",
      "5.1", "5.2", "5.4",
      "6.1", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.11A", "5.3A", "7.3A", "7.4A"],
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
};
