/**
 * Shared shapes for evidence table / run-history UIs. AWS and GCP list endpoints return the same fields.
 */

export interface CloudEvidenceRow {
  evidence_id: string;
  run_id?: string;
  item_code: string;
  control_id: string;
  evidence_type: string;
  source_system: string;
  collected_at: string | null;
}

export interface CloudCollectorRun {
  run_id: string;
  collector_name: string;
  cloud_provider: string;
  execution_time: string | null;
  in_time?: string | null;
  ended_at: string | null;
  status: string;
  trigger_type: string | null;
  evidence_count: number;
  error_message?: string | null;
}
