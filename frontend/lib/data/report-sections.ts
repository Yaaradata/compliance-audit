import { ReportSection } from "../types";

export const REPORT_SECTIONS: ReportSection[] = [
  { name: "Executive Summary", status: "draft", ai: true },
  { name: "Scope Statement", status: "complete", ai: false },
  { name: "Methodology", status: "complete", ai: false },
  { name: "Control Assessments", status: "in_progress", ai: true, sub: "24/32 drafted" },
  { name: "Gap Analysis", status: "draft", ai: true },
  { name: "Evidence Index", status: "complete", ai: false },
  { name: "Glossary", status: "complete", ai: false },
];
