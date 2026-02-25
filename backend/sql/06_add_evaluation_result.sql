-- Migration: Store last AI evaluation result on evidence_submissions so tick status persists on revisit
-- Run: psql -U postgres -d compliance -f backend/sql/06_add_evaluation_result.sql
ALTER TABLE evidence_submissions ADD COLUMN IF NOT EXISTS evaluation_result JSONB;
