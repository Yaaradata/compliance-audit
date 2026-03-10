import type { Domain } from "@/lib/types";

export const DOMAINS: Domain[] = [
  { id: "A", name: "Network & Architecture", color: "#0F4C75", accent: "#BBE1FA", controls: ["1.1","1.3","1.4","1.5","2.1","2.4A","2.5A"], items: 6, completed: 5, gap: null },
  { id: "B", name: "System Hardening & Config", color: "#1B5E20", accent: "#C8E6C9", controls: ["1.2","2.3","2.6","2.10","4.1","4.2"], items: 8, completed: 6, gap: "B7 Virtualisation config missing" },
  { id: "C", name: "Access Management", color: "#E65100", accent: "#FFE0B2", controls: ["5.1","5.2","5.3A","5.4"], items: 9, completed: 7, gap: "C5 Quarterly access review overdue" },
  { id: "D", name: "Vulnerability & Patch Mgmt", color: "#B71C1C", accent: "#FFCDD2", controls: ["2.2","2.7","7.3A"], items: 6, completed: 6, gap: null },
  { id: "E", name: "Monitoring & Detection", color: "#4A148C", accent: "#E1BEE7", controls: ["6.1","6.2","6.3","6.4","6.5A"], items: 7, completed: 5, gap: "E3 SIEM config needed" },
  { id: "F", name: "Third-Party & Outsourcing", color: "#1565C0", accent: "#BBDEFB", controls: ["2.8"], items: 4, completed: 3, gap: "F4 Security risk assessments incomplete" },
  { id: "G", name: "Physical Security", color: "#F57F17", accent: "#FFF9C4", controls: ["3.1"], items: 4, completed: 4, gap: null },
  { id: "H", name: "Policies & Governance", color: "#BF360C", accent: "#FFCCBC", controls: ["2.9","2.11A","7.1","7.2","7.4A"], items: 9, completed: 7, gap: "H2 IR exercise records pending" },
];

export const DOMAIN_GRADIENTS: Record<string, string> = {
  A: "linear-gradient(135deg, #0F4C75 0%, #1B6FA0 100%)",
  B: "linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)",
  C: "linear-gradient(135deg, #E65100 0%, #FB8C00 100%)",
  D: "linear-gradient(135deg, #B71C1C 0%, #E53935 100%)",
  E: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)",
  F: "linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)",
  G: "linear-gradient(135deg, #F57F17 0%, #FFB300 100%)",
  H: "linear-gradient(135deg, #BF360C 0%, #E64A19 100%)",
};

/** Returns domains for the given architecture (domain IDs). If no ids, returns all. */
export function getDomainsForArchitecture(domainIds: string[] | undefined): Domain[] {
  if (!domainIds?.length) return DOMAINS;
  const set = new Set(domainIds);
  return DOMAINS.filter((d) => set.has(d.id));
}
