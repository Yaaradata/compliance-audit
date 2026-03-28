-- Sample / reference answers from enriched CSV imports (optional).
ALTER TABLE swift_2025.evidence_based_questions
  ADD COLUMN IF NOT EXISTS answers TEXT;
