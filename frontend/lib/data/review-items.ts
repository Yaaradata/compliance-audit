import { ReviewItem } from "../types";

export const REVIEW_ITEMS: ReviewItem[] = [
  { id: 1, title: "Network Architecture Diagram v3.2", domain: "A", controls: ["1.1","1.4","1.5"], submitter: "J. Chen", date: "Jan 28", status: "pending", impact: "HIGH" },
  { id: 2, title: "Firewall Rule Export - Core Zone", domain: "A", controls: ["1.1","1.4"], submitter: "M. Patel", date: "Jan 27", status: "in_review", impact: "CRITICAL" },
  { id: 3, title: "SIEM Configuration Screenshots", domain: "E", controls: ["6.4"], submitter: "S. Kim", date: "Jan 29", status: "pending", impact: "HIGH" },
  { id: 4, title: "Access Control Policy v2.1", domain: "C", controls: ["5.1","4.2","1.2"], submitter: "A. Wong", date: "Jan 26", status: "approved", impact: "CRITICAL" },
  { id: 5, title: "Vendor Risk Assessment - CloudCo", domain: "F", controls: ["2.8"], submitter: "R. Singh", date: "Jan 29", status: "returned", impact: "HIGH" },
  { id: 6, title: "Patch Deployment Records Q4", domain: "D", controls: ["2.2"], submitter: "T. Brown", date: "Jan 25", status: "approved", impact: "MEDIUM" },
  { id: 7, title: "IR Plan - SWIFT Scenarios", domain: "H", controls: ["7.1"], submitter: "L. Garcia", date: "Jan 28", status: "in_review", impact: "HIGH" },
  { id: 8, title: "MFA Config - Alliance Lite2", domain: "B", controls: ["4.2"], submitter: "M. Patel", date: "Jan 27", status: "approved", impact: "CRITICAL" },
];
