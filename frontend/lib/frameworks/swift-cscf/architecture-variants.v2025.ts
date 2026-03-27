/**
 * Deployment variants per SWIFT CSCF architecture type (A1–B).
 * Source: CSCF v2025.
 */
export interface ArchitectureVariant {
  id: string;
  label: string;
  description: string;
  highlights: string[];
}

export const ARCHITECTURE_VARIANTS_V2025: Record<string, ArchitectureVariant[]> = {
  A1: [
    {
      id: "A1-1",
      label: "Interfaces within user environment",
      description:
        "Both the messaging interface AND the communication interface are hosted within your own secure zone. Full stack ownership with RMA, GUI, SNL, HSM/PKI, and Virtual VPN all on-premises.",
      highlights: [
        "Messaging Interface on-premises",
        "Communication Interface on-premises",
        "RMA module included",
        "Full HSM/PKI control",
        "Virtual VPN managed locally",
      ],
    },
    {
      id: "A1-2",
      label: "Communication interface only within user environment",
      description:
        "Only the communication interface is hosted in your secure zone. The messaging interface components are handled separately, reducing your direct management scope while keeping connectivity in-house.",
      highlights: [
        "Communication Interface on-premises",
        "SNL and HSM/PKI local",
        "Virtual VPN managed locally",
        "GUI only in secure zone",
        "Reduced messaging footprint",
      ],
    },
  ],
  A2: [
    {
      id: "A2-1",
      label: "Via Service Provider (Service Bureau)",
      description:
        "Your messaging interface connects outbound to a third-party service provider who hosts the communication interface (SNL, HSM/PKI) and manages SWIFT network connectivity on your behalf.",
      highlights: [
        "Messaging Interface on-premises",
        "Connectivity outsourced to service bureau",
        "Communication Interface at provider",
        "HSM/PKI managed externally",
        "Reduces your network ops burden",
      ],
    },
    {
      id: "A2-2",
      label: "Via SWIFT Alliance Remote Gateway (ARG)",
      description:
        "Your messaging interface connects through SWIFT's own Alliance Remote Gateway service. SWIFT (ARG) manages the communication interface and network-side components, including Virtual VPN.",
      highlights: [
        "Messaging Interface on-premises",
        "SWIFT ARG handles connectivity",
        "Virtual VPN at SWIFT side",
        "SWIFT-managed communication layer",
        "Simplified network management",
      ],
    },
  ],
  A3: [
    {
      id: "A3-1",
      label: "Towards a SWIFT Connectivity Provider",
      description:
        "Your Swift Connector communicates outbound to a third-party connectivity provider who manages the full SWIFT stack — messaging interface, communication interface, SNL, GUI, HSM/PKI — on your behalf.",
      highlights: [
        "Only Swift Connector on-premises",
        "Provider hosts full SWIFT stack",
        "Messaging + communication at provider",
        "HSM/PKI externally managed",
        "Minimal on-site infrastructure",
      ],
    },
    {
      id: "A3-2",
      label: "Towards a SWIFT Service (Lite2 / Alliance Cloud / API Gateway)",
      description:
        "Your Swift Connector connects directly to a SWIFT-hosted cloud service such as Lite2, Alliance Cloud, or the API Gateway. Connectivity and infrastructure are fully managed by SWIFT.",
      highlights: [
        "Only Swift Connector on-premises",
        "SWIFT-managed cloud service",
        "Lite2 / Alliance Cloud / API Gateway",
        "Virtual VPN handled by SWIFT",
        "Cloud-native approach",
      ],
    },
  ],
  A4: [
    {
      id: "A4-1",
      label: "Middleware / File Transfer Server or Client as Connector",
      description:
        "A middleware or file transfer server/client within your environment acts as the connector to a SWIFT service provider who hosts the full messaging and communication infrastructure.",
      highlights: [
        "Middleware server/client on-premises",
        "Acts as customer connector",
        "Service provider hosts SWIFT stack",
        "Supports file transfer workflows",
        "Provider manages HSM/PKI",
      ],
    },
    {
      id: "A4-2",
      label: "In-house API Endpoint as Customer Connector",
      description:
        "A custom-developed, in-house API endpoint within your Customer Secure Zone serves as the connector. It connects via Virtual VPN directly to the SWIFT network for API-based messaging.",
      highlights: [
        "In-house API endpoint on-premises",
        "Fully custom connector",
        "Virtual VPN for connectivity",
        "Direct SWIFT network access",
        "Maximum customisation flexibility",
      ],
    },
    {
      id: "A4-3",
      label: "WebAccess Service Provider Webserver Front-end",
      description:
        "A web application server provided by a WebAccess service provider is installed in your Customer Secure Zone as the connector. Users interact via browser, with the webserver handling SWIFT connectivity through Virtual VPN.",
      highlights: [
        "Webserver front-end on-premises",
        "Browser-based user interface",
        "Virtual VPN for connectivity",
        "WebAccess service provider model",
        "Minimal local SWIFT software",
      ],
    },
  ],
  B: [
    {
      id: "B-1",
      label: "No user footprint — via Non-SWIFT Service Provider",
      description:
        "Your environment has no SWIFT infrastructure at all. An operator simply connects outbound to a non-SWIFT service provider who handles all SWIFT connectivity and infrastructure on your behalf.",
      highlights: [
        "Zero SWIFT components on-premises",
        "Operator connects to service provider",
        "Provider manages all SWIFT infra",
        "Minimal security scope",
        "Least complex architecture",
      ],
    },
    {
      id: "B-2",
      label: "Interactive user connecting to SWIFT service (Lite2 / Alliance Cloud)",
      description:
        "An end user interactively accesses a SWIFT-hosted service (Lite2 or Alliance Cloud) directly from within your environment. No local SWIFT software — just a secured operator workstation.",
      highlights: [
        "Interactive/GUI access only",
        "Connects to Lite2 / Alliance Cloud",
        "No local SWIFT software",
        "Operator workstation in scope",
        "SWIFT-hosted infrastructure",
      ],
    },
  ],
};
