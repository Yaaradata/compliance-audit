-- Add 'hold' to review_status and review_decision enums for SWIFT schemas (v2025, v2026).
-- Allows reviewers to place items on hold for later review (hold is per-reviewer).
-- Run as: psql -U postgres -d compliance -f backend/sql/28_add_hold_to_review_enums_swift.sql
-- Idempotent: ADD VALUE IF NOT EXISTS (PostgreSQL 9.1+).

-- swift_2025
ALTER TYPE swift_2025.review_status ADD VALUE IF NOT EXISTS 'hold';
ALTER TYPE swift_2025.review_decision ADD VALUE IF NOT EXISTS 'hold';

-- swift_2026
ALTER TYPE swift_2026.review_status ADD VALUE IF NOT EXISTS 'hold';
ALTER TYPE swift_2026.review_decision ADD VALUE IF NOT EXISTS 'hold';
