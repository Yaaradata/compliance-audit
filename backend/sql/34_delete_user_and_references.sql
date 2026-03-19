-- ============================================================
-- Delete users from core.users and all referencing records.
-- Run as: psql -U postgres -d compliance -f backend/sql/34_delete_user_and_references.sql
--
-- Usage: Add/remove emails in v_user_emails array below.
--        Single user: use array with one email.
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_emails TEXT[] := ARRAY[
    '125150042@sastra.ac.in',   -- Ranjith
    '125150048@sastra.ac.in',   -- sathish
    '125150056@sastra.ac.in',   -- usha
    '125150051@sastra.ac.in'    -- subha
  ];
  v_emails_loop TEXT;
BEGIN
  FOREACH v_emails_loop IN ARRAY v_user_emails
  LOOP
    v_user_email := v_emails_loop;

    -- Resolve user ID by email
    SELECT id INTO v_user_id FROM core.users WHERE email = v_user_email;
    IF v_user_id IS NULL THEN
      RAISE NOTICE 'User not found, skipping: %', v_user_email;
      CONTINUE;
    END IF;

    RAISE NOTICE 'Deleting user % (id: %)', v_user_email, v_user_id;

  -- 1. core.assessment_cycles: created_by (nullable FK)
  UPDATE core.assessment_cycles SET created_by = NULL WHERE created_by = v_user_id;

  -- 2. Notes: author_id is NOT NULL - delete notes authored by this user
  --    (handle both public and schema-specific if they exist)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notes') THEN
    DELETE FROM public.notes WHERE author_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'notes') THEN
    DELETE FROM swift_2025.notes WHERE author_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'notes') THEN
    DELETE FROM swift_2026.notes WHERE author_id = v_user_id;
  END IF;

  -- 3. Notifications: actor_id - set NULL where this user was the actor
  --    (user_id has ON DELETE CASCADE, so rows where user_id = v_user_id will be auto-deleted later)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    UPDATE public.notifications SET actor_id = NULL WHERE actor_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'notifications') THEN
    UPDATE swift_2025.notifications SET actor_id = NULL WHERE actor_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'notifications') THEN
    UPDATE swift_2026.notifications SET actor_id = NULL WHERE actor_id = v_user_id;
  END IF;

  -- 4. Review comments: author_id NOT NULL - delete comments by this user
  --    resolved_by - set NULL where this user resolved
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_comments') THEN
    UPDATE public.review_comments SET resolved_by = NULL WHERE resolved_by = v_user_id;
    DELETE FROM public.review_comments WHERE author_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'review_comments') THEN
    UPDATE swift_2025.review_comments SET resolved_by = NULL WHERE resolved_by = v_user_id;
    DELETE FROM swift_2025.review_comments WHERE author_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'review_comments') THEN
    UPDATE swift_2026.review_comments SET resolved_by = NULL WHERE resolved_by = v_user_id;
    DELETE FROM swift_2026.review_comments WHERE author_id = v_user_id;
  END IF;

  -- 5. Review assignments: reviewer_id NOT NULL - delete assignments where this user is reviewer
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_assignments') THEN
    DELETE FROM public.review_assignments WHERE reviewer_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'review_assignments') THEN
    DELETE FROM swift_2025.review_assignments WHERE reviewer_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'review_assignments') THEN
    DELETE FROM swift_2026.review_assignments WHERE reviewer_id = v_user_id;
  END IF;

  -- 6. Evidence-related: set nullable FKs to NULL
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'evidence_submissions') THEN
    UPDATE public.evidence_submissions SET submitted_by = NULL WHERE submitted_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'evidence_submissions') THEN
    UPDATE swift_2025.evidence_submissions SET submitted_by = NULL WHERE submitted_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'evidence_submissions') THEN
    UPDATE swift_2026.evidence_submissions SET submitted_by = NULL WHERE submitted_by = v_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'evidence_attachments') THEN
    UPDATE public.evidence_attachments SET uploaded_by = NULL WHERE uploaded_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'evidence_attachments') THEN
    UPDATE swift_2025.evidence_attachments SET uploaded_by = NULL WHERE uploaded_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'evidence_attachments') THEN
    UPDATE swift_2026.evidence_attachments SET uploaded_by = NULL WHERE uploaded_by = v_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'evidence_submission_history') THEN
    UPDATE public.evidence_submission_history SET changed_by = NULL WHERE changed_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'evidence_submission_history') THEN
    UPDATE swift_2025.evidence_submission_history SET changed_by = NULL WHERE changed_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'evidence_submission_history') THEN
    UPDATE swift_2026.evidence_submission_history SET changed_by = NULL WHERE changed_by = v_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sufficiency_evaluations') THEN
    UPDATE public.sufficiency_evaluations SET evaluated_by = NULL WHERE evaluated_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'sufficiency_evaluations') THEN
    UPDATE swift_2025.sufficiency_evaluations SET evaluated_by = NULL WHERE evaluated_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'sufficiency_evaluations') THEN
    UPDATE swift_2026.sufficiency_evaluations SET evaluated_by = NULL WHERE evaluated_by = v_user_id;
  END IF;

  -- 7. Approval gates (approved_by only; no generated_by) and assessment_reports (generated_by)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'approval_gates') THEN
    UPDATE public.approval_gates SET approved_by = NULL WHERE approved_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'approval_gates') THEN
    UPDATE swift_2025.approval_gates SET approved_by = NULL WHERE approved_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'approval_gates') THEN
    UPDATE swift_2026.approval_gates SET approved_by = NULL WHERE approved_by = v_user_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assessment_reports') THEN
    UPDATE public.assessment_reports SET generated_by = NULL WHERE generated_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'assessment_reports') THEN
    UPDATE swift_2025.assessment_reports SET generated_by = NULL WHERE generated_by = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'assessment_reports') THEN
    UPDATE swift_2026.assessment_reports SET generated_by = NULL WHERE generated_by = v_user_id;
  END IF;

  -- 8. Audit log: user_id nullable
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2025' AND table_name = 'audit_log') THEN
    UPDATE swift_2025.audit_log SET user_id = NULL WHERE user_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'swift_2026' AND table_name = 'audit_log') THEN
    UPDATE swift_2026.audit_log SET user_id = NULL WHERE user_id = v_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_log') THEN
    UPDATE public.audit_log SET user_id = NULL WHERE user_id = v_user_id;
  END IF;

  -- 9. core.cycle_user_assignments, core.cycle_role_assignments, core.cycle_evidence_assignments
  --    have ON DELETE CASCADE on user_id - they will be auto-deleted when we delete the user.
  --    Same for notifications (user_id CASCADE).

  -- 10. Finally, delete the user (CASCADE will clean cycle_* and notifications)
  DELETE FROM core.users WHERE id = v_user_id;

  RAISE NOTICE 'User % deleted successfully.', v_user_email;

  END LOOP;
END $$;
