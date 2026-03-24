import type { Architecture, ArchitectureId, CycleSchemaName } from "@/lib/types";

/**
 * SWIFT CSCF v2025 — 5 architecture types.
 *
 * A1: User owns & operates full SWIFT infrastructure in a dedicated secure zone.
 * A2: User shares SWIFT infrastructure with a service bureau; partial local footprint.
 * A3: User runs a connector (e.g. Alliance Lite2) within their secure zone.
 * A4: User operates a customer connector (middleware, API, file transfer client).
 * B:  No local SWIFT footprint — GUI/browser access via service bureau only.
 *
 * For **CSCF v2026** control applicability, see `CSCF_V2026_CONTROLS` and `getArchitecture(id, schemaName)`.
 */

function isSwift2026Schema(schemaName: CycleSchemaName | string | null | undefined): boolean {
  return String(schemaName ?? "").trim().toLowerCase() === "swift_2026";
}

/**
 * CSCF v2026 — mandatory vs advisory split follows SWIFT naming (suffix **A** = advisory).
 * Applicability matrix (official table — sourced from the SWIFT CSCF v2026 control table image):
 *
 * - **A1, A2, A3:** 31 controls each (25 mandatory + 6 advisory).
 *     Mandatory: 1.1–1.4, 2.1–2.4, 2.6–2.10, 3.1, 4.1–4.2, 5.1–5.2, 5.4, 6.1–6.4, 7.1–7.2
 *     Advisory:  2.5A, 2.11A, 5.3A, 6.5A, 7.3A, 7.4A
 *     (1.5 is NOT applicable to A1/A2/A3)
 *
 * - **A4:** 26 controls (20 mandatory + 6 advisory).
 *     Excludes vs A1: 1.1, 2.1, 2.4, 2.10, 6.2, 6.3 — but adds 1.5.
 *     Mandatory: 1.2–1.5, 2.2–2.3, 2.6–2.9, 3.1, 4.1–4.2, 5.1–5.2, 5.4, 6.1, 6.4, 7.1–7.2
 *     Advisory:  2.5A, 2.11A, 5.3A, 6.5A, 7.3A, 7.4A
 *
 * - **B:** 23 controls (19 mandatory + 4 advisory).
 *     Mandatory: 1.2–1.4, 2.2–2.3, 2.6–2.9, 3.1, 4.1–4.2, 5.1–5.2, 5.4, 6.1, 6.4, 7.1–7.2
 *     Advisory:  2.11A, 5.3A, 7.3A, 7.4A
 *     (1.1, 1.5, 2.1, 2.4, 2.5A, 2.10, 6.2, 6.3, 6.5A are NOT applicable to B)
 */
export const CSCF_V2026_CONTROLS: Record<
  ArchitectureId,
  { mandatoryControls: string[]; advisoryControls: string[]; domainIds: string[] }
> = {
  // ─── A1 ─────────────────────────────────────────────────────────────────────
  // 31 controls: 25 mandatory + 6 advisory. All controls except 1.5.
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

  // ─── A2 ─────────────────────────────────────────────────────────────────────
  // 31 controls: 25 mandatory + 6 advisory. Identical applicability to A1.
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

  // ─── A3 ─────────────────────────────────────────────────────────────────────
  // 31 controls: 25 mandatory + 6 advisory. Identical applicability to A1/A2.
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

  // ─── A4 ─────────────────────────────────────────────────────────────────────
  // 26 controls: 20 mandatory + 6 advisory.
  // Compared to A1: removes 1.1, 2.1, 2.4, 2.10, 6.2, 6.3 — adds 1.5.
  // Note: 2.4, 6.2, 6.3 are NOT applicable to A4 (confirmed from CSCF v2026 table).
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

  // ─── B ──────────────────────────────────────────────────────────────────────
  // 23 controls: 19 mandatory + 4 advisory.
  // No local SWIFT footprint; GUI/browser access only.
  // Not applicable: 1.1, 1.5, 2.1, 2.4, 2.5A, 2.10, 6.2, 6.3, 6.5A.
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
    /** Include F: control 2.8 (outsourcing) is in scope for B but mapped to domain F in `domains.ts`. */
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
};

