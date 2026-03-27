import type { Architecture } from "@/lib/types";

/**
 * SWIFT CSCF v2025 — mandatory/advisory control applicability by architecture type.
 * Source: official CSCF v2025 matrix (effective 01 July 2024).
 */

const A1_MANDATORY: string[] = [
  "1.1", "1.2", "1.3", "1.4",
  "2.1", "2.2", "2.3", "2.6", "2.7", "2.8", "2.9", "2.10",
  "3.1",
  "4.1", "4.2",
  "5.1", "5.2", "5.4",
  "6.1", "6.2", "6.3", "6.4",
  "7.1", "7.2",
];

const A2_MANDATORY: string[] = [
  "1.1", "1.2", "1.3", "1.4",
  "2.1", "2.2", "2.3", "2.6", "2.7", "2.8", "2.9", "2.10",
  "3.1",
  "4.1", "4.2",
  "5.1", "5.2", "5.4",
  "6.1", "6.2", "6.3", "6.4",
  "7.1", "7.2",
];

const A3_MANDATORY: string[] = [
  "1.1", "1.2", "1.3", "1.4",
  "2.1", "2.2", "2.3", "2.6", "2.7", "2.8", "2.9", "2.10",
  "3.1",
  "4.1", "4.2",
  "5.1", "5.2", "5.4",
  "6.1", "6.2", "6.4",
  "7.1", "7.2",
];

const A1_A2_A3_ADVISORY: string[] = [
  "2.4A", "2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A",
];

const A4_MANDATORY: string[] = [
  "1.2", "1.3", "1.4", "1.5",
  "2.2", "2.3", "2.6", "2.7", "2.8", "2.9",
  "3.1",
  "4.1", "4.2",
  "5.1", "5.2", "5.4",
  "6.1", "6.2", "6.3", "6.4",
  "7.1", "7.2",
];

const A4_ADVISORY: string[] = [
  "2.4A", "2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A",
];

const B_MANDATORY: string[] = [
  "1.2", "1.3", "1.4",
  "2.2", "2.3", "2.6", "2.7", "2.8", "2.9",
  "3.1",
  "4.1", "4.2",
  "5.1", "5.2", "5.4",
  "6.1", "6.4",
  "7.1", "7.2",
];

const B_ADVISORY: string[] = [
  "2.4A", "2.11A", "5.3A", "7.3A", "7.4A",
];

export const ARCHITECTURES_V2025: Architecture[] = [
  {
    id: "A1",
    name: "Architecture A1",
    subtitle: "Full Local SWIFT Infrastructure",
    description:
      "User owns and operates all SWIFT infrastructure on-premises or in their own data centre. " +
      "Includes messaging interface (Alliance Access / Alliance Entry), communication interface " +
      "(SwiftNet Link / Alliance Connect), HSM, jump server, and dedicated operator PCs — all " +
      "within a fully segregated secure zone. " +
      "31 controls apply: 24 mandatory + 7 advisory. Control 1.5 is NOT applicable to A1.",
    mandatoryControls: A1_MANDATORY,
    advisoryControls: A1_A2_A3_ADVISORY,
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cscfVersion: "2025",
    components: [
      "Messaging Interface (Alliance Access / Alliance Entry)",
      "Communication Interface (SwiftNet Link / Alliance Connect)",
      "Hardware Security Module (HSM)",
      "Jump Server / Bastion Host",
      "Dedicated Operator PCs",
      "SWIFT Secure Zone (fully dedicated)",
      "General IT Environment",
    ],
  },
  {
    id: "A2",
    name: "Architecture A2",
    subtitle: "Shared SWIFT Infrastructure (Service Bureau Managed)",
    description:
      "User communicates via SWIFT through a service bureau that operates the messaging and " +
      "communication interfaces on the user's behalf. The user still has local SWIFT-related " +
      "components (connector, operator PCs) in a secure zone but does not own the core " +
      "messaging/communication infrastructure. " +
      "31 controls apply: 24 mandatory + 7 advisory — identical applicability to A1. " +
      "Control 1.5 is NOT applicable to A2.",
    mandatoryControls: A2_MANDATORY,
    advisoryControls: A1_A2_A3_ADVISORY,
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cscfVersion: "2025",
    components: [
      "Customer Connector (local)",
      "Dedicated Operator PCs",
      "SWIFT Secure Zone (shared infra managed by service bureau)",
      "Service Bureau Messaging Interface",
      "General IT Environment",
    ],
  },
  {
    id: "A3",
    name: "Architecture A3",
    subtitle: "Connector (Alliance Lite2 / Similar)",
    description:
      "User connects to SWIFT using an application-level connector such as Alliance Lite2 within " +
      "their secure zone. No local messaging or communication interface — the connector handles " +
      "both roles. Lighter footprint than A1/A2 but still requires a secure zone. " +
      "30 controls apply: 23 mandatory + 7 advisory. " +
      "Control 1.5 is NOT applicable to A3. " +
      "Control 6.3 (Database Integrity) is explicitly NOT applicable to A3.",
    mandatoryControls: A3_MANDATORY,
    advisoryControls: A1_A2_A3_ADVISORY,
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cscfVersion: "2025",
    components: [
      "Alliance Lite2 Connector (or equivalent)",
      "Dedicated Operator PCs",
      "SWIFT Secure Zone (connector-based)",
      "General IT Environment",
    ],
  },
  {
    id: "A4",
    name: "Architecture A4",
    subtitle: "Customer Connector (Middleware / API / File Transfer)",
    description:
      "User operates a customer connector — middleware, API consumer, or file-transfer client — " +
      "that connects to SWIFT directly or via a service provider. No local messaging or " +
      "communication interface. Under CSCF v2025, many former Type B users with A2A flows are " +
      "reclassified to A4. Control 1.5 (Customer Environment Protection) is newly mandatory; " +
      "controls 1.1, 2.1, and 2.10 are not applicable. " +
      "29 controls apply: 22 mandatory + 7 advisory.",
    mandatoryControls: A4_MANDATORY,
    advisoryControls: A4_ADVISORY,
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cscfVersion: "2025",
    components: [
      "Customer Connector (middleware / API / file transfer)",
      "Operator PCs (general-purpose)",
      "Customer Secure Zone",
      "General IT Environment",
    ],
  },
  {
    id: "B",
    name: "Architecture B",
    subtitle: "No Local SWIFT Footprint (GUI Access Only)",
    description:
      "User has no local SWIFT infrastructure. Access is exclusively via a service bureau's " +
      "graphical user interface (browser-based GUI) — no application-to-application flows. " +
      "Minimal control scope focused on operator PC security, access management, and governance. " +
      "Under CSCF v2025, organisations with A2A flows must reclassify to A4. " +
      "23 controls apply: 18 mandatory + 5 advisory. " +
      "Not applicable: 1.1, 1.5, 2.1, 2.5A, 2.10, 6.2, 6.3, 6.5A.",
    mandatoryControls: B_MANDATORY,
    advisoryControls: B_ADVISORY,
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cscfVersion: "2025",
    components: [
      "General-purpose Operator PCs",
      "General IT Environment",
    ],
  },
];
