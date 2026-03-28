-- Sample / reference answers (optional); keeps ORM parity with swift_2025.
ALTER TABLE swift_2026.evidence_based_questions
  ADD COLUMN IF NOT EXISTS answers TEXT;
