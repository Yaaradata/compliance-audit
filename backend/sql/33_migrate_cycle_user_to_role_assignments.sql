-- Migrate cycle_user_assignments to cycle_role_assignments.
-- Each row (cycle_id, user_id, role) becomes a user assignment in cycle_role_assignments.
-- Run as: psql -U postgres -d compliance -f backend/sql/33_migrate_cycle_user_to_role_assignments.sql

-- Insert from cycle_user_assignments where not already present in cycle_role_assignments
INSERT INTO core.cycle_role_assignments (cycle_id, role, assignment_type, group_name, user_id)
SELECT cua.cycle_id, cua.role, 'user', NULL, cua.user_id
FROM core.cycle_user_assignments cua
WHERE NOT EXISTS (
  SELECT 1 FROM core.cycle_role_assignments cra
  WHERE cra.cycle_id = cua.cycle_id
    AND cra.role = cua.role
    AND cra.assignment_type = 'user'
    AND cra.user_id = cua.user_id
);