const ALL_MANDATORY = [
  "1.1", "1.2", "1.3", "1.4", "1.5",
  "2.1", "2.2", "2.3", "2.6", "2.7", "2.8", "2.9", "2.10",
  "3.1", "4.1", "4.2", "5.1", "5.2", "5.4",
  "6.1", "6.2", "6.3", "6.4",
  "7.1", "7.2",
];
const ALL_ADVISORY = ["2.4A", "2.5A", "2.11A", "5.3A", "6.5A", "7.3A", "7.4A"];

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
      "1.1", "1.2", "1.3", "1.4", "1.5",
      "2.1", "2.2", "2.3", "2.6", "2.7", "2.8", "2.9",
      "3.1", "4.1", "4.2", "5.1", "5.2", "5.4",
      "6.1", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.4A", "2.5A", "2.11A", "5.3A", "6.2", "6.3", "6.5A", "7.3A", "7.4A"],
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
      "1.1", "1.2", "1.3", "1.4", "1.5",
      "2.1", "2.2", "2.3", "2.6", "2.7",
      "3.1", "4.1", "4.2", "5.1", "5.4",
      "6.1", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.4A", "2.5A", "2.8", "2.9", "5.2", "5.3A", "6.2", "6.3", "6.5A", "7.3A", "7.4A"],
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
      "2.2", "2.3", "2.6", "2.8", "2.9",
      "3.1", "4.1", "4.2", "5.1", "5.2", "5.4",
      "6.1", "6.4",
      "7.1", "7.2",
    ],
    advisoryControls: ["2.11A", "5.3A", "7.3A", "7.4A"],
    /** Include F: mandatory 2.8 maps to Third-Party & Outsourcing in `domains.ts`. */
    domainIds: ["A", "B", "C", "D", "E", "F", "G", "H"],
    cscfVersion: "2025",
    components: [
      "General-purpose Operator PCs",
      "General IT Environment",
    ],
  },
];

/**
 * Return architecture definitions with control lists and domains for the given cycle schema.
 * Use `swift_2026` for CSCF v2026 table; otherwise v2025 defaults from `ARCHITECTURES`.
 */
export function getArchitecturesForSchema(
  schemaName: CycleSchemaName | string | null | undefined
): Architecture[] {
  if (!isSwift2026Schema(schemaName)) {
    return ARCHITECTURES;
  }
  return ARCHITECTURES.map((a) => {
    const v = CSCF_V2026_CONTROLS[a.id as ArchitectureId];
    if (!v) return { ...a, cscfVersion: "2026" };
    return {
      ...a,
      mandatoryControls: v.mandatoryControls,
      advisoryControls: v.advisoryControls,
      domainIds: v.domainIds,
      cscfVersion: "2026",
    };
  });
}

/**
 * Lookup one architecture. Pass `schemaName` from the assessment cycle (`schema_name`) so v2026
 * control counts match the official matrix; omit for legacy v2025-only behaviour.
 */
export function getArchitecture(
  id: string,
  schemaName?: CycleSchemaName | string | null
): Architecture | undefined {
  const base = ARCHITECTURES.find((a) => a.id === id);
  if (!base) return undefined;
  if (!isSwift2026Schema(schemaName)) {
    return base;
  }
  const v = CSCF_V2026_CONTROLS[id as ArchitectureId];
  if (!v) {
    return { ...base, cscfVersion: "2026" };
  }
  return {
    ...base,
    mandatoryControls: v.mandatoryControls,
    advisoryControls: v.advisoryControls,
    domainIds: v.domainIds,
    cscfVersion: "2026",
  };
}

/**
 * Diagram/image references intentionally removed.
 * Keep these exports as no-op placeholders so existing imports do not break.
 */
export const ARCHITECTURE_DIAGRAMS: Record<string, string[]> = {};

export function getDiagramFolder(_version?: string | null): "" {
  return "";
}

export async function getArchitectureDiagramUrlAsync(
  _diagramFilename: string,
  _version?: string | null
): Promise<string> {
  return "";
}

export function getArchitectureDiagramUrl(_diagramFilename: string, _version?: string | null): string {
  return "";
}

export function getArchitectureDiagramPath(
  _architectureId: string,
  _extension?: "png" | "jpg" | "svg" | "webp",
  _version?: string | null
): string {
  return "";
}