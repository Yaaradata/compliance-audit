import type { Architecture, ArchitectureId } from "../types";

/**
 * SWIFT CSCF v2025 — 5 architecture types.
 *
 * A1: User owns & operates full SWIFT infrastructure in a dedicated secure zone.
 * A2: User shares SWIFT infrastructure with a service bureau; partial local footprint.
 * A3: User runs a connector (e.g. Alliance Lite2) within their secure zone.
 * A4: User operates a customer connector (middleware, API, file transfer client).
 * B:  No local SWIFT footprint — GUI/browser access via service bureau only.
 */

const ALL_MANDATORY = [
  "1.1","1.2","1.3","1.4","1.5",
  "2.1","2.2","2.3","2.6","2.7","2.8","2.9","2.10",
  "3.1","4.1","4.2","5.1","5.2","5.4",
  "6.1","6.2","6.3","6.4",
  "7.1","7.2",
];
const ALL_ADVISORY = ["2.4A","2.5A","2.11A","5.3A","6.5A","7.3A","7.4A"];

export const ARCHITECTURES: Architecture[] = [
  {
    id: "A1",
    name: "Architecture A1",
    subtitle: "Full Local SWIFT Infrastructure",
    description:
      "User owns and operates all SWIFT infrastructure on-premises or in their own data centre. Includes messaging interface (Alliance Access / Alliance Entry), communication interface (SwiftNet Link / Alliance Connect), HSM, jump server, and dedicated operator PCs — all within a fully segregated secure zone.",
    mandatoryControls: ALL_MANDATORY,
    advisoryControls: ALL_ADVISORY,
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
      "User communicates via SWIFT through a service bureau that operates the messaging and communication interfaces on the user's behalf. The user still has local SWIFT-related components (connector, operator PCs) in a secure zone but does not own the core messaging/communication infrastructure.",
    mandatoryControls: ALL_MANDATORY,
    advisoryControls: ALL_ADVISORY,
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
      "User connects to SWIFT using an application-level connector such as Alliance Lite2 within their secure zone. No local messaging or communication interface — the connector handles both roles. Lighter footprint than A1/A2 but still requires a secure zone.",
    mandatoryControls: [
      "1.1","1.2","1.3","1.4","1.5",
      "2.1","2.2","2.3","2.6","2.7","2.8","2.9",
      "3.1","4.1","4.2","5.1","5.2","5.4",
      "6.1","6.4",
      "7.1","7.2",
    ],
    advisoryControls: ["2.4A","2.5A","2.11A","5.3A","6.2","6.3","6.5A","7.3A","7.4A"],
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
      "User operates a customer connector — middleware, API consumer, or file-transfer client — that connects to SWIFT directly or via a service bureau. No local messaging/communication interface. Under CSCF v2025 many former Type B users with A2A flows are reclassified to A4. Control 1.5 (Customer Environment Protection) is newly mandatory; several controls become advisory pending v2026.",
    mandatoryControls: [
      "1.1","1.2","1.3","1.4","1.5",
      "2.1","2.2","2.3","2.6","2.7",
      "3.1","4.1","4.2","5.1","5.4",
      "6.1","6.4",
      "7.1","7.2",
    ],
    advisoryControls: ["2.4A","2.5A","2.8","2.9","5.2","5.3A","6.2","6.3","6.5A","7.3A","7.4A"],
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
      "User has no local SWIFT infrastructure. Access is exclusively via a service bureau's graphical user interface (browser-based GUI) with no application-to-application flows. Minimal control scope — focused on operator PC security, access management, and governance. Under CSCF v2025, organisations with A2A flows must reclassify to A4.",
    mandatoryControls: [
      "1.2",
      "2.2","2.3","2.6","2.8","2.9",
      "3.1","4.1","4.2","5.1","5.2","5.4",
      "6.1","6.4",
      "7.1","7.2",
    ],
    advisoryControls: ["2.11A","5.3A","7.3A","7.4A"],
    domainIds: ["A", "B", "C", "D", "E", "G", "H"],
    cscfVersion: "2025",
    components: [
      "General-purpose Operator PCs",
      "General IT Environment",
    ],
  },
];

export function getArchitecture(id: string): Architecture | undefined {
  return ARCHITECTURES.find((a) => a.id === id);
}

/** Path to the architecture diagram image in public/architecture-diagrams. Add A1.png, A2.png, A3.png, A4.png, B.png (or .jpg, .svg, .webp). */
export function getArchitectureDiagramPath(architectureId: string, extension: "png" | "jpg" | "svg" | "webp" = "png"): string {
  return `/architecture-diagrams/${architectureId}.${extension}`;
}

export function getControlApplicability(archId: ArchitectureId, controlId: string): "mandatory" | "advisory" | "n/a" {
  const arch = getArchitecture(archId);
  if (!arch) return "n/a";
  if (arch.mandatoryControls.includes(controlId)) return "mandatory";
  if (arch.advisoryControls.includes(controlId)) return "advisory";
  return "n/a";
}
