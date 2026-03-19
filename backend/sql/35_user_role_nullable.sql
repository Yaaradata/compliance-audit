-- Migration 35: Make core.users.role nullable (default NULL)
--
-- Users created by a compliance officer no longer receive a hardcoded global
-- role.  Their effective role is determined per-cycle via cycle_role_assignments.
-- Administrative roles (compliance_officer, tenant_admin, admin, platform_admin)
-- remain unchanged.

BEGIN;

-- 1. Drop the NOT NULL constraint and server default
ALTER TABLE core.users ALTER COLUMN role DROP NOT NULL;
ALTER TABLE core.users ALTER COLUMN role DROP DEFAULT;

-- 2. Migrate existing it_sme users to NULL so they use per-cycle roles.
--    Only touch users whose global role is 'it_sme' — these are the ones
--    created by compliance officers.  Leave all other roles intact.
UPDATE core.users
   SET role = NULL,
       updated_at = now()
 WHERE role = 'it_sme';

-- 3. Also migrate external_assessor, internal_reviewer_l1, internal_reviewer_l2
--    to NULL — these cycle-scoped roles should come from cycle_role_assignments,
--    not from the global user record.
UPDATE core.users
   SET role = NULL,
       updated_at = now()
 WHERE role IN ('internal_reviewer_l1', 'internal_reviewer_l2', 'external_assessor');

COMMIT;
