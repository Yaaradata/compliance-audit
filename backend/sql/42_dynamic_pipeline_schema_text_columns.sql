-- Dynamic schemas only: widen canonical_evidence_items text capacity.
-- Leaves swift_2026 untouched by explicitly excluding it.
DO $$
DECLARE
    s text;
    t text;
BEGIN
    FOR s IN
        SELECT cp.schema_name
        FROM core.compliance_pipelines cp
        WHERE cp.schema_name IS NOT NULL
          AND cp.schema_name <> 'swift_2026'
    LOOP
        EXECUTE format(
            'ALTER TABLE IF EXISTS %I.canonical_evidence_items
               ALTER COLUMN name TYPE VARCHAR(255),
               ALTER COLUMN evidence_type TYPE TEXT,
               ALTER COLUMN description TYPE TEXT,
               ALTER COLUMN reduction_note TYPE TEXT',
            s
        );

        -- Widen cscf_version in every table that has it (dynamic schema only).
        FOR t IN
            SELECT c.relname
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
            WHERE n.nspname = s
              AND c.relkind = 'r'
              AND a.attname = 'cscf_version'
              AND a.attnum > 0
              AND NOT a.attisdropped
              AND NOT EXISTS (
                  SELECT 1 FROM pg_catalog.pg_inherits i WHERE i.inhrelid = c.oid
              )
        LOOP
            EXECUTE format(
                'ALTER TABLE IF EXISTS %I.%I ALTER COLUMN cscf_version TYPE VARCHAR(255)',
                s, t
            );
        END LOOP;
    END LOOP;
END $$;

-- Widen controls.id and FK control_id columns (dynamic schemas only).
DO $$
DECLARE
    s text;
    fk record;
    controls_oid oid;
    tbl text;
BEGIN
    CREATE TEMP TABLE IF NOT EXISTS _tmp_fk_widen (
        conname text,
        src_table text,
        def text
    ) ON COMMIT DROP;

    FOR s IN
        SELECT cp.schema_name
        FROM core.compliance_pipelines cp
        WHERE cp.schema_name IS NOT NULL
          AND cp.schema_name <> 'swift_2026'
    LOOP
        SELECT c.oid INTO controls_oid
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = s
          AND c.relname = 'controls'
          AND c.relkind = 'r';

        IF controls_oid IS NULL THEN
            CONTINUE;
        END IF;

        TRUNCATE _tmp_fk_widen;

        INSERT INTO _tmp_fk_widen (conname, src_table, def)
        SELECT c.conname,
               rel.relname,
               pg_catalog.pg_get_constraintdef(c.oid, true)
        FROM pg_catalog.pg_constraint c
        JOIN pg_catalog.pg_class rel ON rel.oid = c.conrelid
        JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
        WHERE c.contype = 'f'
          AND c.confrelid = controls_oid
          AND n.nspname = s;

        FOR fk IN SELECT * FROM _tmp_fk_widen LOOP
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', s, fk.src_table, fk.conname);
        END LOOP;

        EXECUTE format('ALTER TABLE %I.controls ALTER COLUMN id TYPE VARCHAR(255)', s);

        FOR tbl IN SELECT DISTINCT src_table FROM _tmp_fk_widen LOOP
            EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN control_id TYPE VARCHAR(255)', s, tbl);
        END LOOP;

        FOR fk IN SELECT * FROM _tmp_fk_widen LOOP
            EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I %s', s, fk.src_table, fk.conname, fk.def);
        END LOOP;

        IF EXISTS (
            SELECT 1
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = s
              AND c.relname = 'reviewer_checklist'
              AND c.relkind = 'r'
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.reviewer_checklist ALTER COLUMN control_id TYPE VARCHAR(255)',
                s
            );
        END IF;

        IF EXISTS (
            SELECT 1
            FROM pg_catalog.pg_class c
            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = s
              AND c.relname = 'evidence_based_questions'
              AND c.relkind = 'r'
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.evidence_based_questions '
                'ALTER COLUMN control_id TYPE VARCHAR(255), '
                'ALTER COLUMN cscf_version TYPE VARCHAR(255)',
                s
            );
        END IF;
    END LOOP;
END $$;

