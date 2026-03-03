-- Add JSONB columns for L1/L2/L3 checklist (structured JSON).
-- Run before the Python backfill script. After script completes, it will drop TEXT and rename these to l1_check, l2_check, l3_check.
SET search_path TO cscf_2025_new, public;

ALTER TABLE reviewer_checklist
  ADD COLUMN IF NOT EXISTS l1_check_json JSONB,
  ADD COLUMN IF NOT EXISTS l2_check_json JSONB,
  ADD COLUMN IF NOT EXISTS l3_check_json JSONB;

COMMENT ON COLUMN reviewer_checklist.l1_check_json IS 'L1 Submission Validation: task, document, checks[]';
COMMENT ON COLUMN reviewer_checklist.l2_check_json IS 'L2 Technical Review: task, document, control, must_show, pass_criteria, fail_criteria, cross_checks';
COMMENT ON COLUMN reviewer_checklist.l3_check_json IS 'L3 Independent Attestation: task, document, control, independent_verify, cross_check_validation, rating_options';
