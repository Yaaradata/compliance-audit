import type { SwiftSystem, AccessPoint, SwiftZone, Vendor } from "@/lib/types";

export const SWIFT_SYSTEMS: SwiftSystem[] = [
  { name: "Alliance Gateway" },
  { name: "Alliance Lite2" },
  { name: "Alliance Access" },
  { name: "Messaging Interface" },
  { name: "Communication Interface" },
  { name: "Operator PC-1" },
  { name: "Operator PC-2" },
  { name: "HSM (Hardware Security Module)" },
  { name: "Jump Server" },
  { name: "File Transfer Server" },
];

export const ACCESS_POINTS: AccessPoint[] = [
  { name: "Alliance Web Platform", type: "Web" },
  { name: "Alliance Lite2 AutoClient", type: "Desktop" },
  { name: "SWIFT Gateway Console", type: "Console" },
  { name: "Remote Admin VPN", type: "VPN" },
  { name: "Service Bureau Portal", type: "Web" },
];

export const SWIFT_ZONES: SwiftZone[] = [
  { id: "secure", name: "SWIFT Secure Zone", description: "Core SWIFT infrastructure — Alliance Gateway, messaging interface, HSM" },
  { id: "dmz", name: "SWIFT DMZ / Buffer Zone", description: "Jump servers, file transfer servers, proxy systems" },
  { id: "general", name: "General IT / Corporate Zone", description: "Corporate network, back-office systems, operator PCs (non-SWIFT)" },
  { id: "connector", name: "Customer Connector Zone (A1 only)", description: "Customer-facing connectors with equivalent protection" },
];

export const REVIEW_QUARTERS = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"];

export const VENDORS: Vendor[] = [
  { id: "v1", name: "SecureNet Solutions", classification: "Critical", access: "Full admin — Alliance Gateway", swiftComponents: "Alliance Gateway, HSM" },
  { id: "v2", name: "CloudCo Managed Services", classification: "High", access: "Monitoring only", swiftComponents: "SIEM, Log Management" },
  { id: "v3", name: "NetGuard Consulting", classification: "Medium", access: "Periodic — penetration testing", swiftComponents: "All in-scope" },
  { id: "v4", name: "DataVault Backup Services", classification: "Medium", access: "Backup agent — read only", swiftComponents: "File Transfer Server" },
];

export const ARCHITECTURE_TYPES = [
  { id: "A1", label: "A1 — With customer connectors", description: "Full SWIFT infrastructure with customer-facing connectors" },
  { id: "A2", label: "A2 — Without customer connectors", description: "Full SWIFT infrastructure, no customer connectors" },
  { id: "A3", label: "A3 — Connector only", description: "Operates connectors only, messaging via service bureau" },
  { id: "A4", label: "A4 — No local SWIFT infrastructure", description: "All SWIFT infrastructure managed by service bureau" },
  { id: "B", label: "Type B — Service bureau", description: "Service bureau providing SWIFT connectivity" },
];
