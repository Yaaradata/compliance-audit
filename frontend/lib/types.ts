export type UserRole =
  | "admin"
  | "platform_admin"
  | "compliance_officer"
  | "it_sme"
  | "tenant_admin"
  | "internal_reviewer"
  | "external_assessor"
  | "approver";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  details: string;
  bankAdmins: { id: string; email: string; name: string }[];
  createdAt: string;
}

/** Assessment cycle: one per creation; id is used for all evidence and evaluations for that cycle. */
export interface AssessmentCycle {
  id: string;
  label: string;
  cycle_year: number;
  phase: string;
  architecture_type: string | null;
  display_id: string;
  created_at: string;
}

export type ArchitectureId = "A1" | "A2" | "A3" | "A4" | "B";

export interface Architecture {
  id: ArchitectureId;
  name: string;
  subtitle: string;
  description: string;
  mandatoryControls: string[];
  advisoryControls: string[];
  domainIds: string[];
  cscfVersion: string;
  components: string[];
}

export interface Domain {
  id: string;
  name: string;
  color: string;
  accent: string;
  controls: string[];
  items: number;
  completed: number;
  gap: string | null;
}

export interface Control {
  id: string;
  name: string;
  type: "M" | "A";
  objective: number;
  score: number;
  evidenceCount: number;
  status: "approved" | "review" | "partial" | "gap";
}

export interface ControlRef {
  id: string;
  name: string;
  ma: "M" | "A" | "M+A";
}

export interface SufficiencyDimension {
  dim: string;
  label: string;
  why: string;
  controlRef?: string;
}

export interface PerControlSufficiency {
  controlId: string;
  requirement: string;
}

export interface EvidenceInput {
  id: string;
  label: string;
  type: "file" | "checkbox" | "select" | "text" | "textarea" | "date";
  required: boolean;
  accept?: string;
  placeholder?: string;
  options?: string[];
  minLength?: number;
  scope?: "global" | "per-system" | "per-zone" | "per-quarter";
}

/** Per-control criteria from evidence_sufficiency_matrix. */
export interface ControlCriteria {
  item_code: string;
  control_id: string;
  evidence_item_name: string;
  control_name: string;
  ma: "M" | "A" | string;
  evidence_type: string;
  sufficiency_criteria: string | null;
  evaluation_criteria: string | null;
}

export interface EvidenceItem {
  id: string;
  order: number;
  name: string;
  priority: "CRITICAL" | "HIGH" | "HIGH*" | "MEDIUM";
  type: string;
  controls: ControlRef[];
  controlCount: number;
  description: string;
  /** Per-control criteria from evidence_sufficiency_matrix. */
  matrix?: ControlCriteria[];
  inputs: EvidenceInput[];
  sufficiency: SufficiencyDimension[];
  perControlSufficiency?: PerControlSufficiency[];
  reductionNote: string;
  perSystem?: boolean;
  perZone?: boolean;
  perQuarter?: boolean;
  perAccessPoint?: boolean;
  isAdvisory?: boolean;
  conditional?: boolean;
  conditionalNote?: string;
  hasTimeline?: boolean;
  hasDisposalEvents?: boolean;
  hasMultiInputTypes?: boolean;
  requiredColumns?: string[];
  isInventory?: boolean;
  perVendorInputs?: EvidenceInput[];
  multiInputGuidance?: Record<string, MultiInputGuide>;
  eventTypeCoverage?: string[];
}

export interface MultiInputGuide {
  label: string;
  expectations: string[];
}

/** Single criterion from AI evaluation: met (tick) or not met (with description). */
export interface AiCriterionResult {
  id: string;
  label: string;
  met: boolean;
  description?: string | null;
}

/** AI evaluation result for an evidence item (placeholder until AI integration). */
export interface AiEvaluationResult {
  evidence_item_id: string;
  overall_met: boolean;
  /** Per-item results for Sufficiency Definition (what must be present). */
  sufficiency_results?: AiCriterionResult[];
  /** Per-item results for Evaluation Criteria (reviewer checks); description = what's missing when not met. */
  criteria: AiCriterionResult[];
  summary?: string | null;
  /** When evidence fails: what is required to make it correct (from AI). Stored separately, shown in UI. */
  remediation?: string | null;
}

export interface SubGroup {
  name: string;
  color: string;
  items: string[];
  controlRef?: string;
}

export interface DomainConfig {
  id: string;
  name: string;
  color: string;
  gradient: string;
  accentColor: string;
  evidenceItems: EvidenceItem[];
  allControls: string[];
  subGroups: SubGroup[];
  weights: Record<string, number>;
}

export interface ReviewItem {
  id: number;
  title: string;
  domain: string;
  controls: string[];
  submitter: string;
  date: string;
  status: "pending" | "in_review" | "approved" | "returned";
  impact: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface ReportSection {
  name: string;
  status: "draft" | "complete" | "in_progress";
  ai: boolean;
  sub?: string;
}

export interface SwiftSystem {
  name: string;
}

export interface AccessPoint {
  name: string;
  type: string;
}

export interface SwiftZone {
  id: string;
  name: string;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  classification: string;
  access: string;
  swiftComponents: string;
}

export interface ControlMatrixEntry {
  id: string;
  name: string;
  t: "M" | "A";
  items: string[];
}
