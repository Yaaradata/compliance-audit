--
-- PostgreSQL database dump
--

\restrict fIGu4WhyLZiUjQSnkcoW8tZn8tnWcKZqssze0PkLnOFGu5oRglbncutJlO3nRBI

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: soc2; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA soc2;


ALTER SCHEMA soc2 OWNER TO postgres;

--
-- Name: collection_priority; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.collection_priority AS ENUM (
    'critical',
    'high',
    'medium'
);


ALTER TYPE soc2.collection_priority OWNER TO postgres;

--
-- Name: control_type; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.control_type AS ENUM (
    'mandatory',
    'advisory'
);


ALTER TYPE soc2.control_type OWNER TO postgres;

--
-- Name: evaluation_source; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.evaluation_source AS ENUM (
    'system',
    'ai',
    'human'
);


ALTER TYPE soc2.evaluation_source OWNER TO postgres;

--
-- Name: evidence_status; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.evidence_status AS ENUM (
    'draft',
    'submitted',
    'in_review',
    'returned',
    'approved',
    'escalated'
);


ALTER TYPE soc2.evidence_status OWNER TO postgres;

--
-- Name: gate_status; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.gate_status AS ENUM (
    'pending',
    'approved',
    'blocked'
);


ALTER TYPE soc2.gate_status OWNER TO postgres;

--
-- Name: gate_type; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.gate_type AS ENUM (
    'evidence_complete',
    'internal_review',
    'assessment_complete',
    'final_attestation'
);


ALTER TYPE soc2.gate_type OWNER TO postgres;

--
-- Name: report_type; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.report_type AS ENUM (
    'draft',
    'final'
);


ALTER TYPE soc2.report_type OWNER TO postgres;

--
-- Name: review_decision; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.review_decision AS ENUM (
    'approve',
    'return',
    'escalate',
    'hold'
);


ALTER TYPE soc2.review_decision OWNER TO postgres;

--
-- Name: review_level; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.review_level AS ENUM (
    'l1_completeness',
    'l2_quality',
    'l3_assessment'
);


ALTER TYPE soc2.review_level OWNER TO postgres;

--
-- Name: review_status; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.review_status AS ENUM (
    'assigned',
    'in_progress',
    'approved',
    'returned',
    'escalated',
    'hold'
);


ALTER TYPE soc2.review_status OWNER TO postgres;

--
-- Name: sufficiency_status; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.sufficiency_status AS ENUM (
    'not_started',
    'insufficient',
    'partial',
    'sufficient'
);


ALTER TYPE soc2.sufficiency_status OWNER TO postgres;

--
-- Name: upload_status; Type: TYPE; Schema: soc2; Owner: postgres
--

CREATE TYPE soc2.upload_status AS ENUM (
    'uploading',
    'uploaded',
    'processing',
    'processed',
    'failed'
);


ALTER TYPE soc2.upload_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_gates; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.approval_gates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_id uuid NOT NULL,
    gate soc2.gate_type NOT NULL,
    status soc2.gate_status DEFAULT 'pending'::soc2.gate_status NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    mfa_verified boolean DEFAULT false NOT NULL,
    notes text,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.approval_gates OWNER TO postgres;

--
-- Name: architecture_details; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.architecture_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    architecture_code character varying(30) NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(20) NOT NULL,
    what_it_defines jsonb,
    detailed_description jsonb NOT NULL,
    controls_available jsonb,
    mandatory_controls jsonb,
    advisory_controls jsonb,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT architecture_details_category_check CHECK (((category)::text = ANY ((ARRAY['overview'::character varying, 'scope'::character varying, 'deployment'::character varying])::text[])))
);


ALTER TABLE soc2.architecture_details OWNER TO postgres;

--
-- Name: TABLE architecture_details; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON TABLE soc2.architecture_details IS 'Single table for SOC 2 architecture page. Long-text fields are JSONB for structured frontend consumption.';


--
-- Name: COLUMN architecture_details.what_it_defines; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.architecture_details.what_it_defines IS 'JSONB: { "summary": string }';


--
-- Name: COLUMN architecture_details.detailed_description; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.architecture_details.detailed_description IS 'JSONB: { "summary": string, "points": string[] }';


--
-- Name: COLUMN architecture_details.controls_available; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.architecture_details.controls_available IS 'JSONB: { "series": string[], "labels": { [series]: string } }';


--
-- Name: COLUMN architecture_details.mandatory_controls; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.architecture_details.mandatory_controls IS 'JSONB: { "summary": string, "items": string[] }';


--
-- Name: COLUMN architecture_details.advisory_controls; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.architecture_details.advisory_controls IS 'JSONB: { "summary": string, "items": string[] }';


--
-- Name: assessment_reports; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.assessment_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_id uuid NOT NULL,
    report_kind soc2.report_type DEFAULT 'draft'::soc2.report_type NOT NULL,
    sections jsonb DEFAULT '[]'::jsonb,
    snapshot_data jsonb DEFAULT '{}'::jsonb,
    generated_by uuid,
    finalized_at timestamp with time zone,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.assessment_reports OWNER TO postgres;

--
-- Name: audit_log; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.audit_log (
    id bigint NOT NULL,
    tenant_id uuid,
    user_id uuid,
    action character varying(100) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE soc2.audit_log OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: soc2; Owner: postgres
--

CREATE SEQUENCE soc2.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE soc2.audit_log_id_seq OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: soc2; Owner: postgres
--

ALTER SEQUENCE soc2.audit_log_id_seq OWNED BY soc2.audit_log.id;


--
-- Name: canonical_evidence_items; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.canonical_evidence_items (
    id character varying(10) NOT NULL,
    domain_id character(1) NOT NULL,
    sort_order integer NOT NULL,
    name character varying(255) NOT NULL,
    priority soc2.collection_priority DEFAULT 'medium'::soc2.collection_priority NOT NULL,
    evidence_type character varying(100) NOT NULL,
    description text NOT NULL,
    control_count integer DEFAULT 0 NOT NULL,
    input_schema jsonb DEFAULT '[]'::jsonb,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL,
    reduction_note text,
    collection_model character varying(20) DEFAULT 'standard'::character varying NOT NULL,
    reuse_tier character varying(30) DEFAULT 'control_specific'::character varying NOT NULL,
    sufficiency_dimensions jsonb DEFAULT '[]'::jsonb NOT NULL,
    per_system boolean DEFAULT false NOT NULL,
    per_zone boolean DEFAULT false NOT NULL,
    per_quarter boolean DEFAULT false NOT NULL,
    per_access_point boolean DEFAULT false NOT NULL,
    is_advisory boolean DEFAULT false NOT NULL,
    is_conditional boolean DEFAULT false NOT NULL
);


ALTER TABLE soc2.canonical_evidence_items OWNER TO postgres;

--
-- Name: control_applicability; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.control_applicability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_id uuid NOT NULL,
    control_id character varying(20) NOT NULL,
    applicability soc2.control_type NOT NULL,
    is_overridden boolean DEFAULT false NOT NULL,
    override_reason text,
    score numeric(5,2) DEFAULT 0,
    status soc2.sufficiency_status DEFAULT 'not_started'::soc2.sufficiency_status NOT NULL,
    evidence_count integer DEFAULT 0 NOT NULL,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    scoping_decision character varying(20) DEFAULT 'applicable'::character varying NOT NULL,
    scoping_justification_text text,
    scoping_justification_file_path character varying(500),
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.control_applicability OWNER TO postgres;

--
-- Name: controls; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.controls (
    id character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    control_type soc2.control_type NOT NULL,
    description text,
    scope_applicability text[] DEFAULT '{}'::text[] NOT NULL,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE soc2.controls OWNER TO postgres;

--
-- Name: evidence_attachments; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.evidence_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    file_name character varying(500) NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size_bytes bigint DEFAULT 0 NOT NULL,
    storage_path character varying(1000) NOT NULL,
    sha256_hash character varying(64),
    upload_status soc2.upload_status DEFAULT 'uploaded'::soc2.upload_status NOT NULL,
    uploaded_by uuid,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2022'::character varying NOT NULL
);


ALTER TABLE soc2.evidence_attachments OWNER TO postgres;

--
-- Name: evidence_based_questions; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.evidence_based_questions (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT audit_questions_id_not_null NOT NULL,
    framework character varying(20) CONSTRAINT audit_questions_framework_not_null NOT NULL,
    framework_version character varying(10) CONSTRAINT audit_questions_framework_version_not_null NOT NULL,
    evidence_item_id character varying(10) CONSTRAINT audit_questions_evidence_item_id_not_null NOT NULL,
    control_id character varying(20),
    question_key character varying(100) CONSTRAINT audit_questions_question_key_not_null NOT NULL,
    question_text text CONSTRAINT audit_questions_question_text_not_null NOT NULL,
    question_type character varying(20) CONSTRAINT audit_questions_question_type_not_null NOT NULL,
    answer_type character varying(20) CONSTRAINT audit_questions_answer_type_not_null NOT NULL,
    options jsonb DEFAULT '[]'::jsonb CONSTRAINT audit_questions_options_not_null NOT NULL,
    required boolean DEFAULT true CONSTRAINT audit_questions_required_not_null NOT NULL,
    placeholder text,
    sort_order integer DEFAULT 0 CONSTRAINT audit_questions_sort_order_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT audit_questions_created_at_not_null NOT NULL,
    depends_on_question_key character varying(100),
    show_when_value character varying(20),
    CONSTRAINT audit_questions_answer_type_check CHECK (((answer_type)::text = ANY ((ARRAY['yes_no'::character varying, 'text'::character varying, 'mcq'::character varying, 'date'::character varying, 'numeric'::character varying, 'file_upload'::character varying])::text[]))),
    CONSTRAINT audit_questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['evaluation'::character varying, 'sufficiency'::character varying])::text[])))
);


ALTER TABLE soc2.evidence_based_questions OWNER TO postgres;

--
-- Name: TABLE evidence_based_questions; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON TABLE soc2.evidence_based_questions IS 'Evidence-based questions per evidence item and control; question_type (evaluation/sufficiency), answer_type (yes_no/text/mcq/etc.), options for mcq. Conditional display via depends_on_question_key and show_when_value.';


--
-- Name: COLUMN evidence_based_questions.depends_on_question_key; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.evidence_based_questions.depends_on_question_key IS 'Question key (e.g. a1_cc9_evaluation_0) this question depends on; only used when show_when_value is set.';


--
-- Name: COLUMN evidence_based_questions.show_when_value; Type: COMMENT; Schema: soc2; Owner: postgres
--

COMMENT ON COLUMN soc2.evidence_based_questions.show_when_value IS 'Show this question only when the depended question answer equals this value (e.g. yes, no).';


--
-- Name: evidence_domains; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.evidence_domains (
    id character(1) NOT NULL,
    name character varying(255) NOT NULL,
    color character varying(10),
    accent_color character varying(10),
    item_count integer DEFAULT 0 NOT NULL,
    sort_order integer NOT NULL,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.evidence_domains OWNER TO postgres;

--
-- Name: evidence_submission_history; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.evidence_submission_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    version integer NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    change_type character varying(50) NOT NULL,
    snapshot_before jsonb,
    snapshot_after jsonb,
    justification text
);


ALTER TABLE soc2.evidence_submission_history OWNER TO postgres;

--
-- Name: evidence_submissions; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.evidence_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    evidence_item_id character varying(10) NOT NULL,
    submitted_by uuid,
    status soc2.evidence_status DEFAULT 'draft'::soc2.evidence_status NOT NULL,
    scope_key character varying(255),
    form_data jsonb DEFAULT '{}'::jsonb,
    completion_pct numeric(5,2) DEFAULT 0,
    version integer DEFAULT 1 NOT NULL,
    ai_summary text,
    ai_confidence numeric(5,2),
    submitted_at timestamp with time zone,
    evaluation_edits jsonb DEFAULT '{}'::jsonb NOT NULL,
    evaluation_remediation text,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    evaluation_result jsonb,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.evidence_submissions OWNER TO postgres;

--
-- Name: evidence_sufficiency_matrix; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.evidence_sufficiency_matrix (
    item_code character varying(10) NOT NULL,
    control_id character varying(20) NOT NULL,
    evidence_item_name character varying(255) NOT NULL,
    control_name character varying(255) NOT NULL,
    mandatory_advisory character varying(1) NOT NULL,
    evidence_type character varying(100) NOT NULL,
    sufficiency_criteria text,
    evaluation_criteria text,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL,
    ma character varying(1) DEFAULT 'M'::character varying NOT NULL
);


ALTER TABLE soc2.evidence_sufficiency_matrix OWNER TO postgres;

--
-- Name: item_control_mappings; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.item_control_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evidence_item_id character varying(10) NOT NULL,
    control_id character varying(20) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    weight numeric(5,2) DEFAULT 1.0,
    sufficiency_requirement text,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.item_control_mappings OWNER TO postgres;

--
-- Name: notes; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid NOT NULL,
    parent_id uuid,
    author_id uuid NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE soc2.notes OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    actor_id uuid,
    title character varying(255),
    body text,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE soc2.notifications OWNER TO postgres;

--
-- Name: review_assignments; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.review_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    level soc2.review_level NOT NULL,
    status soc2.review_status DEFAULT 'assigned'::soc2.review_status NOT NULL,
    decision soc2.review_decision,
    sla_due_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    checklist_results jsonb DEFAULT '{}'::jsonb NOT NULL,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2022'::character varying NOT NULL
);


ALTER TABLE soc2.review_assignments OWNER TO postgres;

--
-- Name: review_comments; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.review_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    author_id uuid NOT NULL,
    parent_id uuid,
    body text NOT NULL,
    mentions uuid[] DEFAULT '{}'::uuid[],
    is_resolved boolean DEFAULT false NOT NULL,
    resolved_by uuid,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2022'::character varying NOT NULL
);


ALTER TABLE soc2.review_comments OWNER TO postgres;

--
-- Name: reviewer_checklist; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.reviewer_checklist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_code character varying(10) NOT NULL,
    evidence_item character varying(500) NOT NULL,
    control_id character varying(20) NOT NULL,
    control_name character varying(500) NOT NULL,
    mandatory_advisory character varying(10) DEFAULT 'M'::character varying NOT NULL,
    l1_check jsonb,
    l2_check jsonb,
    l3_check jsonb,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2022'::character varying NOT NULL
);


ALTER TABLE soc2.reviewer_checklist OWNER TO postgres;

--
-- Name: sufficiency_evaluations; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.sufficiency_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    dimension_code character varying(50) NOT NULL,
    score numeric(5,2) DEFAULT 0 NOT NULL,
    rationale text,
    source soc2.evaluation_source DEFAULT 'system'::soc2.evaluation_source NOT NULL,
    evaluated_by uuid,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    evaluated_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.sufficiency_evaluations OWNER TO postgres;

--
-- Name: sufficiency_scores; Type: TABLE; Schema: soc2; Owner: postgres
--

CREATE TABLE soc2.sufficiency_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cycle_id uuid NOT NULL,
    control_id character varying(20) NOT NULL,
    overall_score numeric(5,2) DEFAULT 0,
    status soc2.sufficiency_status DEFAULT 'not_started'::soc2.sufficiency_status NOT NULL,
    last_evaluated_at timestamp with time zone,
    soc_version character varying(20) DEFAULT '2017'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cscf_version character varying(10) DEFAULT '2025v'::character varying NOT NULL
);


ALTER TABLE soc2.sufficiency_scores OWNER TO postgres;

--
-- Name: audit_log id; Type: DEFAULT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.audit_log ALTER COLUMN id SET DEFAULT nextval('soc2.audit_log_id_seq'::regclass);


--
-- Data for Name: approval_gates; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.approval_gates (id, cycle_id, gate, status, approved_by, approved_at, mfa_verified, notes, soc_version, created_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: architecture_details; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.architecture_details (id, architecture_code, name, category, what_it_defines, detailed_description, controls_available, mandatory_controls, advisory_controls, soc_version, sort_order, created_at, updated_at) FROM stdin;
df02c638-a9a2-49c9-a9ea-8b82f939507f	SECURITY_PI	Security + Processing Integrity	scope	{"summary": "Security (CC1–CC9) plus Processing Integrity (PI) are in scope."}	{"points": ["Use when you process transactions or data that must be accurate and complete.", "PI1.x criteria cover completeness, accuracy, timeliness, and authorization of processing.", "Common for fintech, healthcare data pipelines, and ETL-heavy systems."], "summary": "Processing Integrity addresses whether system processing is complete, valid, accurate, timely, and authorized. Relevant for payment processing, data transformation, or any system where correctness is critical."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation", "PI1": "Processing Integrity Criteria"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "PI1"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "PI1.1 — Quality Information for Processing", "PI1.2 — Input Controls", "PI1.3 — Processing Controls", "PI1.4 — Output Controls", "PI1.5 — Storage Controls"], "summary": "Security CC1–CC9 mandatory. Processing Integrity: all PI1.x mandatory when PI is in scope."}	{"items": [], "summary": "Per AICPA TSC."}	2022	12	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
4694ed79-88cb-4b88-9db1-76a2179b5cdc	OVERVIEW	SOC 2 Framework Overview	overview	{"summary": "SOC 2 is a report on controls at a service organization relevant to security, availability, processing integrity, confidentiality, or privacy."}	{"points": ["Security is the only mandatory Trust Services Category.", "Availability, Processing Integrity, Confidentiality, and Privacy are optional — selected based on customer commitments.", "The architecture choice (scope + deployment) drives the audit scope and evidence requirements."], "summary": "SOC 2 examinations are based on the AICPA Trust Services Criteria (TSC). Security is the only mandatory category; the other four are optional and chosen based on customer commitments and system description."}	{"note": "Optional TSC (Availability, Processing Integrity, Confidentiality, Privacy) each add their own criteria when in scope.", "labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"]}	{"items": ["CC1 — Control Environment", "CC2 — Communication and Information", "CC3 — Risk Assessment", "CC4 — Monitoring Activities", "CC5 — Control Activities", "CC6 — Logical and Physical Access Controls", "CC7 — System Operations", "CC8 — Change Management", "CC9 — Risk Mitigation"], "summary": "All nine Common Criteria (CC1–CC9) and their points of focus are mandatory when Security is in scope."}	{"items": [], "summary": "None for Security. Optional TSC may include advisory points of focus per AICPA guidance."}	2022	1	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
db73b91f-00da-4457-9baa-989718710573	STRUCTURE	How SOC 2 Is Organized	overview	{"summary": "The framework has five Trust Service Criteria; Security contains nine Common Criteria (CC1–CC9)."}	{"points": ["Five Trust Service Categories: Security, Availability, Processing Integrity, Confidentiality, Privacy.", "CC1–CC9 are the mandatory Common Criteria under Security.", "Each criterion has control objectives and points of focus evaluated by auditors.", "Scope selection (which TSC) and deployment type (where the system runs) determine applicable controls."], "summary": "The framework has five Trust Service Criteria categories. Under Security, nine Common Criteria (CC1–CC9) form the mandatory foundation. Users choose a scope and a deployment type; that selection determines which controls and evidence items apply."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "summary": "CC1–CC9 and all associated points of focus when Security is in scope."}	{"items": [], "summary": "N/A"}	2022	2	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
04d885a0-821b-4b9d-bd44-58adb770d77c	CHOOSING_ARCHITECTURE	Choosing Your Architecture	overview	{"summary": "Select one scope (which TSC) and one deployment (where the system runs)."}	{"points": ["Scope options: Security Only; Security + Availability; Security + Processing Integrity; Security + Confidentiality; Security + Privacy; All Five TSC.", "Deployment options: Cloud-Only; Hybrid (Cloud + On-Premises); On-Premises; SaaS / Multi-Tenant.", "Security controls (CC1–CC9) apply to all scope selections.", "Optional TSC add their own criteria when selected."], "summary": "Your scope and deployment choices determine which controls and evidence are in scope for the assessment."}	{"note": "Deployment affects how physical and logical controls are evidenced (e.g. cloud vs on-prem).", "labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "summary": "Security scope: all CC1–CC9 mandatory. Other TSC: mandatory controls apply when that TSC is in scope."}	{"items": [], "summary": "N/A"}	2022	3	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
98403807-5c33-49e5-a166-91519b7a7041	SECURITY_ONLY	Security Only	scope	{"summary": "Only the Security category is in scope. All nine Common Criteria (CC1–CC9) apply."}	{"points": ["No additional Trust Service Criteria (Availability, Processing Integrity, Confidentiality, Privacy) are evaluated.", "Use when your commitment to customers is limited to security.", "Reduces audit scope and evidence compared to adding other TSC."], "summary": "The minimum scope for any SOC 2 examination. Most common when customers need assurance over security controls only."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "summary": "All CC1–CC9 and their points of focus. No optional TSC controls."}	{"items": [], "summary": "None."}	2022	10	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
7f9acc55-8ad7-452e-9ad1-d9edbfaa5584	SECURITY_AVAILABILITY	Security + Availability	scope	{"summary": "Security (CC1–CC9) plus Availability criteria are in scope."}	{"points": ["Use when you commit to uptime/SLAs or when customers rely on your system availability.", "Auditors evaluate both security controls and availability-related controls.", "Evidence includes capacity management, redundancy, and incident response affecting availability."], "summary": "Availability addresses whether the system is available for operation and use as committed or agreed. Typical for SaaS, hosting, or any service where uptime is part of the value proposition."}	{"labels": {"A1": "Availability Criteria", "CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "A1"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "A1.1 — Capacity Management", "A1.2 — Recovery Infrastructure", "A1.3 — Recovery Plan Testing"], "summary": "Security CC1–CC9 mandatory. Availability: all A1.x criteria mandatory when Availability is in scope."}	{"items": [], "summary": "Per AICPA TSC; any advisory points of focus for Availability."}	2022	11	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
a5e694df-0781-4db1-9b4a-075695ddddac	SECURITY_CONFIDENTIALITY	Security + Confidentiality	scope	{"summary": "Security (CC1–CC9) plus Confidentiality are in scope."}	{"points": ["Use when confidentiality of data is an explicit commitment or regulatory requirement.", "C1.x criteria cover classification, handling, and protection of confidential information.", "Relevant for legal, financial, IP-heavy, or B2B SaaS with NDA-protected data."], "summary": "Confidentiality addresses protection of information designated as confidential. Common when handling customer confidential data, trade secrets, or regulated data where disclosure would cause harm."}	{"labels": {"C1": "Confidentiality Criteria", "CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "C1"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "C1.1 — Identifies and Maintains Confidential Information", "C1.2 — Disposes of Confidential Information"], "summary": "Security CC1–CC9 mandatory. Confidentiality: all C1.x mandatory when Confidentiality is in scope."}	{"items": [], "summary": "Per AICPA TSC."}	2022	13	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
4111e19e-f9b3-4a7e-8c2d-226cc2841318	SECURITY_PRIVACY	Security + Privacy	scope	{"summary": "Security (CC1–CC9) plus Privacy are in scope."}	{"points": ["Use when you process PII and have privacy commitments or regulations (e.g. GDPR, CCPA, HIPAA).", "P1.x–P8.x criteria cover notice, choice, consent, collection, use, retention, disclosure, quality, and disposal.", "Largest additional criteria set — adds 20 criteria on top of CC1–CC9."], "summary": "Privacy addresses collection, use, retention, disclosure, and disposal of personal information. Required when the system processes personal information and privacy is part of the service commitment."}	{"labels": {"P1": "Notice and Communication", "P2": "Choice and Consent", "P3": "Collection", "P4": "Use, Retention and Disposal", "P5": "Access", "P6": "Disclosure and Notification", "P7": "Quality", "P8": "Monitoring and Enforcement", "CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "P1.1 — Notice to Data Subjects", "P2.1 — Choice and Consent", "P3.1 — Collection", "P3.2 — Explicit Consent", "P4.1 — Use Limitation", "P4.2 — Retention", "P4.3 — Disposal", "P5.1 — Access", "P5.2 — Correction", "P6.1 — Disclosure with Consent", "P6.2 — Authorised Disclosure Records", "P6.3 — Unauthorised Disclosure Records", "P6.4 — Third-Party Privacy Commitments", "P6.5 — Third-Party Reporting Commitments", "P6.6 — Breach Notification", "P6.7 — Accounting of PI Held", "P7.1 — Data Quality", "P8.1 — Monitoring and Enforcement"], "summary": "Security CC1–CC9 mandatory. Privacy: applicable P1.x–P8.x criteria mandatory when Privacy is in scope."}	{"items": [], "summary": "Per AICPA TSC."}	2022	14	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
c300233c-fdc7-4b94-ad9e-df73f3ca1cd3	ALL_FIVE_TSC	All Five Trust Service Criteria	scope	{"summary": "Security, Availability, Processing Integrity, Confidentiality, and Privacy are all in scope."}	{"points": ["Use when customers or regulators expect full TSC coverage (e.g. enterprise, healthcare, financial services).", "Covers 67 criteria total: 33 Common Criteria + 3 Availability + 5 PI + 2 Confidentiality + 20 Privacy + 4 additional.", "Highest evidence burden — plan for significant uplift in documentation and controls."], "summary": "The broadest SOC 2 scope. Requires the most evidence and control coverage. Appropriate for comprehensive assurance across all five trust service categories."}	{"labels": {"A1": "Availability", "C1": "Confidentiality", "P1": "Notice and Communication", "P2": "Choice and Consent", "P3": "Collection", "P4": "Use, Retention and Disposal", "P5": "Access", "P6": "Disclosure and Notification", "P7": "Quality", "P8": "Monitoring and Enforcement", "CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation", "PI1": "Processing Integrity"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9", "A1", "PI1", "C1", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"], "total_criteria": 67}	{"items": ["CC1–CC9 (33 Common Criteria)", "A1.1, A1.2, A1.3 (Availability)", "PI1.1–PI1.5 (Processing Integrity)", "C1.1, C1.2 (Confidentiality)", "P1.1–P8.1 (Privacy — 20 criteria)"], "summary": "All mandatory controls under Security, Availability, Processing Integrity, Confidentiality, and Privacy per AICPA TSC."}	{"items": ["Advisory points of focus under each of the five Trust Service Categories"], "summary": "Advisory points of focus as defined in AICPA TSC for each category."}	2022	15	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
2db35e4b-d4f6-462e-81fe-f1ce116b90a5	CLOUD_ONLY	Cloud-Only	deployment	{"summary": "All system components and data reside in public or private cloud."}	{"points": ["Physical security and facility controls evidenced via cloud provider SOC 2 reports or certifications.", "Logical access, change management, and monitoring focus on cloud-native tools and IAM.", "Physical access (CC6.4) addressed via cloud provider attestations — no on-prem evidence required.", "Shared responsibility model must be documented to delineate provider vs. organization controls."], "summary": "All infrastructure in public or private cloud (e.g. AWS, Azure, GCP). No on-premises data centers in scope. Physical security is largely inherited from the cloud provider."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "evidence_source": "cloud_provider_reports", "provider_examples": ["AWS", "Azure", "GCP"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6 — logical access; CC6.4 physical via cloud provider report", "CC7", "CC8", "CC9"], "summary": "CC1–CC9 apply; physical access (CC6.4) satisfied via provider attestations. All other CC controls mandatory with cloud-based evidence."}	{"items": [], "summary": "None."}	2022	20	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
5c525de5-9e51-44b0-8294-b31e5acaa694	HYBRID	Hybrid (Cloud + On-Premises)	deployment	{"summary": "The system spans both cloud and on-premises infrastructure."}	{"points": ["Cloud segments: evidence via provider SOC 2 reports and cloud-native control outputs.", "On-premises segments: direct evidence for physical access, environmental controls, and facility procedures.", "Control applicability may differ by component location — document the split clearly.", "Shared responsibility model and asset inventory must clearly identify where each component resides."], "summary": "Some components or data are in the cloud; others are in corporate data centers or offices. Evidence must cover both segments."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "segments": ["cloud", "on_premises"], "evidence_source": "mixed"}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "summary": "All CC1–CC9 mandatory; evidence required for both cloud and on-premises in-scope components."}	{"items": [], "summary": "None."}	2022	21	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
6db80dd8-08a5-4b28-9acd-7874d39870a5	ON_PREMISES	On-Premises	deployment	{"summary": "System components and data are primarily or entirely in organization-owned or leased facilities."}	{"points": ["Full control over physical security, environmental controls, and facility access.", "Physical access (CC6.4), environmental protections, and secure disposal (CC6.5) require detailed organizational evidence.", "No reliance on cloud provider attestations — all evidence is organization-owned.", "Higher evidence burden for physical controls compared to cloud-only deployments."], "summary": "Data center, server rooms, or offices entirely under organizational control. All physical and logical controls are directly evidenced by the organization."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "evidence_source": "organization_owned", "physical_controls_in_scope": true}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6 — full physical access evidence required (CC6.4, CC6.5)", "CC7", "CC8", "CC9"], "summary": "All CC1–CC9 mandatory with full organization-owned evidence for physical and logical controls."}	{"items": [], "summary": "None."}	2022	22	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
57b7a5fd-4f6a-4591-af32-f288ec16e753	SAAS_MULTI_TENANT	SaaS / Multi-Tenant	deployment	{"summary": "Software-as-a-service offering with multiple tenants on shared or logically separated infrastructure."}	{"points": ["Tenant isolation, data separation, and RBAC per tenant are key control areas.", "Often combined with Security + Availability or All Five TSC scopes.", "Evidence must demonstrate that one tenant cannot access or affect another tenant's data.", "Availability SLA documentation and capacity management are typically required."], "summary": "You operate a SaaS platform with multiple customers (tenants). Scope includes logical separation, tenant isolation, and access controls that prevent one tenant from affecting another."}	{"labels": {"CC1": "Control Environment", "CC2": "Communication and Information", "CC3": "Risk Assessment", "CC4": "Monitoring Activities", "CC5": "Control Activities", "CC6": "Logical and Physical Access Controls", "CC7": "System Operations", "CC8": "Change Management", "CC9": "Risk Mitigation"}, "series": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6", "CC7", "CC8", "CC9"], "evidence_source": "mixed", "key_focus_areas": ["tenant_isolation", "data_separation", "rbac_per_tenant", "availability_sla"]}	{"items": ["CC1", "CC2", "CC3", "CC4", "CC5", "CC6 — tenant-level logical access and isolation evidence required", "CC7", "CC8", "CC9", "A1.1, A1.2, A1.3 — mandatory if Availability TSC is in scope"], "summary": "All CC1–CC9 mandatory; tenant isolation and access controls are critical. Availability mandatory if that TSC is in scope."}	{"items": [], "summary": "None."}	2022	23	2026-03-10 10:51:14.560334+00	2026-03-10 10:58:38.246981+00
\.


--
-- Data for Name: assessment_reports; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.assessment_reports (id, cycle_id, report_kind, sections, snapshot_data, generated_by, finalized_at, soc_version, created_at, updated_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.audit_log (id, tenant_id, user_id, action, resource_type, resource_id, metadata, ip_address, soc_version, created_at) FROM stdin;
\.


--
-- Data for Name: canonical_evidence_items; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.canonical_evidence_items (id, domain_id, sort_order, name, priority, evidence_type, description, control_count, input_schema, soc_version, created_at, cscf_version, reduction_note, collection_model, reuse_tier, sufficiency_dimensions, per_system, per_zone, per_quarter, per_access_point, is_advisory, is_conditional) FROM stdin;
A1	A	1	Information security policy (comprehensive)	critical	Policy document; narrative PDF; standards document	Master information security policy covering tone at top, board oversight, management structures, control activities, and risk mitigation. Must be board-approved and annually reviewed.	5	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
A2	A	2	Risk assessment methodology & risk register	critical	Risk assessment document; risk register; scenario analysis	Documented risk assessment methodology covering objectives specification, risk identification, fraud risk, and change risk. Includes live risk register with residual risk ratings.	4	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
A3	A	3	Board & management oversight evidence	high	Board minutes; committee reports; management review records	Evidence of board independence, oversight of internal controls, and management communication of deficiencies. Board minutes or committee reports showing security/availability/privacy oversight.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
A4	A	4	Vendor & third-party risk management program	high	Vendor register; risk tier classification; contract excerpts; assessment records	Comprehensive third-party risk management covering vendor inventory, tiering, assessments, SLAs, and ongoing monitoring. Includes confidentiality/privacy commitments from vendors.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
A5	A	5	Business continuity & disaster recovery plan	high	BCP/DR plan document; test records; alternate processing procedures	Documented business continuity and disaster recovery plan covering risk mitigation for disruptions, environmental protections, backup processes, and recovery testing.	3	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B1	B	6	Logical access control policy & procedures	critical	Policy document; procedures; standards	Comprehensive logical access security policy covering access control software, user registration/deregistration, and role-based access controls aligned with least privilege and separation of duties.	3	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B2	B	7	User access list & privileged account inventory	high	Account listing; AD export; system account reports	Complete inventory of all user accounts (standard and privileged) across all in-scope systems. Includes account type, system, role assignment, last review date.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B3	B	8	Access review records (periodic)	high	Review reports; sign-off records; exception logs	Evidence of periodic access rights reviews covering appropriateness of access roles and rules, including modification and revocation actions taken.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B4	B	9	MFA configuration evidence	critical	Configuration exports; architecture diagram; MFA policy	Multi-factor authentication configuration evidence covering internal access, remote access, and external boundary protection. Documents MFA methods, coverage, and enforcement points.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B5	B	10	Credential & encryption key management	high	Key inventory; rotation records; vault/HSM config; encryption standards	Evidence of cryptographic key management covering generation, storage, use, and destruction. Includes key rotation schedule, vault/HSM configuration, and algorithm standards.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B6	B	11	Physical access control evidence	high	Access control system reports; badge logs; policy	Physical access controls for all facilities housing in-scope systems. Covers data centres, office spaces, backup media storage, and other sensitive locations.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B7	B	12	Media disposal & data sanitisation evidence	medium	Disposal certificates; sanitisation records; procedures	Evidence of secure disposal of physical assets with procedures that diminish ability to recover data or software before discontinuing logical and physical protections.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B8	B	13	Boundary protection systems configuration	high	Firewall configuration; IDS/IPS setup; network topology	Configuration and evidence of boundary protection systems (firewalls, IDS/IPS, DMZ) and data transmission controls (DLP, encryption in transit, removable media controls).	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
B9	B	14	Malware protection & unauthorised software controls	critical	Anti-malware config; update logs; software allowlist; change control evidence	Evidence of controls preventing or detecting unauthorised or malicious software, including anti-malware configuration, software installation restrictions, and change-detection mechanisms.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
C1	C	15	System configuration standards & hardening	high	Configuration exports; CIS benchmark results; hardening checklist	Documented configuration standards and hardening evidence showing defined baselines, monitoring for non-compliance, and detection of new vulnerabilities.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
C2	C	16	Anomaly detection & monitoring configuration	critical	SIEM config; log source list; alert rules; retention policy	Security monitoring configuration covering detection policies, anomaly detection rules, log sources, and filtering/analysis processes to identify security events.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
C3	C	17	Security incident evaluation procedures	high	Incident management procedures; evaluation workflow; escalation matrix	Procedures for evaluating detected security events to determine if they constitute incidents, including impact assessment on confidential information and personal information.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
C4	C	18	Security incident response & recovery procedures	high	Incident response plan; response records; recovery procedures; lessons learned	Documented incident response program covering role assignments, containment, remediation, communication protocols, recovery procedures, and incident recovery plan testing.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
C5	C	19	Change management procedures & records	critical	Change management policy; change records; approval evidence; test records	Evidence of controlled change management for infrastructure, data, software, and procedures. Covers authorisation, design, testing, approval, and deployment including emergency change processes.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
D1	D	20	Vulnerability scanning & patch management policy	high	Policy document; procedures; scanning schedule	Documented vulnerability scanning policy and patch management procedures covering scanning frequency, severity-based remediation timelines, and in-scope system coverage.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
D2	D	21	Current vulnerability scan results	critical	Scan tool output; vulnerability report with severity ratings	Recent vulnerability scan results from a recognised scanning tool covering all in-scope systems, showing current vulnerability status and severity ratings.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
D3	D	22	Vulnerability remediation tracking log	high	Remediation tracker; risk register; action plan records	Tracking of vulnerability remediation from scans and penetration tests, including severity-based prioritisation, risk acceptance records, and closure evidence.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
D4	D	23	Penetration test reports (annual)	medium	Penetration test report; executive summary; remediation plan	Application, system, and network penetration testing conducted by an independent party. Scope covers all in-scope systems relevant to trust services categories.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
E1	E	24	Monitoring activities & internal audit program	high	Internal audit plan; audit reports; monitoring schedules	Evidence of ongoing and separate monitoring activities, including internal audit program, assessments, and management of identified deficiencies. Covers both process and outcome.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
E2	E	25	Control environment & ethics evidence	high	Code of conduct; ethics training records; HR policy; disciplinary records	Evidence of commitment to integrity and ethical values, staff competency, and accountability. Includes code of conduct, training, and performance management processes.	3	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
E3	E	26	Information & communication procedures	medium	Communication plan; internal reporting records; external communication evidence	Evidence of information quality management and communication procedures, covering internal control information, personnel communication, and external party communication including incident reporting.	3	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
F1	F	27	Capacity management & availability monitoring	high	Capacity reports; monitoring dashboards; utilisation data	Current processing capacity measurements, utilisation baselines, capacity forecasts, and change triggers for when forecasted usage exceeds tolerance.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
F2	F	28	Backup & recovery infrastructure evidence	critical	Backup configuration; offsite storage evidence; recovery infrastructure docs; test records	Evidence of environmental protections, data backup processes, offsite storage, alternate processing infrastructure, and recovery plan testing.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
G1	G	29	Confidential information identification & retention	high	Data classification policy; confidential data inventory; retention schedule	Procedures to identify, designate, retain, and dispose of confidential information. Covers both retention during designated period and secure disposal at end of retention.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
G2	G	30	Processing integrity controls (input/processing/output)	high	Input validation rules; processing specs; output distribution procedures; error logs	Evidence of processing integrity controls covering information quality, input controls, processing specifications, output completeness/accuracy, and storage integrity.	5	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
H1	H	31	Privacy notice & consent management	critical	Privacy notice; consent records; data subject communication	Privacy notice communicated to data subjects including purposes, choices, consent records, and procedures for obtaining explicit consent for sensitive information collection.	3	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
H2	H	32	Personal information collection & use controls	high	Data inventory; collection procedures; data minimisation evidence; use records	Evidence that personal information is collected only for stated purposes using fair and lawful means, used only for intended purposes, and retained only as long as necessary.	3	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
H3	H	33	Personal information disposal procedures	high	Deletion procedures; deletion request logs; destruction certificates	Evidence of secure disposal of personal information including procedures for identifying, capturing deletion requests, and destroying PI that has been identified for disposal.	1	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
H4	H	34	Data subject access & correction procedures	high	Access request procedure; correction procedure; request log; response records	Procedures and evidence for granting authenticated data subjects access to their personal information and correcting/amending information upon request.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
H5	H	35	Third-party PI disclosure & breach notification	high	Disclosure records; third-party PI agreements; breach notification procedure; breach log	Evidence of controlled disclosure of PI to third parties with consent, records of disclosures, breach detection and notification procedures, and third-party commitment to report unauthorised disclosures.	7	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
H6	H	36	Privacy quality & monitoring program	high	Privacy monitoring reports; complaint log; compliance review; training records	Evidence of accurate and complete PI maintenance, monitoring of privacy compliance, and processes for receiving/resolving data subject inquiries, complaints, and disputes.	2	[]	2022	2026-03-10 10:51:19.787337+00	2025v	\N	standard	control_specific	[]	f	f	f	f	f	f
\.


--
-- Data for Name: control_applicability; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.control_applicability (id, cycle_id, control_id, applicability, is_overridden, override_reason, score, status, evidence_count, soc_version, updated_at, scoping_decision, scoping_justification_text, scoping_justification_file_path, cscf_version) FROM stdin;
\.


--
-- Data for Name: controls; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.controls (id, name, control_type, description, scope_applicability, soc_version, created_at) FROM stdin;
CC1	Control Environment	mandatory	Standards, processes, and structures for internal control.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC2	Communication and Information	mandatory	Information for internal control; external communication.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC3	Risk Assessment	mandatory	Objectives with sufficient clarity; risks to objectives.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC4	Monitoring Activities	mandatory	Ongoing and separate evaluations of internal control.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC5	Control Activities	mandatory	Control activities that mitigate risks to objectives.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC6	Logical and Physical Access Controls	mandatory	Logical and physical access controls.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC7	System Operations	mandatory	Detect, monitor, and respond to security events and incidents.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC8	Change Management	mandatory	Authorize, design, develop, implement changes.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
CC9	Risk Mitigation	mandatory	Risk mitigation for business disruptions; vendor risk.	{SECURITY_ONLY,SECURITY_AVAILABILITY,SECURITY_PI,SECURITY_CONFIDENTIALITY,SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
A1	Availability (Capacity, Recovery, Testing)	advisory	Processing capacity; recovery infrastructure; recovery testing.	{SECURITY_AVAILABILITY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
PI1	Processing Integrity	advisory	Quality information; input, processing, output, storage controls.	{SECURITY_PI,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
C1	Confidentiality	advisory	Identify, maintain, dispose of confidential information.	{SECURITY_CONFIDENTIALITY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P1	Privacy Notice and Communication	advisory	Notice to data subjects.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P2	Choice and Consent	advisory	Communicates choices and obtains consent.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P3	Collection	advisory	Collection of personal information.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P4	Use, Retention and Disposal	advisory	Use, retention, disposal of PI.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P5	Access	advisory	Data subject access and correction.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P6	Disclosure to Third Parties	advisory	Disclosure and breach notification.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P7	Quality	advisory	Quality of personal information.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
P8	Monitoring and Enforcement	advisory	Privacy monitoring and enforcement.	{SECURITY_PRIVACY,ALL_FIVE_TSC}	2022	2026-03-10 10:51:19.787337+00
\.


--
-- Data for Name: evidence_attachments; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.evidence_attachments (id, submission_id, file_name, file_type, file_size_bytes, storage_path, sha256_hash, upload_status, uploaded_by, soc_version, uploaded_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: evidence_based_questions; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.evidence_based_questions (id, framework, framework_version, evidence_item_id, control_id, question_key, question_text, question_type, answer_type, options, required, placeholder, sort_order, created_at, depends_on_question_key, show_when_value) FROM stdin;
b8287ccf-e35d-45cb-8afe-d180374e1458	soc2	2022	A1	CC9	a1_cc9_evaluation_0	Does the policy explicitly address both risk mitigation and business disruption?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
a188aea2-554d-4ace-8969-2ec1e004f827	soc2	2022	A1	CC9	a1_cc9_sufficiency_0	State the approver's name and the approval date as shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
79e4ec73-a1a1-4b6b-a60c-24570418d7a2	soc2	2022	A1	CC9	a1_cc9_sufficiency_1	Does the evidence explicitly confirm the scope covers all applicable trust services categories?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
2fc9670d-179d-462a-9541-f6e0bf39ff1a	soc2	2022	A1	CC9	a1_cc9_sufficiency_2	State the name and role of the policy owner as identified in the evidence.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
9faa0af1-4fa4-46bc-8efe-d5e598100164	soc2	2022	A1	CC9	a1_cc9_sufficiency_3	Does the evidence define a review cycle for this policy?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
ae9f8ac8-b56c-4f9a-8ecf-8776b68e6878	soc2	2022	A1	CC9	a1_cc9_sufficiency_4	Describe the control environment commitments stated in the evidence.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
42cddf96-1439-4dec-8d26-cc05b0041d5f	soc2	2022	A1	CC1	a1_cc1_evaluation_0	Who approved this policy? Provide the approver's full name, role, and date of approval.	evaluation	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
22cfd365-4921-42bd-a350-2f1a6e711694	soc2	2022	A1	CC1	a1_cc1_evaluation_1	When was this policy last reviewed or re-dated?	evaluation	mcq	[{"key": "within_the_last_3_months", "label": "Within the last 3 months"}, {"key": "3-6_months_ago", "label": "3–6 months ago"}, {"key": "6-12_months_ago", "label": "6–12 months ago"}, {"key": "more_than_12_months_ago", "label": "More than 12 months ago"}]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
5c01c7bb-0e96-496e-8342-5ca6d1ea0ae7	soc2	2022	A1	CC1	a1_cc1_evaluation_2	Does the policy scope explicitly cover all CC1 through CC5 common criteria?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
419a7416-7051-4630-b4ee-50d0e1705dd6	soc2	2022	A1	CC1	a1_cc1_evaluation_3	Describe how risk mitigation is addressed in this policy — reference the relevant section or clause.	evaluation	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
beed8ea0-bd45-4af5-a6ca-872c7936af23	soc2	2022	A1	CC1	a1_cc1_evaluation_4	Describe the risk appetite statement in this policy — what thresholds or tolerance levels are defined.	evaluation	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
c35a1173-9de6-4527-ba5a-3771e802667e	soc2	2022	A1	CC1	a1_cc1_sufficiency_0	State the approver's name and the approval date as shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
18589030-d18f-4b27-929b-f03353d2612e	soc2	2022	A1	CC1	a1_cc1_sufficiency_1	Does the evidence explicitly confirm the scope covers all applicable trust services categories?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c1dfceb1-23f8-4713-9698-7130b272fce9	soc2	2022	A1	CC1	a1_cc1_sufficiency_2	State the name and role of the policy owner as identified in the evidence.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
5d67c1b2-5fea-4979-9469-e95702063a82	soc2	2022	A1	CC1	a1_cc1_sufficiency_3	Does the evidence define a review cycle for this policy?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
a2a5958d-c29b-497e-9ec3-0c09099c1410	soc2	2022	A1	CC1	a1_cc1_sufficiency_4	Describe the control environment commitments stated in the evidence.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
62386885-1806-449f-b227-ecc7b9e459a4	soc2	2022	A1	CC5	a1_cc5_evaluation_0	Are control activities deployed through formally documented policies?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6b2cf876-7b26-47b4-b30f-07526e8a88f7	soc2	2022	A1	CC5	a1_cc5_evaluation_1	Describe how tone-at-the-top and organisational structure are documented — who is accountable and how it is communicated.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
9b0ce652-265a-4b9a-af90-bf7bbc0c8961	soc2	2022	A1	CC5	a1_cc5_sufficiency_0	State the approver's name and the approval date as shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
bcd8bb68-93bf-47db-a158-4e964387fb81	soc2	2022	A1	CC5	a1_cc5_sufficiency_1	Does the evidence explicitly confirm the scope covers all applicable trust services categories?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
0d0fb772-2b91-4600-b736-349c9b4e179b	soc2	2022	A1	CC5	a1_cc5_sufficiency_2	State the name and role of the policy owner as identified in the evidence.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
744c7536-04ca-47fa-910e-5a84fc28852e	soc2	2022	A1	CC5	a1_cc5_sufficiency_3	Does the evidence define a review cycle for this policy?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
7a2b413b-b396-451f-82a1-d8d7e19308f8	soc2	2022	A1	CC5	a1_cc5_sufficiency_4	Describe the control environment commitments stated in the evidence.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
13d7aac8-5209-42f1-8643-32136d9d9dbd	soc2	2022	A2	CC3	a2_cc3_evaluation_0	Describe the risk assessment methodology in use — who performs it, how often, and what approach is followed.	evaluation	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
815ad391-35c2-4828-a2db-76c22c47b4df	soc2	2022	A2	CC3	a2_cc3_evaluation_1	How frequently is the risk register updated?	evaluation	mcq	[{"key": "continuously___real-time", "label": "Continuously / real-time"}, {"key": "monthly", "label": "Monthly"}, {"key": "quarterly", "label": "Quarterly"}, {"key": "annually", "label": "Annually"}, {"key": "ad_hoc_only", "label": "Ad hoc only"}]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
6dc3952d-1923-464b-8a6b-4310f079c616	soc2	2022	A2	CC3	a2_cc3_evaluation_2	Does the risk assessment explicitly consider fraud risk scenarios?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
00e36091-f3ca-41fc-b7c5-dae0c7f324ea	soc2	2022	A2	CC3	a2_cc3_evaluation_3	Do significant change events formally trigger a risk re-assessment?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
5fda4fd3-7ee3-480a-bfda-73670d57950b	soc2	2022	A2	CC3	a2_cc3_evaluation_4	Are residual risks documented and confirmed within the approved tolerance level?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
78098541-8f33-4930-9a77-8b2a58810078	soc2	2022	A2	CC3	a2_cc3_sufficiency_0	Describe the risk assessment methodology as presented in the evidence — approach used and key steps.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
06290da3-4fbb-4ae7-8b17-b42fcd6d9e49	soc2	2022	A2	CC3	a2_cc3_sufficiency_1	Does the risk register show both inherent and residual ratings for each risk?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
9dd62339-74e1-4238-95d2-a2c208f34303	soc2	2022	A2	CC3	a2_cc3_sufficiency_2	Does the evidence include fraud risk scenarios in the assessment?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
aa29dd97-b25a-4989-bcb1-fc7551c3da0b	soc2	2022	A2	CC3	a2_cc3_sufficiency_3	Describe how the evidence defines the process for triggering a re-assessment following significant changes.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
6bd941c7-1fdd-4632-b9ea-32529c3c0ee8	soc2	2022	A3	CC1	a3_cc1_evaluation_0	How often does the Board of Directors meet with documented minutes?	evaluation	mcq	[{"key": "monthly", "label": "Monthly"}, {"key": "quarterly", "label": "Quarterly"}, {"key": "semi-annually", "label": "Semi-annually"}, {"key": "annually", "label": "Annually"}, {"key": "ad_hoc_only", "label": "Ad hoc only"}]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
23659373-ee7d-4012-a811-afd9ad066e36	soc2	2022	A3	CC1	a3_cc1_evaluation_1	Is information security a standing agenda item at Board meetings?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
7e670af6-50be-444f-9183-874755ce6b45	soc2	2022	A3	CC1	a3_cc1_evaluation_2	Describe how control deficiencies are communicated to the Board — who prepares the report, format used, and frequency.	evaluation	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
ba50cde6-e51d-443c-b3e0-cd217a1099b0	soc2	2022	A3	CC1	a3_cc1_evaluation_3	Describe how Board independence from management is demonstrated — what attestations or governance mechanisms are in place.	evaluation	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
fd9bc9de-1dcc-45bd-bae7-6bad22f00268	soc2	2022	A3	CC1	a3_cc1_sufficiency_0	State the Board meeting frequency as shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
81c255d8-0d26-40c1-923a-32d3cf519dbe	soc2	2022	A3	CC1	a3_cc1_sufficiency_1	Describe the security or privacy agenda items shown in the evidence — include date and subject discussed.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
4450ff3e-2674-4fc7-ad75-afdc0e559154	soc2	2022	A3	CC1	a3_cc1_sufficiency_2	Describe the deficiency communication shown in the evidence — who prepared it, who received it, and what deficiencies were reported.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
a5a63a4e-c7e9-41d6-bc9b-2709388a56b2	soc2	2022	A3	CC1	a3_cc1_sufficiency_3	Does the evidence include an independence attestation for Board members?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
402303ce-2f3b-43dc-bfe1-662b3c2fdc68	soc2	2022	A3	CC4	a3_cc4_evaluation_0	Are identified control deficiencies formally evaluated and communicated to both management and the Board?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
ca3c1307-7950-4935-ae86-5b7f6edaba03	soc2	2022	A3	CC4	a3_cc4_sufficiency_0	State the Board meeting frequency as shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6b1544be-a658-4996-bbb1-8a97fa606d8b	soc2	2022	A3	CC4	a3_cc4_sufficiency_1	Describe the security or privacy agenda items shown in the evidence — include date and subject discussed.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
9bc5657a-4500-4833-bbf0-512454b8e89d	soc2	2022	A3	CC4	a3_cc4_sufficiency_2	Describe the deficiency communication shown in the evidence — who prepared it, who received it, and what deficiencies were reported.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b8345e62-9d37-453d-ae18-2e6b0c6c2893	soc2	2022	A3	CC4	a3_cc4_sufficiency_3	Does the evidence include an independence attestation for Board members?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
df29f333-d083-400f-87af-c3972c3bf004	soc2	2022	A4	CC9	a4_cc9_evaluation_0	Are all critical vendors included in a formal inventory?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
ef02ac07-8fe0-4992-9a89-cef2837d7e42	soc2	2022	A4	CC9	a4_cc9_evaluation_1	Describe the risk tiering approach for vendors — how tiers are defined and what criteria determine each vendor's tier.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
6c84fc04-d85c-4637-b4da-06b7efc2daef	soc2	2022	A4	CC9	a4_cc9_evaluation_2	Are signed SLAs in place for all critical vendors?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
d10d9e15-804c-4f73-9cf0-623b697468fa	soc2	2022	A4	CC9	a4_cc9_evaluation_3	When were vendor risk assessments last completed?	evaluation	mcq	[{"key": "within_the_last_6_months", "label": "Within the last 6 months"}, {"key": "6-12_months_ago", "label": "6–12 months ago"}, {"key": "more_than_12_months_ago", "label": "More than 12 months ago"}, {"key": "not_yet_performed", "label": "Not yet performed"}]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
28f5ae6e-b720-41bf-802d-0044287eca1a	soc2	2022	A4	CC9	a4_cc9_evaluation_4	Have privacy commitments been obtained from all vendors with access to personal information?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
06a2809c-08a7-4bae-859b-284ed965545f	soc2	2022	A4	CC9	a4_cc9_sufficiency_0	Does the vendor inventory include risk tier or criticality classification for each vendor?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
37e3d3e8-98d4-4fca-a29f-00f84ca93287	soc2	2022	A4	CC9	a4_cc9_sufficiency_1	Does the evidence include signed SLAs and NDAs for all critical vendors?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
9357fd9a-d577-4694-8aa3-472ea549d43c	soc2	2022	A4	CC9	a4_cc9_sufficiency_2	Describe the vendor risk assessments shown — which vendors are assessed and when assessments were last completed.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
a791a19f-3163-4aeb-b579-c1f27bf00a55	soc2	2022	A4	CC9	a4_cc9_sufficiency_3	Does the evidence include privacy or confidentiality commitments from all applicable vendors?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
4fd4158b-2f50-4dc1-a76e-d885685b6011	soc2	2022	A5	A1	a5_a1_evaluation_0	Is the business continuity and disaster recovery plan formally documented?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
9b1d1277-bf03-4b90-a6fe-51b185f7f200	soc2	2022	A5	A1	a5_a1_evaluation_1	State the defined RTOs and RPOs — describe how they were determined and which systems they apply to.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
3c02e8cf-a6a8-4cfa-aab3-f08bd6ff4481	soc2	2022	A5	A1	a5_a1_evaluation_2	Has an alternate processing infrastructure been identified?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
0d3b0a6d-f4ba-4327-ae76-9c7410f0346c	soc2	2022	A5	A1	a5_a1_evaluation_3	Has the BCP/DR plan been tested within the last 12 months?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
f546d58c-461e-4fbb-afce-8b4ccdbb0d67	soc2	2022	A5	A1	a5_a1_evaluation_4	Describe what lessons were identified from the last recovery test and how they have been incorporated into the plan.	evaluation	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
458da777-cc85-4d9c-b62a-73fbcbaaaa1e	soc2	2022	A5	A1	a5_a1_sufficiency_0	Does the evidence contain formally documented BCP or DR procedures?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
25c7c520-c38f-4f72-8df9-2331eb2db22a	soc2	2022	A5	A1	a5_a1_sufficiency_1	State the RTOs and RPOs shown in the evidence and identify which systems they apply to.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
45fc70f7-4a62-4115-8d5c-a7fe23e55d91	soc2	2022	A5	A1	a5_a1_sufficiency_2	Does the evidence identify an alternate processing infrastructure or site?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
e8a50608-2304-4d49-b936-d90deaf040d8	soc2	2022	A5	A1	a5_a1_sufficiency_3	Describe the test results shown — test date, scope tested, outcome, and any issues identified.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
84ec82e2-a247-4113-9da6-73105c9c98a8	soc2	2022	A5	CC9	a5_cc9_evaluation_0	Does the risk mitigation plan explicitly cover business disruption scenarios?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
67f76a55-193d-4e34-91ed-6d51b9e35dc9	soc2	2022	A5	CC9	a5_cc9_evaluation_1	Describe the environmental protections in place and summarise the most recent recovery test — include date and result.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
0ab6794b-06b5-49f8-a3da-183f123870a6	soc2	2022	A5	CC9	a5_cc9_sufficiency_0	Does the evidence contain formally documented BCP or DR procedures?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
dd39a185-bb97-41e8-b309-f87174502a91	soc2	2022	A5	CC9	a5_cc9_sufficiency_1	State the RTOs and RPOs shown in the evidence and identify which systems they apply to.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
f8c74a26-c623-4cd9-8c4c-2ea0bfc23ee6	soc2	2022	A5	CC9	a5_cc9_sufficiency_2	Does the evidence identify an alternate processing infrastructure or site?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
a56f2873-4f74-4188-a1bc-3d3c45a3984e	soc2	2022	A5	CC9	a5_cc9_sufficiency_3	Describe the test results shown — test date, scope tested, outcome, and any issues identified.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
1977a50d-1bb2-440b-906b-af437a42da29	soc2	2022	B1	CC6	b1_cc6_evaluation_0	Does the access control policy cover all CC6.1 through CC6.3 requirements?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
2955b0e8-34fb-427f-8ab9-80a99cfe4a0d	soc2	2022	B1	CC6	b1_cc6_evaluation_1	Are roles and responsibilities for access control formally defined?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
76fa8425-c7ca-4f54-ba25-5b310d6dd3a7	soc2	2022	B1	CC6	b1_cc6_evaluation_2	Describe how the principle of least privilege is applied — how access is scoped to job function and how this is reviewed.	evaluation	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
e361a925-de31-4d8c-808c-43cd30747c94	soc2	2022	B1	CC6	b1_cc6_evaluation_3	Is separation of duties formally documented in the access control policy?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
01c8ac53-9919-44aa-9df7-8d3bb6c6c5d1	soc2	2022	B1	CC6	b1_cc6_sufficiency_0	Does the evidence define identification and authentication requirements?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
3a7f5386-95fc-451c-aadf-210d3af596bb	soc2	2022	B1	CC6	b1_cc6_sufficiency_1	Does the evidence describe the user registration and deregistration process?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
4c733872-af11-4490-b84c-d90698c72cc4	soc2	2022	B1	CC6	b1_cc6_sufficiency_2	Describe how role-based access control is defined in the evidence — include how roles are structured.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b6cf315a-854a-4ae2-b3f6-8826572c153e	soc2	2022	B1	CC6	b1_cc6_sufficiency_3	Does the evidence explicitly address the principle of least privilege?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
dd13b7e6-28f2-4c78-94f4-0e755f2c63fb	soc2	2022	B1	CC6	b1_cc6_sufficiency_4	Does the evidence describe how separation of duties is enforced?	sufficiency	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
ed988124-2919-41da-84a3-ee330e2dc4a9	soc2	2022	B2	CC6	b2_cc6_evaluation_0	Does the access listing cover all in-scope systems?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
0fa53946-b840-4376-ad8f-05d4e0be5de2	soc2	2022	B2	CC6	b2_cc6_evaluation_1	Are privileged accounts flagged and reviewed separately from standard user accounts?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
857d5625-d6ee-4b31-95f7-3d0690043dc0	soc2	2022	B2	CC6	b2_cc6_evaluation_2	Are all service accounts included in the access inventory?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b3cf3023-c455-4824-aad6-64d3057a4a03	soc2	2022	B2	CC6	b2_cc6_evaluation_3	When was the access listing last reviewed?	evaluation	mcq	[{"key": "within_the_last_3_months", "label": "Within the last 3 months"}, {"key": "3-6_months_ago", "label": "3–6 months ago"}, {"key": "6-12_months_ago", "label": "6–12 months ago"}, {"key": "more_than_12_months_ago", "label": "More than 12 months ago"}]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
738cec80-5625-4c01-9846-342a9c5d3e96	soc2	2022	B2	CC6	b2_cc6_sufficiency_0	Does the access listing include a username for every account?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
e784cc19-2cea-4e97-89f1-86e747eb131b	soc2	2022	B2	CC6	b2_cc6_sufficiency_1	Does the access listing identify the system or application for each account?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
9270e490-aedc-4f76-a3bf-7b8e8326b808	soc2	2022	B2	CC6	b2_cc6_sufficiency_2	Does the access listing classify each account by type — user, admin, or service?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
3e96ddbb-196e-4814-a26b-12fd4c7b7e57	soc2	2022	B2	CC6	b2_cc6_sufficiency_3	Does the access listing show a role or permission assignment for every account?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
1fcbffbf-45ad-490b-b9dd-036c684b3f2c	soc2	2022	B2	CC6	b2_cc6_sufficiency_4	State the last access review date shown in the listing. Note any accounts where this is missing.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
44b063a0-43c0-4dc9-89ee-910c05779f7c	soc2	2022	B3	CC6	b3_cc6_evaluation_0	Is the access review cadence formally documented?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
c345f90b-f1a5-48e6-9f54-72d73a3fb27d	soc2	2022	B3	CC6	b3_cc6_evaluation_1	Does the access review scope include all in-scope systems?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c94d9926-396c-4f18-8b89-44b253234af5	soc2	2022	B3	CC6	b3_cc6_evaluation_2	Describe the actions taken following the most recent access review — what was revoked, modified, or retained and how this was tracked.	evaluation	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
eec415ef-74df-450e-99a8-258e4a3dd96e	soc2	2022	B3	CC6	b3_cc6_evaluation_3	Have all exceptions identified during the most recent access review been formally resolved?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
6dd2c7f5-85bd-405f-85fc-062ff444ff7a	soc2	2022	B3	CC6	b3_cc6_sufficiency_0	State the date the access review was performed and the name or role of who performed it.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
89861e5a-a8f0-4357-a8dd-12ba29678925	soc2	2022	B3	CC6	b3_cc6_sufficiency_1	List the systems included in the access review scope as shown in the evidence.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
aa5286b0-fd37-42ea-9fbf-18d3ddd45c2e	soc2	2022	B3	CC6	b3_cc6_sufficiency_2	Describe the outcomes shown — how many accounts were revoked, modified, or retained.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
ca74ee84-8a30-422d-8e8c-e5b17dde10fd	soc2	2022	B3	CC6	b3_cc6_sufficiency_3	Does the evidence describe a formal exception handling process for vulnerability management?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
9a35daf7-b5a0-4882-9644-1b217656f957	soc2	2022	B4	CC6	b4_cc6_evaluation_0	Is MFA enforced at all required access points?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
4cdea16a-4925-44cc-be25-29d1e715f14b	soc2	2022	B4	CC6	b4_cc6_evaluation_1	Is the second authentication factor physically or logically separate from the first?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
e8d2440a-06ee-48eb-9003-250ce9ba60d5	soc2	2022	B4	CC6	b4_cc6_evaluation_2	Does MFA coverage include all remote access methods?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b858364a-9f97-44b6-8b39-d8668462fdfa	soc2	2022	B4	CC6	b4_cc6_evaluation_3	Are all external system boundaries protected by MFA or equivalent controls?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
8fa92dca-8502-4f14-8a3c-60fc12c93383	soc2	2022	B4	CC6	b4_cc6_sufficiency_0	Describe the MFA coverage shown — which access points are protected and any that are not.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
1d23fea8-2901-447e-9252-7215abaf9fc9	soc2	2022	B4	CC6	b4_cc6_sufficiency_1	Describe the second authentication factor type shown and how it is managed.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
d73d5e02-e6c2-40dc-b02d-4a007fbca254	soc2	2022	B4	CC6	b4_cc6_sufficiency_2	Does the evidence confirm MFA is enforced for all remote access methods?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
0caff3de-96cd-461d-a892-583f24771c1d	soc2	2022	B4	CC6	b4_cc6_sufficiency_3	Does the evidence confirm MFA or equivalent controls at all external system boundaries?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
850d54d1-a437-4c8e-8be7-c62acb82b515	soc2	2022	B5	CC6	b5_cc6_evaluation_0	Are all cryptographic keys included in a formal inventory?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
f596357f-93b1-4011-bb5d-a38b920e0ffb	soc2	2022	B5	CC6	b5_cc6_evaluation_1	Has the defined key rotation schedule been met in the current period?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
5578ad80-fe44-4846-af54-e3855d539152	soc2	2022	B5	CC6	b5_cc6_evaluation_2	How are cryptographic keys stored?	evaluation	mcq	[{"key": "hardware_security_module_(hsm)", "label": "Hardware Security Module (HSM)"}, {"key": "dedicated_secrets_vault_(e.g._hashicorp_vault)", "label": "Dedicated secrets vault (e.g. HashiCorp Vault)"}, {"key": "encrypted_key_store", "label": "Encrypted key store"}, {"key": "unmanaged___no_dedicated_storage", "label": "Unmanaged / no dedicated storage"}]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
67a13884-93db-4e90-a9b0-981862c80cd7	soc2	2022	B5	CC6	b5_cc6_evaluation_3	Describe the cryptographic algorithms and key lengths in use — confirm they meet current security standards.	evaluation	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
e57bb358-ce91-4c0c-b203-45f95f83f189	soc2	2022	B5	CC6	b5_cc6_sufficiency_0	Does the key inventory include algorithm and key length for every key?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6ac49f27-c3e5-463c-9e8c-033a21a011b8	soc2	2022	B5	CC6	b5_cc6_sufficiency_1	State the key rotation schedule shown in the evidence — frequency defined for each key type.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c503e313-d18d-42a6-bd3a-b5d8ddba7b87	soc2	2022	B5	CC6	b5_cc6_sufficiency_2	Describe how key storage is documented — what mechanism is used and who has access.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
a87d39e6-2cf3-44bd-a48e-28cf03cce4ab	soc2	2022	B5	CC6	b5_cc6_sufficiency_3	Does the evidence define a procedure for destroying or revoking cryptographic keys?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
582d41cf-07ba-4831-a270-1a6dc50f19ab	soc2	2022	B6	CC6	b6_cc6_evaluation_0	Do physical access controls cover all in-scope facility types?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
e79d1336-1315-4333-894a-dded79f9dc1b	soc2	2022	B6	CC6	b6_cc6_evaluation_1	Are all physical access modifications formally documented?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
b098c94b-e477-4825-b9ab-f85e351021da	soc2	2022	B6	CC6	b6_cc6_evaluation_2	How frequently are physical access reviews conducted?	evaluation	mcq	[{"key": "monthly", "label": "Monthly"}, {"key": "quarterly", "label": "Quarterly"}, {"key": "semi-annually", "label": "Semi-annually"}, {"key": "annually", "label": "Annually"}, {"key": "ad_hoc_only", "label": "Ad hoc only"}]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
4326c78d-2f8b-4e1b-b07b-bf82efc17254	soc2	2022	B6	CC6	b6_cc6_evaluation_3	Is there a formal process to recover access devices when a person leaves or changes role?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
35d5a70f-cbae-4f44-bcf6-d9157832a29f	soc2	2022	B6	CC6	b6_cc6_sufficiency_0	Does the evidence confirm physical access is restricted to authorised personnel for all covered facilities?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b1ebae32-cd7b-4edc-af73-61222f6f5fcd	soc2	2022	B6	CC6	b6_cc6_sufficiency_1	Does the evidence describe a formal process for creating, modifying, and removing physical access?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c8470945-bb4e-4f7e-877f-eea88084df95	soc2	2022	B6	CC6	b6_cc6_sufficiency_2	State the physical access review date shown in the evidence and describe the scope covered.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
fc11f96f-0fb3-439e-b7ff-fcecb68427f7	soc2	2022	B7	CC6	b7_cc6_evaluation_0	Is the data disposal and media sanitisation process formally documented?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
ca286b8b-4052-4ad2-9114-7f19e4b5a699	soc2	2022	B7	CC6	b7_cc6_evaluation_1	What disposal method is used for high-sensitivity assets?	evaluation	mcq	[{"key": "certified_third-party_destruction", "label": "Certified third-party destruction"}, {"key": "physical_destruction_on-site", "label": "Physical destruction on-site"}, {"key": "cryptographic_erasure", "label": "Cryptographic erasure"}, {"key": "standard_deletion_only", "label": "Standard deletion only"}, {"key": "no_formal_method_defined", "label": "No formal method defined"}]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
47f302ed-28bc-4a78-bcd8-775999c347d7	soc2	2022	B7	CC6	b7_cc6_evaluation_2	Are physical assets tracked through the full disposal lifecycle?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
23ce4bac-6ca5-4687-80d9-ec2cb7bc7bf9	soc2	2022	B7	CC6	b7_cc6_evaluation_3	Are certificates or records of destruction retained for all disposed assets?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
e90a54eb-3eff-4d57-8819-d8c93247348f	soc2	2022	B7	CC6	b7_cc6_sufficiency_0	Describe the disposal or sanitisation procedure shown — methods defined per asset type.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
49b3f23b-ae06-40b4-8366-53809326fe17	soc2	2022	B7	CC6	b7_cc6_sufficiency_1	Does the evidence include a destruction certificate or record for each disposed asset?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
6c68869b-6f3b-4753-a55a-f83ced4f7917	soc2	2022	B7	CC6	b7_cc6_sufficiency_2	Does the evidence show disposal methods are matched to the sensitivity of the data involved?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
6196230c-c4b1-4f04-978d-f2e3e1550f31	soc2	2022	B8	CC6	b8_cc6_evaluation_0	Are all network boundary points protected by firewalls or equivalent controls?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
ce020bab-2109-4534-9fe5-27166928d2e3	soc2	2022	B8	CC6	b8_cc6_evaluation_1	Is an IDS/IPS system configured and actively monitored?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
0ea25b0b-cc94-4d61-9e71-af2316f3f79b	soc2	2022	B8	CC6	b8_cc6_evaluation_2	Is all data in transit encrypted across in-scope communication channels?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b21afccc-97ef-41cb-84a3-b38deb12e5b8	soc2	2022	B8	CC6	b8_cc6_evaluation_3	Is removable media use restricted by technical or policy controls?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
e6589715-9e61-4823-a70d-cd9ae0390704	soc2	2022	B8	CC6	b8_cc6_sufficiency_0	Describe the boundary protection shown — which boundaries are covered and what rules are documented.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6284f691-2244-4254-9ac3-d27275866887	soc2	2022	B8	CC6	b8_cc6_sufficiency_1	Describe the IDS/IPS configuration shown — placement, monitored events, and alert handling.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
d7ccfbab-cd53-4def-9414-e2778cb6d444	soc2	2022	B8	CC6	b8_cc6_sufficiency_2	Describe the encryption evidence shown — protocols in use and communication channels covered.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
7f7f2c55-7a1a-43dc-b61e-6d2a4529ed98	soc2	2022	B8	CC6	b8_cc6_sufficiency_3	Does the evidence describe controls restricting removable media use?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
61009769-b180-43ca-b30c-347caf4f8d13	soc2	2022	B9	CC6	b9_cc6_evaluation_0	Does the anti-malware solution cover all in-scope endpoints and servers?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
76298508-355f-47ea-b7f6-f28445780d74	soc2	2022	B9	CC6	b9_cc6_evaluation_1	How frequently are anti-malware definitions updated?	evaluation	mcq	[{"key": "real-time___automatic", "label": "Real-time / automatic"}, {"key": "daily", "label": "Daily"}, {"key": "weekly", "label": "Weekly"}, {"key": "monthly", "label": "Monthly"}, {"key": "not_regularly_updated", "label": "Not regularly updated"}]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
3b2f9fbd-2199-4e65-862a-c26b4d3f0485	soc2	2022	B9	CC6	b9_cc6_evaluation_2	Is software installation restricted to authorised personnel only?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
93144116-0e30-453f-a3b1-28e7955e44ab	soc2	2022	B9	CC6	b9_cc6_evaluation_3	Are file integrity or configuration change detection controls in place?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
4388afa3-24da-4195-b84a-30d8ff2106ce	soc2	2022	B9	CC6	b9_cc6_sufficiency_0	Describe the anti-malware coverage shown — which system types are covered and any gaps noted.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b3c1355a-c6a4-4547-89ec-8ab1a20a6456	soc2	2022	B9	CC6	b9_cc6_sufficiency_1	State the anti-malware definition update frequency shown in the evidence.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
03465cab-9e68-4072-83ea-3684cb3279c6	soc2	2022	B9	CC6	b9_cc6_sufficiency_2	Does the evidence show that software installation is restricted to authorised personnel only?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
6eb730ab-e39c-4635-a9f9-555e9ba19d2e	soc2	2022	B9	CC6	b9_cc6_sufficiency_3	Does the evidence describe change detection or file integrity monitoring controls?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
489e3728-e487-48d6-9eb6-880880a0c80f	soc2	2022	C1	CC7	c1_cc7_evaluation_0	Describe the security configuration baseline in use — which standard is adopted, which systems it covers, and who maintains it.	evaluation	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
85d8fffa-be5a-48bd-8ab8-01b57baeb5dd	soc2	2022	C1	CC7	c1_cc7_evaluation_1	Does the baseline cover all in-scope system types?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c99111f4-38da-4efc-8dd8-a48b93d7aa03	soc2	2022	C1	CC7	c1_cc7_evaluation_2	Is automated monitoring active to detect deviations from the baseline?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
f75bf7d1-564e-4ba5-9357-2ff16229809a	soc2	2022	C1	CC7	c1_cc7_evaluation_3	How frequently are vulnerability scans conducted?	evaluation	mcq	[{"key": "continuously", "label": "Continuously"}, {"key": "weekly", "label": "Weekly"}, {"key": "monthly", "label": "Monthly"}, {"key": "quarterly", "label": "Quarterly"}, {"key": "ad_hoc_only", "label": "Ad hoc only"}]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
c87b647b-3d13-4851-9642-ea3a842dda67	soc2	2022	C1	CC7	c1_cc7_sufficiency_0	State the configuration baseline standard shown in the evidence — e.g. CIS Benchmark version and profile applied.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
9ff43681-2203-4479-8a9a-4ef84c756c86	soc2	2022	C1	CC7	c1_cc7_sufficiency_1	Describe the baseline comparison or compliance scan shown — date, systems covered, and pass/fail result.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
5f99d077-0db3-492b-8c66-a23285a43608	soc2	2022	C1	CC7	c1_cc7_sufficiency_2	Does the evidence show that automated monitoring for baseline deviations is active?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
70d511ac-79b7-43a8-9b90-1d43f8f9c59b	soc2	2022	C1	CC7	c1_cc7_sufficiency_3	Describe the vulnerability scan results shown — scan date, scope, and number of findings by severity.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
13e14da6-3cc9-4c8a-afe1-894220458fd3	soc2	2022	C2	CC7	c2_cc7_evaluation_0	Are all in-scope system types generating and forwarding logs to a central store?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
0e484197-45b1-4a66-afd2-baf539d96b39	soc2	2022	C2	CC7	c2_cc7_evaluation_1	Describe the alert rules configured for key security events — include examples of events that trigger alerts.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
f380276a-4d90-498b-adb5-573a00b2660c	soc2	2022	C2	CC7	c2_cc7_evaluation_2	Does log retention meet the defined policy or regulatory requirement?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
864a2bca-bee3-4903-9800-7f8bb721ba90	soc2	2022	C2	CC7	c2_cc7_evaluation_3	Is the log analysis and triage process formally documented?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
3cc5bb85-bf19-4ce3-b460-396332dea272	soc2	2022	C2	CC7	c2_cc7_sufficiency_0	Does the evidence list all log sources included in the monitoring scope?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
65f0ff72-e07d-4590-b5c2-2b47dada349d	soc2	2022	C2	CC7	c2_cc7_sufficiency_1	Describe the alert rules shown — list the key events that trigger alerts.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
b101b544-8b83-4df1-9b6a-836b6387e53c	soc2	2022	C2	CC7	c2_cc7_sufficiency_2	State the log retention period shown in the evidence and confirm it meets the defined requirement.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
08b6b749-f524-41be-80ca-0bbfb9f8a588	soc2	2022	C2	CC7	c2_cc7_sufficiency_3	Does the evidence document a formal log analysis and triage process?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
2fd53d40-6574-4980-b57e-a2c43dc36cee	soc2	2022	C3	CC7	c3_cc7_evaluation_0	Are formal triage criteria defined to classify security events by severity?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
e4e024f5-9bac-4520-9b2b-37d793b2062f	soc2	2022	C3	CC7	c3_cc7_evaluation_1	Does the triage process include an explicit assessment of confidentiality and privacy impact?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
0c0806bb-8461-4465-bc24-b06562fc64fe	soc2	2022	C3	CC7	c3_cc7_evaluation_2	Describe the escalation and communication path for security events — who is notified and within what timeframe.	evaluation	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
01079111-33c4-49c5-b242-375b8eb9360b	soc2	2022	C3	CC7	c3_cc7_evaluation_3	Are all security incidents formally documented with status and resolution?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
df2d11d2-db42-461b-863c-d092d7d786a5	soc2	2022	C3	CC7	c3_cc7_sufficiency_0	Describe the triage process shown — how events are classified and escalated to incident status.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
7dc00250-b02d-4418-ab62-edb439e67c63	soc2	2022	C3	CC7	c3_cc7_sufficiency_1	Does the evidence show that confidentiality and privacy impact is assessed during incident triage?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
e89bce23-ff07-4040-a25d-d5fa0433c217	soc2	2022	C3	CC7	c3_cc7_sufficiency_2	Describe the escalation path shown — who is notified and within what timeframe.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
e8dd960d-0ac9-44d5-9a52-1358297df265	soc2	2022	C3	CC7	c3_cc7_sufficiency_3	Does the evidence specify what must be documented for each security incident?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
fadf0879-599e-418b-a483-f46ccd36eae8	soc2	2022	C4	CC7	c4_cc7_evaluation_0	Are roles and responsibilities for incident response formally assigned?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
af268d5b-d90a-4297-9930-eb74ee75f870	soc2	2022	C4	CC7	c4_cc7_evaluation_1	Are containment and remediation procedures documented for key incident types?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
6050cf68-d1b4-4b76-906e-7b381ae92ee0	soc2	2022	C4	CC7	c4_cc7_evaluation_2	Are internal and external communication protocols defined in the incident response plan?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
09265f78-a010-438a-8ae9-321de14599be	soc2	2022	C4	CC7	c4_cc7_evaluation_3	Has the incident response plan been tested or exercised in the last 12 months?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
93d80069-6467-4b6b-8e48-37ea9752dcbc	soc2	2022	C4	CC7	c4_cc7_evaluation_4	Is root cause analysis performed for all significant incidents?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
91482495-1215-40a7-8932-13126691b300	soc2	2022	C4	CC7	c4_cc7_sufficiency_0	Describe the incident response roles shown in the evidence — name the roles and responsibilities defined.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
5da78339-af49-4082-8141-ce8d0b8269b7	soc2	2022	C4	CC7	c4_cc7_sufficiency_1	Does the evidence include containment and remediation procedures for key incident types?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
1a7aae70-3275-401c-8911-79294778e811	soc2	2022	C4	CC7	c4_cc7_sufficiency_2	Does the evidence define internal and external communication protocols for incidents?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
243bd079-801d-47f8-bd1b-8002218fe717	soc2	2022	C4	CC7	c4_cc7_sufficiency_3	Does the evidence define recovery procedures?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
1eb1bf74-7d58-4cb6-9a30-ac88c633fd27	soc2	2022	C4	CC7	c4_cc7_sufficiency_4	Describe the post-incident review or exercise shown — date, format, participants, and key findings.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
58aaf35a-7497-4bbb-9191-f8d9a5b05cdd	soc2	2022	C5	CC8	c5_cc8_evaluation_0	Does the change management policy cover all change types including standard, normal, and emergency?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6c41f767-cf6c-42ad-a04a-e2f77e4e2749	soc2	2022	C5	CC8	c5_cc8_evaluation_1	Is formal approval required and documented before any change is implemented in production?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
1f3cabef-d257-4856-a01c-ea793ac52a03	soc2	2022	C5	CC8	c5_cc8_evaluation_2	Is testing documented prior to every production deployment?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
68035b3e-d310-4167-a722-2077c31c2896	soc2	2022	C5	CC8	c5_cc8_evaluation_3	Is separation of duties enforced between the developer and the person deploying changes to production?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
bdeeb40a-dfbc-4ddc-beae-e451e4604215	soc2	2022	C5	CC8	c5_cc8_evaluation_4	Is an emergency change process formally defined with appropriate authorisation controls?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
51003f00-25e3-4481-aec2-3de4cc580161	soc2	2022	C5	CC8	c5_cc8_sufficiency_0	Does the evidence document a formal change management policy or process?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
bdc7747b-dabc-405f-97da-37e02680a4eb	soc2	2022	C5	CC8	c5_cc8_sufficiency_1	Describe the change records shown — confirm approval is documented and note who approved.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
45310df7-7306-41a0-a92f-f93c6fe4a305	soc2	2022	C5	CC8	c5_cc8_sufficiency_2	Describe the testing evidence shown — type of testing performed and outcome documented.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
68b8903c-d95e-4ae9-af5e-65d45fa941be	soc2	2022	C5	CC8	c5_cc8_sufficiency_3	Does the evidence define an emergency change procedure?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
1929fd2b-5be7-4e69-95bf-0815f80d7b33	soc2	2022	C5	CC8	c5_cc8_sufficiency_4	Does the evidence confirm the baseline configuration is maintained and current?	sufficiency	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
57e2ab03-84da-4752-ad6c-aabf39fa9056	soc2	2022	D1	CC7	d1_cc7_evaluation_0	Is the vulnerability management policy formally documented?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
a9db4560-f6e3-405b-9a01-e6abcf6285dd	soc2	2022	D1	CC7	d1_cc7_evaluation_1	State the remediation timelines defined in the policy for each severity level — critical, high, medium, and low.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
4f5d94ce-a2a6-4709-9a9b-ae491b8e9053	soc2	2022	D1	CC7	d1_cc7_evaluation_2	Does the vulnerability management policy scope include all in-scope system types and environments?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
7daa3436-eee8-4013-8987-b09da05b582a	soc2	2022	D1	CC7	d1_cc7_evaluation_3	Are vulnerability policy exceptions formally tracked and approved?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
34399c6f-6d80-47e6-9f5c-9ca3558dac4f	soc2	2022	D1	CC7	d1_cc7_sufficiency_0	State the vulnerability scanning frequency defined in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6a3d5c8e-b1fe-4ef6-b639-cf004e578cac	soc2	2022	D1	CC7	d1_cc7_sufficiency_1	State the remediation timelines for each severity level as defined in the evidence.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
4cab5d08-fafd-4776-8c31-4b9df5d08bee	soc2	2022	D1	CC7	d1_cc7_sufficiency_2	Describe the system coverage scope defined in the evidence — environments and system types in scope.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
98035cff-3bb6-4c70-9c66-b0151f285cce	soc2	2022	D1	CC7	d1_cc7_sufficiency_3	Does the evidence describe a formal exception handling process for vulnerability management?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
7c126a84-de6a-480a-8dea-4983bac78737	soc2	2022	D2	CC7	d2_cc7_evaluation_0	Were all in-scope systems covered in the most recent vulnerability scan?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
93f1f1d8-1436-4576-8b9b-5800f01f0f22	soc2	2022	D2	CC7	d2_cc7_evaluation_1	How recent is the most current vulnerability scan?	evaluation	mcq	[{"key": "within_the_last_30_days", "label": "Within the last 30 days"}, {"key": "31-60_days_ago", "label": "31–60 days ago"}, {"key": "61-90_days_ago", "label": "61–90 days ago"}, {"key": "more_than_90_days_ago", "label": "More than 90 days ago"}]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c6feb063-2ffa-4b23-a2bd-f2d84de1401a	soc2	2022	D2	CC7	d2_cc7_evaluation_2	Name the scanning tool used and explain why it is appropriate for the environment.	evaluation	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b069a821-b84e-4df5-9c10-7147a3aca2e3	soc2	2022	D2	CC7	d2_cc7_evaluation_3	Are all identified vulnerabilities assigned a severity rating?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
42cc7250-2b40-45d0-832d-2b9ae30698b0	soc2	2022	D2	CC7	d2_cc7_evaluation_4	Is remediation tracked to closure for all identified vulnerabilities?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
9399f327-f01d-4a47-bb17-b38a9aac4150	soc2	2022	D2	CC7	d2_cc7_sufficiency_0	State the date the vulnerability scan was performed as shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
575a9a3d-f725-4d9c-8f91-631ee20832cf	soc2	2022	D2	CC7	d2_cc7_sufficiency_1	Describe which systems were included in the scan scope. Note any exclusions and the reason given.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
e4bda1e9-3acd-4f63-b33b-c53c343b83d9	soc2	2022	D2	CC7	d2_cc7_sufficiency_2	Describe the findings shown — number per severity level (critical, high, medium, low).	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
1c25d68f-3ffe-43c1-9eb8-fc5a69ebdaac	soc2	2022	D2	CC7	d2_cc7_sufficiency_3	Describe the remediation status shown — how many findings are open, in progress, or closed.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
9f751832-a69b-4cd5-9753-13db2b0a85f2	soc2	2022	D3	CC7	d3_cc7_evaluation_0	Are all identified findings tracked in a centralised register?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
42d9b9aa-cf3e-4a4a-bcca-b6d59c10fb4e	soc2	2022	D3	CC7	d3_cc7_evaluation_1	Describe whether critical findings are being remediated within the policy-defined timeline — note any overdue findings and reasons.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
8befe481-43b6-4301-9589-9494ce73601d	soc2	2022	D3	CC7	d3_cc7_evaluation_2	Is risk acceptance for unresolved findings formally signed off by an authorised approver?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
9f3bd46f-c981-48a1-a03e-13e24721f669	soc2	2022	D3	CC7	d3_cc7_evaluation_3	Is closure of remediated findings independently verified?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
abaa63e0-991b-4432-aa14-4d564af84d30	soc2	2022	D3	CC7	d3_cc7_sufficiency_0	Does the evidence confirm all identified findings are logged in a centralised register?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
2ff3c328-2d1c-41a0-b747-053e5b3bfadb	soc2	2022	D3	CC7	d3_cc7_sufficiency_1	Describe how the evidence shows findings are prioritised by severity — note any findings exceeding their remediation timeline.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c5313c10-9dac-4afb-ba1b-7f65a5303740	soc2	2022	D3	CC7	d3_cc7_sufficiency_2	Does the evidence include verified closure evidence for all remediated findings?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
8caf43ce-cc39-445d-8743-b2dd6b9deb0f	soc2	2022	D3	CC7	d3_cc7_sufficiency_3	Describe the risk acceptance records shown — who signed off and for which findings.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
e0539a02-5b4f-43cc-8d27-a802a40717dc	soc2	2022	D4	CC4	d4_cc4_evaluation_0	Who conducted the most recent penetration test?	evaluation	mcq	[{"key": "independent_external_firm", "label": "Independent external firm"}, {"key": "internal_team_(dedicated_security)", "label": "Internal team (dedicated security)"}, {"key": "internal_team_(non-dedicated)", "label": "Internal team (non-dedicated)"}, {"key": "not_yet_performed", "label": "Not yet performed"}]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
ee7b7538-9f92-4f6f-8bf1-1a09d87ff7db	soc2	2022	D4	CC4	d4_cc4_evaluation_1	Describe the scope of the penetration test — which systems, environments, and boundaries were tested.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
42752627-74d7-46e4-8ec1-8381659bbc99	soc2	2022	D4	CC4	d4_cc4_evaluation_2	Are penetration test findings rated by severity?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
9b888c2d-1485-4739-aeb1-8cab9e0be4fc	soc2	2022	D4	CC4	d4_cc4_evaluation_3	Is active remediation in progress for findings from the most recent penetration test?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
6383416a-92e7-4acd-80a2-08a9d83b28b6	soc2	2022	D4	CC4	d4_cc4_evaluation_4	Is penetration testing conducted at least annually?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
ca538ef6-4d46-4d09-85c0-af74471ebd61	soc2	2022	D4	CC4	d4_cc4_sufficiency_0	Describe the tester's credentials shown — firm name, qualifications, or independence confirmation.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b31bf1ef-daec-4fc7-a595-097237429c34	soc2	2022	D4	CC4	d4_cc4_sufficiency_1	Describe the test scope and methodology shown — systems tested and testing approach used.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
6e0255a6-21fa-4ac7-ac9e-abc3a92a60bc	soc2	2022	D4	CC4	d4_cc4_sufficiency_2	Describe the findings shown — number per severity level and note any critical or high findings.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
8e364548-31f0-489a-98a1-3087694ce8da	soc2	2022	D4	CC4	d4_cc4_sufficiency_3	Describe the remediation plan or status shown — which findings are addressed and current status.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
82c29138-cb1a-478a-ab10-6e09fbcc8c32	soc2	2022	E1	CC4	e1_cc4_evaluation_0	Is the internal monitoring programme formally documented?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
0abcb2ab-192c-45e5-bd51-51c013c88500	soc2	2022	E1	CC4	e1_cc4_evaluation_1	Does the programme include both ongoing monitoring and separate periodic evaluations?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
218f1589-858d-40eb-b0a5-7d81eb23987b	soc2	2022	E1	CC4	e1_cc4_evaluation_2	Are identified control deficiencies formally communicated to senior management and the Board?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
330d3d70-d017-4426-a740-4f45e3b2ab1d	soc2	2022	E1	CC4	e1_cc4_evaluation_3	Is corrective action for all identified deficiencies tracked to closure?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
887c0e1f-ce9c-4dff-94be-fd39b67e295e	soc2	2022	E1	CC4	e1_cc4_sufficiency_0	Does the evidence show both ongoing monitoring and separate periodic evaluations are in place?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
7162de82-bcc0-4f16-86c1-b81e40dff8fb	soc2	2022	E1	CC4	e1_cc4_sufficiency_1	Describe the evaluators identified in the evidence — their roles and qualifications as shown.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
ef74f3b2-7da0-499f-b132-05fa3f8ff19c	soc2	2022	E1	CC4	e1_cc4_sufficiency_2	Describe the deficiencies shown — what was identified, how it was communicated, and to whom.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
ee71aa65-657a-43f1-9aa4-1ac420ae25d7	soc2	2022	E1	CC4	e1_cc4_sufficiency_3	Describe how corrective actions are tracked in the evidence — status, ownership, and target closure dates.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
de1fbf62-e5ae-4b7c-8fdf-dd511b96b6bf	soc2	2022	E2	CC1	e2_cc1_evaluation_0	Does a code of conduct exist and has it been communicated to all staff?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b8ae3126-fb04-47cf-8151-731b954d5319	soc2	2022	E2	CC1	e2_cc1_evaluation_1	Is security awareness training completion evidenced for all staff?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
05a28ea4-1971-4152-bc4c-74f336314bfd	soc2	2022	E2	CC1	e2_cc1_evaluation_2	Are competency assessments performed for personnel in security-relevant roles?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
5aa54b02-9464-413b-9602-da3e2ec7c2f5	soc2	2022	E2	CC1	e2_cc1_evaluation_3	Describe the accountability mechanism for internal control responsibilities — include performance review and disciplinary processes.	evaluation	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
ed75c2ce-5de6-48b7-a3ff-17aabb94bc13	soc2	2022	E2	CC1	e2_cc1_sufficiency_0	Does the evidence include a formally issued code of conduct or ethics policy?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
ba4ac75d-0f93-4a78-b97a-cd0407d53474	soc2	2022	E2	CC1	e2_cc1_sufficiency_1	Does the evidence demonstrate tone-at-the-top commitment to integrity across all levels of the organisation?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
3df3c5a8-25a5-4c30-9241-1f23f6a78d48	soc2	2022	E2	CC1	e2_cc1_sufficiency_2	Describe the staff screening and competency assessment processes shown in the evidence.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
dd65d908-ddde-476f-9ba3-bcf78a487540	soc2	2022	E2	CC1	e2_cc1_sufficiency_3	Does the evidence describe both accountability mechanisms and a formal disciplinary process?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
c58926a0-7229-4325-a4ca-b6546909cb6c	soc2	2022	E3	CC2	e3_cc2_evaluation_0	Is information quality — accuracy, completeness, and timeliness — actively managed and monitored?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
7d6191f0-ed29-4a86-afe4-2dc3dc0ced4d	soc2	2022	E3	CC2	e3_cc2_evaluation_1	Do personnel responsible for controls understand their specific responsibilities?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
14013d2a-00c2-4068-9db4-ee00bf03c7d4	soc2	2022	E3	CC2	e3_cc2_evaluation_2	Are separate communication channels available (e.g. a whistleblower hotline)?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
784dc35a-9f96-404c-b1d6-f8afa60b85a4	soc2	2022	E3	CC2	e3_cc2_evaluation_3	Describe the process for external communications related to security incidents — who is contacted, within what timeframe, and how.	evaluation	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
088ccc6a-0f7c-47b5-bdc9-8483d3c312f2	soc2	2022	E3	CC2	e3_cc2_sufficiency_0	Does the evidence describe formal processes for managing information quality?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b565a622-7449-4f6a-acf1-f49994db00db	soc2	2022	E3	CC2	e3_cc2_sufficiency_1	Does the evidence show how control responsibilities are communicated internally?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
80ddc4b3-2191-4d5e-b06f-7df653c1c2c0	soc2	2022	E3	CC2	e3_cc2_sufficiency_2	Describe the separate reporting channel shown — what it is, how it is accessed, and who manages it.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
93b4af9e-72df-473f-ab0a-47ea7f0acfdf	soc2	2022	E3	CC2	e3_cc2_sufficiency_3	Does the evidence define an external communication procedure for security incidents?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
5406876a-a691-402f-99e1-2e6177a3200f	soc2	2022	F1	A1	f1_a1_evaluation_0	Is current system capacity actively measured and baselined?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b707b3f8-af86-4ce7-bbc2-49f84e0c4956	soc2	2022	F1	A1	f1_a1_evaluation_1	Does capacity forecasting explicitly cover peak usage scenarios?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
abde78c6-bdbc-4bec-9f73-140e50b861e2	soc2	2022	F1	A1	f1_a1_evaluation_2	Is a formal change process triggered when forecasted usage approaches defined capacity limits?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
a6c62564-7ea3-4a87-9442-05b7fed3ae25	soc2	2022	F1	A1	f1_a1_evaluation_3	Is system resilience — e.g. redundancy and failover — factored into capacity planning?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
a600fe70-2f69-4cf8-af93-fec3ffbe782d	soc2	2022	F1	A1	f1_a1_sufficiency_0	Describe the capacity baseline shown — metrics tracked, current values, and date of measurement.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
e3966e59-26c0-48ed-a01d-614a4a33783a	soc2	2022	F1	A1	f1_a1_sufficiency_1	Describe the system usage metrics shown — what is measured and current usage levels.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
3b9e2491-7d32-49b0-be8b-a95bc5f64b2e	soc2	2022	F1	A1	f1_a1_sufficiency_2	Does the evidence describe a capacity forecasting method?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
597e60fe-b90b-4b19-af7f-70bf41d1ed4b	soc2	2022	F1	A1	f1_a1_sufficiency_3	Describe the capacity thresholds shown and the process triggered when they are breached.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
75dc9009-34fb-47b1-a0db-967cf5adeb02	soc2	2022	F2	A1	f2_a1_evaluation_0	Is all critical data included in the backup schedule?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
546ced20-1e76-48fa-beb1-b449c9d489e3	soc2	2022	F2	A1	f2_a1_evaluation_1	Where is backup data stored?	evaluation	mcq	[{"key": "offsite_physical_location", "label": "Offsite physical location"}, {"key": "separate_cloud_region", "label": "Separate cloud region"}, {"key": "same_site_as_primary", "label": "Same site as primary"}, {"key": "no_offsite___alternate_storage", "label": "No offsite / alternate storage"}]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
b6de195c-9b8a-4c67-80a4-e46c54a2ea9a	soc2	2022	F2	A1	f2_a1_evaluation_2	Has the alternate processing infrastructure been tested for failover?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
f8cbd7d7-d187-48df-bdaf-defd6a142d63	soc2	2022	F2	A1	f2_a1_evaluation_3	Describe the controls in place to mitigate ransomware risk to backups — e.g. immutable storage, air-gapped copies.	evaluation	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
d044b9a3-57c7-4270-a8f2-2e83be5a3107	soc2	2022	F2	A1	f2_a1_sufficiency_0	Describe the backup schedule shown — what is backed up, how frequently, and the retention period.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
bfaf6faf-a0c1-4bd9-be44-63c699b0f5a2	soc2	2022	F2	A1	f2_a1_sufficiency_1	Does the evidence confirm backup data is stored at an offsite or geographically separate location?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
66ac3196-3634-41b4-9f9b-ef41032b0831	soc2	2022	F2	A1	f2_a1_sufficiency_2	Does the evidence describe an alternate processing capability with confirmed readiness?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
3cafe0d6-3d63-4cc3-9007-652280358cdd	soc2	2022	F2	A1	f2_a1_sufficiency_3	Describe the recovery test results shown — test date, what was tested, outcome, and any issues.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
a399b945-dbe5-4dc4-90f2-22ad0651b83c	soc2	2022	G1	C1	g1_c1_evaluation_0	Is confidential information formally defined with documented classification categories?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
0bf5250c-bbae-4617-83e5-e32ebe47a5af	soc2	2022	G1	C1	g1_c1_evaluation_1	Is the data classification process actively operating?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
282b5a74-d054-42c1-84b4-ce6932e35032	soc2	2022	G1	C1	g1_c1_evaluation_2	Are retention periods documented for each category of confidential information?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
6f473ccc-49cc-4fa7-b87e-9b4fc0e33720	soc2	2022	G1	C1	g1_c1_evaluation_3	Does the disposal procedure include formally defined secure destruction methods?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
9a795038-a62b-495d-bc94-51c71aa9c805	soc2	2022	G1	C1	g1_c1_sufficiency_0	Describe how confidential information is defined in the evidence — what categories are specified.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b58b6456-3548-411c-88df-62348a1bedc7	soc2	2022	G1	C1	g1_c1_sufficiency_1	Does the evidence describe a formal data classification and tagging procedure?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
bdbd3465-4452-4d15-a5d6-91dbe363f01d	soc2	2022	G1	C1	g1_c1_sufficiency_2	State the retention periods shown for each information category.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
5cb7cfa9-c5c2-4b7f-bec7-50daf79c1c4a	soc2	2022	G1	C1	g1_c1_sufficiency_3	Describe the disposal procedure shown — what destruction methods are defined for each asset type.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
ae582269-568b-4c59-bd00-8baf705906c1	soc2	2022	G2	PI1	g2_pi1_evaluation_0	Do processing integrity controls cover all stages — input, processing, output, and storage?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
30df5015-1b7e-4986-a4d8-a04a6045f4b6	soc2	2022	G2	PI1	g2_pi1_evaluation_1	Are input validation controls operating as designed?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
2c02b980-b2d7-4b5d-92ae-270fafce4d91	soc2	2022	G2	PI1	g2_pi1_evaluation_2	Are error handling and exception processes formally documented?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
e11597fd-d306-406e-bef4-2ce5146490eb	soc2	2022	G2	PI1	g2_pi1_evaluation_3	Is access to output data restricted to authorised parties only?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
062961e8-f97d-4652-9531-daa72eb85ce9	soc2	2022	G2	PI1	g2_pi1_evaluation_4	Are storage integrity controls in place to detect or prevent data corruption?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
58495816-a075-4ab6-840f-bfe84235996c	soc2	2022	G2	PI1	g2_pi1_sufficiency_0	Describe the input validation rules shown — what is validated and what constitutes a failure.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
0b443478-a056-42c8-b8d4-38d27170942d	soc2	2022	G2	PI1	g2_pi1_sufficiency_1	Does the evidence define formal processing specifications?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
f1bf1dd7-2dc6-4570-94d0-ebb2d46439e8	soc2	2022	G2	PI1	g2_pi1_sufficiency_2	Describe the error detection and correction process shown — how errors are identified and resolved.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
c3dad73d-1cd7-43bb-98c5-73c62d590e97	soc2	2022	G2	PI1	g2_pi1_sufficiency_3	Does the evidence show how output distribution is restricted to authorised parties only?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
409471e4-8ca0-44c9-9f0c-3f27b3facc9b	soc2	2022	G2	PI1	g2_pi1_sufficiency_4	Does the evidence show controls ensuring completeness and accuracy of stored data?	sufficiency	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
e0a7ec69-253e-4a39-bf8b-f6ebd4ed1395	soc2	2022	H1	P1	h1_p1_evaluation_0	Is the privacy notice current and published where data subjects can access it?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
065416c6-189a-4e4e-a7ff-7266166de035	soc2	2022	H1	P1	h1_p1_evaluation_1	State the effective or review date shown on the privacy notice.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
22997568-96ce-41ec-bd4c-658bc1bcea51	soc2	2022	H1	P1	h1_p1_evaluation_2	Does the privacy notice cover all required elements — purpose, choices, retention, access, disclosure, security, and contact details?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
08ee2c7f-995e-4964-93e7-4920bbfb418e	soc2	2022	H1	P1	h1_p1_evaluation_3	Are consent records retained in line with the privacy policy?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
ebe97ddc-0026-4554-9858-9bcbd4477d5d	soc2	2022	H1	P1	h1_p1_evaluation_4	Is explicit consent obtained before collecting sensitive personal information?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
cca7bfbc-b275-422f-8068-b56e0578115b	soc2	2022	H1	P1	h1_p1_sufficiency_0	State the effective or review date of the privacy notice shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
95fdaf66-9f4c-4d09-a1a4-05c1a663e200	soc2	2022	H1	P1	h1_p1_sufficiency_1	Describe the purpose specification shown — what purposes are stated for collecting personal information.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
a2dda5b4-21f0-4696-9d8f-0655eb61d62c	soc2	2022	H1	P1	h1_p1_sufficiency_2	Describe the consent capture mechanism shown — how consent is obtained from data subjects.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
f82d0283-2ee4-4630-952f-745e13c5075e	soc2	2022	H1	P1	h1_p1_sufficiency_3	Does the evidence include explicit consent records for sensitive personal information categories?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
e9fb2f1f-3816-4a48-9591-e86e23a8499d	soc2	2022	H1	P2	h1_p2_evaluation_0	Are data subjects clearly informed of all choices available regarding their personal information?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b0d527ab-e9e6-422d-b6e3-400dc626d013	soc2	2022	H1	P2	h1_p2_evaluation_1	Describe the consent capture process — how consent is obtained, documented, and stored.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
1d214309-6a27-4e4d-8548-45ba463480ba	soc2	2022	H1	P2	h1_p2_sufficiency_0	State the effective or review date of the privacy notice shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
6c60a2bf-63c3-452b-9c94-9774a6a63809	soc2	2022	H1	P2	h1_p2_sufficiency_1	Describe the purpose specification shown — what purposes are stated for collecting personal information.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
6d1e2628-6824-4eb2-a94b-84c911a0c2dc	soc2	2022	H1	P2	h1_p2_sufficiency_2	Describe the consent capture mechanism shown — how consent is obtained from data subjects.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
1c254c4e-6292-4e8f-93f0-1ac95d858297	soc2	2022	H1	P2	h1_p2_sufficiency_3	Does the evidence include explicit consent records for sensitive personal information categories?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
59c73bbf-2114-4439-bac0-be84785042e1	soc2	2022	H1	P3	h1_p3_evaluation_0	Is personal information collection limited to what is necessary for the stated purpose?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
7cf0f060-8da4-476f-b7ba-ea9a6bdf9170	soc2	2022	H1	P3	h1_p3_evaluation_1	Is explicit consent obtained before collecting sensitive personal information?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
a867ce38-70e8-4456-b7c1-8316deab74d8	soc2	2022	H1	P3	h1_p3_sufficiency_0	State the effective or review date of the privacy notice shown in the evidence.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
2b16f6c9-cdb1-45ce-bc77-a731f780be19	soc2	2022	H1	P3	h1_p3_sufficiency_1	Describe the purpose specification shown — what purposes are stated for collecting personal information.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
d73cc914-f06f-40c3-acf9-dee784ad5d00	soc2	2022	H1	P3	h1_p3_sufficiency_2	Describe the consent capture mechanism shown — how consent is obtained from data subjects.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
c66011fc-6ed0-4f12-aeb8-d815f7abdf01	soc2	2022	H1	P3	h1_p3_sufficiency_3	Does the evidence include explicit consent records for sensitive personal information categories?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
44ba5917-1f19-4eda-b691-9aa1b61d6efe	soc2	2022	H2	P3	h2_p3_evaluation_0	Is personal information collection minimised to the least amount necessary?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
7fd2ec91-1388-46e9-954a-9045ca5f510f	soc2	2022	H2	P3	h2_p3_evaluation_1	Are collection methods reviewed regularly to confirm they are lawful and fair?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c2c039d2-0af1-4765-9ad9-84733c2d6605	soc2	2022	H2	P3	h2_p3_evaluation_2	Is personal information use restricted strictly to the stated collection purpose?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
2af1a73f-0a20-487f-aeb2-c7f43838f087	soc2	2022	H2	P3	h2_p3_evaluation_3	Are retention schedules documented and in place for all personal information categories?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
a3ce57fa-2a02-4d6f-bf9d-7bfb519db12b	soc2	2022	H2	P3	h2_p3_sufficiency_0	Does the evidence confirm personal information collection is limited to stated purposes?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
10a4f50b-5fce-42e3-bf32-24bb67ee79ec	soc2	2022	H2	P3	h2_p3_sufficiency_1	Does the evidence confirm that collection methods are lawful and fair?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
8461e55b-78ab-4808-8e63-caa31f401884	soc2	2022	H2	P3	h2_p3_sufficiency_2	Does the evidence show personal information is used only for its intended purpose?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
c25697ca-4c8b-4c81-853c-d74f26b9a1fe	soc2	2022	H2	P3	h2_p3_sufficiency_3	State the retention periods shown for each personal information category and the purpose they align to.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
96aca6c0-ab86-4abe-90cf-0d2c82b22e60	soc2	2022	H2	P4	h2_p4_evaluation_0	Is personal information use limited to the identified and consented purpose?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
074e161f-6787-4955-a728-e49ccd02db4a	soc2	2022	H2	P4	h2_p4_evaluation_1	Describe the retention schedule for personal information and how adherence is monitored and enforced.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
f6d3261c-7a99-4b2d-adf7-dec68ed53065	soc2	2022	H2	P4	h2_p4_sufficiency_0	Does the evidence confirm personal information collection is limited to stated purposes?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
fcccec35-70a1-49a4-ae38-dbf6ef4a1133	soc2	2022	H2	P4	h2_p4_sufficiency_1	Does the evidence confirm that collection methods are lawful and fair?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
1027657d-1f18-4d4c-bf7b-a8e685eee738	soc2	2022	H2	P4	h2_p4_sufficiency_2	Does the evidence show personal information is used only for its intended purpose?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
ceefc808-e093-4b9e-ac03-953bf9404bbb	soc2	2022	H2	P4	h2_p4_sufficiency_3	State the retention periods shown for each personal information category and the purpose they align to.	sufficiency	text	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
89b3c0d0-eb6d-4cbd-acfc-d875fbbc4c4e	soc2	2022	H3	P4	h3_p4_evaluation_0	Are deletion requests from data subjects captured and tracked to completion?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
a7f35a2c-f122-4595-96fc-6b7da6c502a9	soc2	2022	H3	P4	h3_p4_evaluation_1	Is destruction of personal information formally performed and documented?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c97da43e-f136-4291-9435-a71ce36bb74f	soc2	2022	H3	P4	h3_p4_evaluation_2	Are third parties notified when personal information they hold is subject to a deletion request?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
0e393640-0fd8-4c7d-986e-fb3ab0621d32	soc2	2022	H3	P4	h3_p4_evaluation_3	Is anonymisation verified to confirm it is irreversible before being used as an alternative to deletion?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
528b648f-7196-4e1b-b616-830214fcba33	soc2	2022	H3	P4	h3_p4_sufficiency_0	Does the evidence document a formal personal information deletion procedure?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
372a10ad-5952-4133-b13d-c7714afe7ca7	soc2	2022	H3	P4	h3_p4_sufficiency_1	Does the evidence show deletion requests are captured and tracked to completion?	sufficiency	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
068fde53-5170-4b20-8eee-7e1e86efc032	soc2	2022	H3	P4	h3_p4_sufficiency_2	Describe the destruction records shown — what information was destroyed and when.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
cedc88c6-620e-4b27-8cba-2cbc60b6a164	soc2	2022	H3	P4	h3_p4_sufficiency_3	Does the evidence describe the anonymisation process and confirm how irreversibility is verified?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
e38dd552-412b-4d12-b3d9-1259db019fac	soc2	2022	H4	P5	h4_p5_evaluation_0	Is data subject identity authenticated before access to personal information is granted?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
0db8a516-0841-40d6-ae31-87d686ed9a42	soc2	2022	H4	P5	h4_p5_evaluation_1	State the defined response timelines for data subject access requests and describe how compliance is monitored.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
02a1bd01-1115-4e20-9357-c02c648bd6db	soc2	2022	H4	P5	h4_p5_evaluation_2	Is the process for correcting or amending personal information formally documented?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b7b7b9a5-5ed8-430d-9074-051eecf46924	soc2	2022	H4	P5	h4_p5_evaluation_3	Are denials of access requests communicated to data subjects in writing with reasons given?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
a9d3869e-79b1-4041-aa47-cc7cce2f1444	soc2	2022	H4	P5	h4_p5_sufficiency_0	Describe the identity authentication method shown for data subject access requests.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b4243be8-5a22-4a19-92aa-7a4f781809b1	soc2	2022	H4	P5	h4_p5_sufficiency_1	State the response timelines for access requests as shown in the evidence.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c35d1b1e-a35e-41cb-b8be-bcd8861b6875	soc2	2022	H4	P5	h4_p5_sufficiency_2	Does the evidence describe a formal process for correcting or amending personal information?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
799d963b-7392-4cfc-acd8-349d09d38f21	soc2	2022	H4	P5	h4_p5_sufficiency_3	Does the evidence show how denials of access requests are communicated in writing with reasons given?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
d725837c-d28e-42e3-be8e-79bc975a364d	soc2	2022	H5	P6	h5_p6_evaluation_0	Are personal information disclosures restricted to authorised and consented recipients only?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
872e9b2e-0838-4fa6-b83f-a470d0285dcd	soc2	2022	H5	P6	h5_p6_evaluation_1	Are complete and accurate records of all authorised disclosures maintained?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
a36821d0-2162-4806-a386-5ac30ce9c112	soc2	2022	H5	P6	h5_p6_evaluation_2	Is a breach notification procedure formally defined — including timelines and required recipients?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
b821ff79-5213-41df-8a5a-6b3752eb9599	soc2	2022	H5	P6	h5_p6_evaluation_3	Have privacy commitments been obtained from all third parties with access to personal information?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
42da41e3-19c4-4283-8e3a-26144b70dec8	soc2	2022	H5	P6	h5_p6_evaluation_4	Is an accounting of personal information available to data subjects on request?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
516932cf-52fd-410d-9459-e9f64f2d32c1	soc2	2022	H5	P6	h5_p6_sufficiency_0	Does the evidence confirm that disclosures require consent or a legal basis?	sufficiency	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
de6472b6-342c-4674-8763-360e3ae03eb7	soc2	2022	H5	P6	h5_p6_sufficiency_1	Describe the disclosure records shown — what is recorded and how many disclosures are documented.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
ef478a36-427e-4df7-8f97-f8e9befe03f3	soc2	2022	H5	P6	h5_p6_sufficiency_2	Describe the breach notification procedure shown — detection steps, notification timelines, and recipients.	sufficiency	text	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
4165335e-cf1f-4959-9df7-453ec33b48b5	soc2	2022	H5	P6	h5_p6_sufficiency_3	Does the evidence include commitments from third parties to report suspected breaches?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
ab13dd5f-7c64-4767-b3b3-6b7a41232d31	soc2	2022	H5	P6	h5_p6_sufficiency_4	Does the evidence show how data subjects can obtain an accounting of their personal information?	sufficiency	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
6395c1d3-c3df-4b7d-afb8-8e9daecf7705	soc2	2022	H6	P7	h6_p7_evaluation_0	Are formal processes in place to maintain the accuracy and completeness of personal information?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
b45e9ee7-8437-46f5-8339-88fc0dc99614	soc2	2022	H6	P7	h6_p7_evaluation_1	Are privacy compliance reviews conducted and documented on a regular basis?	evaluation	yes_no	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
654b8217-dd22-4e16-b54d-c802762ad229	soc2	2022	H6	P7	h6_p7_evaluation_2	Is the privacy complaint and enquiry process communicated to all data subjects?	evaluation	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
92c41029-8c54-4e05-ab94-ce5c848dec24	soc2	2022	H6	P7	h6_p7_evaluation_3	Are privacy disputes formally resolved and resolutions documented?	evaluation	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
9ebc7947-fd0e-4b6c-9fe3-13f45add51cc	soc2	2022	H6	P7	h6_p7_evaluation_4	Have all personnel handling personal information completed privacy training?	evaluation	yes_no	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
417c97fa-3c0a-4500-b262-c58bb6478a07	soc2	2022	H6	P7	h6_p7_sufficiency_0	Describe the data quality processes shown — how accuracy and completeness of personal information are maintained.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
8725de9a-c2ec-4918-af91-99e3d67cc35d	soc2	2022	H6	P7	h6_p7_sufficiency_1	Describe the privacy compliance monitoring shown — what is monitored, how often, and by whom.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
ac6ae769-cbc5-4b1e-855d-c76804af3ce4	soc2	2022	H6	P7	h6_p7_sufficiency_2	Does the evidence describe a formal process for receiving and handling privacy complaints and enquiries?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
e77fad9c-f854-4480-b60a-196e22ed61cb	soc2	2022	H6	P7	h6_p7_sufficiency_3	Does the evidence show how privacy disputes are resolved and formally documented?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
bba0c9af-4a38-4ffa-9ce8-805287e703ff	soc2	2022	H6	P7	h6_p7_sufficiency_4	Describe the privacy training shown — content, target audience, and completion status.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
7c1aed59-558b-49d4-a2d9-1fdfaac11120	soc2	2022	H6	P8	h6_p8_evaluation_0	Is ongoing privacy compliance monitoring formally implemented and documented?	evaluation	yes_no	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
f3f07c17-0629-4e4c-ab9a-6cd4ddc4f899	soc2	2022	H6	P8	h6_p8_evaluation_1	Describe the sanctions framework for privacy policy violations — what sanctions apply, how they are triggered, and provide an example.	evaluation	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
c2bace4c-e74b-422d-b7d1-63b2642147a8	soc2	2022	H6	P8	h6_p8_sufficiency_0	Describe the data quality processes shown — how accuracy and completeness of personal information are maintained.	sufficiency	text	[]	t	\N	0	2026-03-11 07:00:41.413937+00	\N	\N
bacf6cec-d960-440f-8019-976e4e9da47c	soc2	2022	H6	P8	h6_p8_sufficiency_1	Describe the privacy compliance monitoring shown — what is monitored, how often, and by whom.	sufficiency	text	[]	t	\N	1	2026-03-11 07:00:41.413937+00	\N	\N
a6ae019d-9bd1-46d5-a13d-602adf4ef1c3	soc2	2022	H6	P8	h6_p8_sufficiency_2	Does the evidence describe a formal process for receiving and handling privacy complaints and enquiries?	sufficiency	yes_no	[]	t	\N	2	2026-03-11 07:00:41.413937+00	\N	\N
da2a89ec-f2e9-40bf-93e4-cd7b3e032a75	soc2	2022	H6	P8	h6_p8_sufficiency_3	Does the evidence show how privacy disputes are resolved and formally documented?	sufficiency	yes_no	[]	t	\N	3	2026-03-11 07:00:41.413937+00	\N	\N
1429a8b1-b7c7-4997-ab42-d4729a14924c	soc2	2022	H6	P8	h6_p8_sufficiency_4	Describe the privacy training shown — content, target audience, and completion status.	sufficiency	text	[]	t	\N	4	2026-03-11 07:00:41.413937+00	\N	\N
\.


--
-- Data for Name: evidence_domains; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.evidence_domains (id, name, color, accent_color, item_count, sort_order, soc_version, created_at, cscf_version) FROM stdin;
A	Governance & Risk	#0F4C75	#BBE1FA	5	1	2022	2026-03-10 10:51:19.787337+00	2025v
B	Logical Access & Auth	#1B5E20	#C8E6C9	9	2	2022	2026-03-10 10:51:19.787337+00	2025v
C	System Operations	#4A148C	#E1BEE7	5	3	2022	2026-03-10 10:51:19.787337+00	2025v
D	Vulnerability Mgmt	#E65100	#FFE0B2	4	4	2022	2026-03-10 10:51:19.787337+00	2025v
E	Monitoring & Audit	#1565C0	#BBDEFB	3	5	2022	2026-03-10 10:51:19.787337+00	2025v
F	Availability	#B71C1C	#FFCDD2	2	6	2022	2026-03-10 10:51:19.787337+00	2025v
G	Confidentiality & PI	#00695C	#B2DFDB	2	7	2022	2026-03-10 10:51:19.787337+00	2025v
H	Privacy	#BF360C	#FFCCBC	6	8	2022	2026-03-10 10:51:19.787337+00	2025v
\.


--
-- Data for Name: evidence_submission_history; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.evidence_submission_history (id, submission_id, version, changed_by, changed_at, change_type, snapshot_before, snapshot_after, justification) FROM stdin;
\.


--
-- Data for Name: evidence_submissions; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.evidence_submissions (id, cycle_id, tenant_id, evidence_item_id, submitted_by, status, scope_key, form_data, completion_pct, version, ai_summary, ai_confidence, submitted_at, evaluation_edits, evaluation_remediation, soc_version, created_at, updated_at, evaluation_result, cscf_version) FROM stdin;
\.


--
-- Data for Name: evidence_sufficiency_matrix; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.evidence_sufficiency_matrix (item_code, control_id, evidence_item_name, control_name, mandatory_advisory, evidence_type, sufficiency_criteria, evaluation_criteria, soc_version, created_at, cscf_version, ma) FROM stdin;
A1	CC9	Information security policy (comprehensive)	Risk Mitigation	M	Policy document; narrative PDF; standards document	{"must_show": ["Board approval signature/date", "Scope covering all trust services categories", "Policy owner named", "Annual review cycle", "Control environment commitments"]}	{"reviewer_checks": ["Risk mitigation and business disruption addressed in policy"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A1	CC1	Information security policy (comprehensive)	Control Environment	M	Policy document; narrative PDF; standards document	{"must_show": ["Board approval signature/date", "Scope covering all trust services categories", "Policy owner named", "Annual review cycle", "Control environment commitments"]}	{"reviewer_checks": ["Board-approved?", "Dated within 12 months?", "Covers CC1 through CC5?", "Risk mitigation addressed?", "Risk appetite statement present?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A1	CC5	Information security policy (comprehensive)	Control Activities	M	Policy document; narrative PDF; standards document	{"must_show": ["Board approval signature/date", "Scope covering all trust services categories", "Policy owner named", "Annual review cycle", "Control environment commitments"]}	{"reviewer_checks": ["Control activities deployed through policies", "Tone at top and structure documented"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A2	CC3	Risk assessment methodology & risk register	Risk Assessment	M	Risk assessment document; risk register; scenario analysis	{"must_include": ["Risk assessment methodology", "Risk register with inherent/residual ratings", "Fraud risk scenarios", "Change trigger review process"]}	{"reviewer_checks": ["Methodology documented?", "Risk register current?", "Fraud considered?", "Change events trigger re-assessment?", "Residual risks within tolerance?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A3	CC1	Board & management oversight evidence	Control Environment	M	Board minutes; committee reports; management review records	{"must_show": ["Board meeting frequency", "Security/privacy agenda items", "Deficiency communications", "Independent board member attestation"]}	{"reviewer_checks": ["Board meets regularly?", "Security on agenda?", "Deficiencies communicated?", "Board independence demonstrated?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A3	CC4	Board & management oversight evidence	Monitoring Activities	M	Board minutes; committee reports; management review records	{"must_show": ["Board meeting frequency", "Security/privacy agenda items", "Deficiency communications", "Independent board member attestation"]}	{"reviewer_checks": ["Deficiencies evaluated and communicated to management/board"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A4	CC9	Vendor & third-party risk management program	Risk Mitigation	M	Vendor register; risk tier classification; contract excerpts; assessment records	{"must_include": ["Vendor inventory with tier classification", "SLAs and NDAs", "Initial and periodic risk assessments", "Confidentiality/privacy commitments where applicable"]}	{"reviewer_checks": ["All critical vendors inventoried?", "Tiered by risk?", "SLAs present?", "Assessments current?", "Privacy commitments obtained?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
A5	A1	Business continuity & disaster recovery plan	Availability (Capacity, Recovery, Testing)	A	BCP/DR plan document; test records; alternate processing procedures	{"must_include": ["BCP/DR documented procedures", "Recovery time/point objectives", "Alternate processing infrastructure", "Test results within 12 months"]}	{"reviewer_checks": ["Plan documented?", "RTOs/RPOs set?", "Alternate infrastructure identified?", "Tested within 12 months?", "Lessons learned incorporated?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
A5	CC9	Business continuity & disaster recovery plan	Risk Mitigation	M	BCP/DR plan document; test records; alternate processing procedures	{"must_include": ["BCP/DR documented procedures", "Recovery time/point objectives", "Alternate processing infrastructure", "Test results within 12 months"]}	{"reviewer_checks": ["Risk mitigation for disruptions", "Environmental protections and recovery testing evidenced"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B1	CC6	Logical access control policy & procedures	Logical and Physical Access Controls	M	Policy document; procedures; standards	{"must_address": ["Identification and authentication requirements", "User registration/deregistration process", "Role-based access control", "Least privilege principle", "Separation of duties"]}	{"reviewer_checks": ["Policy covers all CC6.1–CC6.3 requirements?", "Roles defined?", "Least privilege addressed?", "Separation of duties documented?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B2	CC6	User access list & privileged account inventory	Logical and Physical Access Controls	M	Account listing; AD export; system account reports	{"must_include_per_account": ["Username", "System/application", "Account type (user/admin/service)", "Role assignment", "Last access review date"]}	{"reviewer_checks": ["All systems covered?", "Privileged accounts flagged?", "Service accounts inventoried?", "Last review dated?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B3	CC6	Access review records (periodic)	Logical and Physical Access Controls	M	Review reports; sign-off records; exception logs	{"must_show": ["Review date and reviewer", "Systems covered", "Actions taken (revoke/modify/retain)", "Exception handling"]}	{"reviewer_checks": ["Review cadence documented?", "All systems included?", "Actions evidenced?", "Exceptions resolved?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B4	CC6	MFA configuration evidence	Logical and Physical Access Controls	M	Configuration exports; architecture diagram; MFA policy	{"must_show": ["MFA implemented at all required access points", "Second factor type and management", "Remote access MFA enforcement", "External access boundary MFA"]}	{"reviewer_checks": ["MFA at all required points?", "Second factor separated from first?", "Remote access covered?", "External boundaries protected?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B5	CC6	Credential & encryption key management	Logical and Physical Access Controls	M	Key inventory; rotation records; vault/HSM config; encryption standards	{"must_show": ["Key inventory with algorithm and key length", "Key rotation schedule", "Storage mechanism (vault/HSM)", "Destruction/revocation procedure"]}	{"reviewer_checks": ["Keys inventoried?", "Rotation schedule met?", "Storage appropriately protected?", "Algorithm standards current?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B6	CC6	Physical access control evidence	Logical and Physical Access Controls	M	Access control system reports; badge logs; policy	{"must_show": ["Physical access restrictions to authorised personnel", "Process for creating/modifying/removing access", "Regular physical access review"]}	{"reviewer_checks": ["All facility types covered?", "Access modifications documented?", "Periodic reviews evidenced?", "Recovery of devices on departure?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B7	CC6	Media disposal & data sanitisation evidence	Logical and Physical Access Controls	M	Disposal certificates; sanitisation records; procedures	{"must_show": ["Disposal/sanitisation procedure", "Certificates or records per asset", "Method appropriate to data sensitivity"]}	{"reviewer_checks": ["Process documented?", "Methods appropriate?", "Assets tracked through disposal?", "Certificates retained?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B8	CC6	Boundary protection systems configuration	Logical and Physical Access Controls	M	Firewall configuration; IDS/IPS setup; network topology	{"must_show": ["Firewall rules at boundaries", "IDS/IPS placement and configuration", "Data transmission encryption", "Removable media controls"]}	{"reviewer_checks": ["All network boundaries protected?", "IDS/IPS configured?", "Data in transit encrypted?", "Removable media restricted?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
B9	CC6	Malware protection & unauthorised software controls	Logical and Physical Access Controls	M	Anti-malware config; update logs; software allowlist; change control evidence	{"must_show": ["Anti-malware on all endpoints/servers", "Update frequency", "Installation restrictions", "Change detection for configuration/software"]}	{"reviewer_checks": ["All systems covered?", "Updates current?", "Installation restricted to authorised personnel?", "Integrity checks in place?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
C1	CC7	System configuration standards & hardening	System Operations	M	Configuration exports; CIS benchmark results; hardening checklist	{"must_show": ["Defined configuration standard (e.g., CIS)", "Baseline comparison", "Monitoring for deviation", "Vulnerability scan results"]}	{"reviewer_checks": ["Baseline standard identified?", "All system types covered?", "Deviation monitoring active?", "Scans conducted regularly?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
C2	CC7	Anomaly detection & monitoring configuration	System Operations	M	SIEM config; log source list; alert rules; retention policy	{"must_cover": ["Log sources inventoried", "Alert rules configured for key events", "Retention period meets requirements", "Analysis process defined"]}	{"reviewer_checks": ["All system types logged?", "Alert rules for key events?", "Retention sufficient?", "Analysis process documented?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
C3	CC7	Security incident evaluation procedures	System Operations	M	Incident management procedures; evaluation workflow; escalation matrix	{"must_show": ["Event-to-incident triage process", "Impact assessment on confidential/personal information", "Communication to responsible parties", "Documentation requirements"]}	{"reviewer_checks": ["Triage criteria defined?", "Confidentiality/privacy impact assessed?", "Communication path clear?", "Incidents documented?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
C4	CC7	Security incident response & recovery procedures	System Operations	M	Incident response plan; response records; recovery procedures; lessons learned	{"must_include": ["Role assignments", "Containment and remediation steps", "Communication protocols", "Recovery procedures", "Post-incident review and testing"]}	{"reviewer_checks": ["Roles assigned?", "Containment procedures documented?", "Communication protocols defined?", "Recovery tested?", "Root cause analysis performed?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
C5	CC8	Change management procedures & records	Change Management	M	Change management policy; change records; approval evidence; test records	{"must_show": ["Change policy/process documented", "Change records with approval", "Testing evidence", "Emergency change procedure", "Baseline configuration maintained"]}	{"reviewer_checks": ["All change types covered?", "Approval before implementation?", "Testing documented?", "Separation of duties in deployment?", "Emergency process defined?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
D1	CC7	Vulnerability scanning & patch management policy	System Operations	M	Policy document; procedures; scanning schedule	{"must_include": ["Scanning frequency", "Severity-based timelines (critical/high/medium)", "System coverage scope", "Exception handling"]}	{"reviewer_checks": ["Policy documented?", "Timelines specific and risk-based?", "All system types in scope?", "Exceptions tracked?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
D2	CC7	Current vulnerability scan results	System Operations	M	Scan tool output; vulnerability report with severity ratings	{"must_include": ["Scan date", "All in-scope systems covered", "Severity-rated findings", "Remediation status"]}	{"reviewer_checks": ["All systems scanned?", "Scan recent?", "Tool recognised?", "Severities rated?", "Remediation tracked?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
D3	CC7	Vulnerability remediation tracking log	System Operations	M	Remediation tracker; risk register; action plan records	{"must_show": ["All findings tracked", "Severity-based prioritisation", "Closure evidence per finding", "Risk acceptance for accepted risks"]}	{"reviewer_checks": ["All findings tracked?", "Critical findings addressed within policy timeline?", "Risk acceptance signed?", "Closure verified?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
D4	CC4	Penetration test reports (annual)	Monitoring Activities	M	Penetration test report; executive summary; remediation plan	{"must_include": ["Independent tester credentials", "Test scope and methodology", "Findings with severity", "Remediation actions"]}	{"reviewer_checks": ["Tester independent?", "Scope adequate?", "Findings rated?", "Remediation in progress?", "Annual cadence?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
E1	CC4	Monitoring activities & internal audit program	Monitoring Activities	M	Internal audit plan; audit reports; monitoring schedules	{"must_show": ["Mix of ongoing and separate evaluations", "Knowledgeable evaluators", "Deficiencies identified and communicated", "Corrective action tracking"]}	{"reviewer_checks": ["Monitoring program documented?", "Both ongoing and separate evaluations present?", "Deficiencies communicated to senior management/board?", "Corrective action tracked?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
E2	CC1	Control environment & ethics evidence	Control Environment	M	Code of conduct; ethics training records; HR policy; disciplinary records	{"must_cover": ["Code of conduct/ethics policy", "Commitment of integrity at all levels", "Staff screening and competency assessment", "Accountability mechanisms including disciplinary process"]}	{"reviewer_checks": ["Code of conduct exists and communicated?", "Staff training evidenced?", "Competency assessments performed?", "Accountability mechanism documented?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
E3	CC2	Information & communication procedures	Communication and Information	M	Communication plan; internal reporting records; external communication evidence	{"must_show": ["Information quality processes", "Internal communication of responsibilities", "Separate reporting channels (e.g., whistleblower)", "External communication processes"]}	{"reviewer_checks": ["Information quality managed?", "Personnel understand responsibilities?", "Separate communication channels exist?", "External communication for incidents defined?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	M
F1	A1	Capacity management & availability monitoring	Availability (Capacity, Recovery, Testing)	A	Capacity reports; monitoring dashboards; utilisation data	{"must_include": ["Current capacity baseline", "Usage measurements", "Forecasting method", "Thresholds and change triggers"]}	{"reviewer_checks": ["Capacity measured?", "Forecast covers peak usage?", "Change triggered by forecast breach?", "System resilience considered?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
F2	A1	Backup & recovery infrastructure evidence	Availability (Capacity, Recovery, Testing)	A	Backup configuration; offsite storage evidence; recovery infrastructure docs; test records	{"must_show": ["Backup procedures and schedule", "Offsite or geographically separate storage", "Alternate processing capability", "Recovery test results"]}	{"reviewer_checks": ["All critical data backed up?", "Offsite storage at adequate distance?", "Alternate processing tested?", "Ransomware threat mitigated?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
G1	C1	Confidential information identification & retention	Confidentiality	A	Data classification policy; confidential data inventory; retention schedule	{"must_include": ["Definition of confidential information", "Classification and tagging procedure", "Retention period by category", "Disposal procedure with destruction methods"]}	{"reviewer_checks": ["Confidential information defined?", "Classification process operating?", "Retention periods documented?", "Disposal procedure includes destruction?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
G2	PI1	Processing integrity controls (input/processing/output)	Processing Integrity	A	Input validation rules; processing specs; output distribution procedures; error logs	{"must_cover": ["Input validation rules", "Processing specifications", "Error detection and correction", "Output distribution to intended parties only", "Storage completeness and accuracy"]}	{"reviewer_checks": ["All processing stages covered?", "Input validation operating?", "Error handling documented?", "Output access controlled?", "Storage integrity maintained?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H1	P1	Privacy notice & consent management	Privacy Notice and Communication	A	Privacy notice; consent records; data subject communication	{"must_include": ["Current, dated privacy notice", "Purpose specification", "Consent capture mechanism", "Documentation of explicit consent for sensitive information"]}	{"reviewer_checks": ["Privacy notice current?", "Dated?", "Covers all required elements?", "Consent records retained?", "Explicit consent for sensitive data?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H1	P2	Privacy notice & consent management	Choice and Consent	A	Privacy notice; consent records; data subject communication	{"must_include": ["Current, dated privacy notice", "Purpose specification", "Consent capture mechanism", "Documentation of explicit consent for sensitive information"]}	{"reviewer_checks": ["Choices communicated?", "Consent obtained and documented?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H1	P3	Privacy notice & consent management	Collection	A	Privacy notice; consent records; data subject communication	{"must_include": ["Current, dated privacy notice", "Purpose specification", "Consent capture mechanism", "Documentation of explicit consent for sensitive information"]}	{"reviewer_checks": ["Collection limited to stated purposes?", "Explicit consent for sensitive data obtained?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H2	P3	Personal information collection & use controls	Collection	A	Data inventory; collection procedures; data minimisation evidence; use records	{"must_show": ["Collection limited to stated purposes", "Lawful collection methods", "Use only for intended purposes", "Retention schedule aligned to purpose"]}	{"reviewer_checks": ["Collection minimised?", "Methods lawful?", "Use restricted to purpose?", "Retention schedules set?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H2	P4	Personal information collection & use controls	Use, Retention and Disposal	A	Data inventory; collection procedures; data minimisation evidence; use records	{"must_show": ["Collection limited to stated purposes", "Lawful collection methods", "Use only for intended purposes", "Retention schedule aligned to purpose"]}	{"reviewer_checks": ["Use limited to purpose?", "Retention schedule documented and enforced?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H3	P4	Personal information disposal procedures	Use, Retention and Disposal	A	Deletion procedures; deletion request logs; destruction certificates	{"must_show": ["Deletion procedure", "Deletion request capture and tracking", "Destruction records", "Anonymisation as alternative"]}	{"reviewer_checks": ["Deletion requests tracked?", "Destruction performed and documented?", "Third parties notified?", "Anonymisation verified?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H4	P5	Data subject access & correction procedures	Access	A	Access request procedure; correction procedure; request log; response records	{"must_show": ["Identity authentication before access", "Access granted within reasonable time", "Correction/amendment process", "Denial reasons communicated in writing"]}	{"reviewer_checks": ["Authentication required?", "Timelines defined?", "Correction process documented?", "Denials communicated with reasons?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H5	P6	Third-party PI disclosure & breach notification	Disclosure to Third Parties	A	Disclosure records; third-party PI agreements; breach notification procedure; breach log	{"must_include": ["Disclosure only with consent or legal basis", "Disclosure records", "Breach detection and notification procedure", "Third-party commitments to report", "Accounting of PI held available to data subjects"]}	{"reviewer_checks": ["Disclosures only authorised?", "Records complete?", "Breach notification procedure defined?", "Third-party commitments obtained?", "Accounting available on request?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H6	P7	Privacy quality & monitoring program	Quality	A	Privacy monitoring reports; complaint log; compliance review; training records	{"must_show": ["Data quality processes", "Monitoring of privacy compliance", "Complaint/inquiry process", "Dispute resolution and documentation", "Privacy training"]}	{"reviewer_checks": ["PI accuracy maintained?", "Compliance reviews conducted?", "Complaint process communicated?", "Disputes resolved and documented?", "Training completed?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
H6	P8	Privacy quality & monitoring program	Monitoring and Enforcement	A	Privacy monitoring reports; complaint log; compliance review; training records	{"must_show": ["Data quality processes", "Monitoring of privacy compliance", "Complaint/inquiry process", "Dispute resolution and documentation", "Privacy training"]}	{"reviewer_checks": ["Monitoring of privacy compliance?", "Sanctions for violations documented and applied?"]}	2022	2026-03-10 11:10:06.007826+00	2025v	A
\.


--
-- Data for Name: item_control_mappings; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.item_control_mappings (id, evidence_item_id, control_id, is_primary, weight, sufficiency_requirement, soc_version, created_at, cscf_version) FROM stdin;
857a0ae5-3185-4585-8719-d753099e150d	A1	CC1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
a8205401-6a09-4632-9ef8-d2162fa0cb6c	A1	CC5	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
b7d20ce5-7c70-4dc2-981d-64f8aced8464	A1	CC9	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
44ffec36-4215-4e2f-9d64-172fdae00369	A2	CC3	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
4bb1f94f-5eae-4428-9f50-27a0f86b3aef	A3	CC1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
3573bbba-6be4-4bd3-868e-99a202a3f754	A3	CC4	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
eaa58e47-9589-4942-b3c8-dccc7a935722	A4	CC9	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
96506850-e617-44f5-bce2-2dac1723c09f	A5	A1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
900afef0-f13a-4e66-bf00-b4ce300e1fce	A5	CC9	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
41fa4438-b1f5-4a05-8f32-1dfae12b0f35	B1	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
867bfac4-0053-46c9-a098-cc72c9e8ea51	B2	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
e140d355-d72e-4f79-a253-b859674caec9	B3	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
4540a1ba-ac83-491c-93a8-cec8a6e831f3	B4	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
ef81b53a-f871-40f3-a9e7-47ac2666845e	B5	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
7bc2c59e-35f0-4c82-8277-5ad26082c0f3	B6	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
d6b9cc6e-58cb-40a9-9a05-43fb5c4dacb2	B7	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
4b86ba16-d203-471f-a500-d0680e7e7ff1	B8	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
8132cf9c-b1a2-43d0-b164-5c754e6c07be	B9	CC6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
36d77372-3f74-4cd6-8698-d660f5f64dd4	C1	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
cde043c8-c95b-4f48-8323-d159ae12cf37	C2	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
b2bbbb66-a1dd-4fef-9188-8fc3ca4aaf56	C3	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
77d35734-8750-4ed1-b401-b10cf16fa4fc	C4	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
3a570861-d005-4cdd-b351-3d80b0fce176	C5	CC8	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
8cde0628-908b-4a70-a9b6-94a8af023e49	D1	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
8ba2582e-6198-440d-907f-0c3a03355eb3	D2	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
50e2abe3-7700-4d62-89c2-3bb1e3e3e5bd	D3	CC7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
6346584d-b310-43a2-b395-6ddfc74abc7c	D4	CC4	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
4a13315e-4ddc-4941-be90-ab60d3155a77	E1	CC4	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
f5a5a15c-2782-4137-8f47-a2e31369354d	E2	CC1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
afec683e-47a4-4530-b1c9-b0952672e024	E3	CC2	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
e07962e6-c832-48c2-b341-012198f9dae4	F1	A1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
dfe706c7-c219-4ecc-8cee-533a9ef22cac	F2	A1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
8458a1eb-8952-477c-b3df-dfc6d3367ffd	G1	C1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
ebec5daa-3af0-4214-8c26-f53d3643a2a0	G2	PI1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
c29fd967-8a83-4f64-af89-3486499e7031	H1	P1	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
1c303730-448e-44d7-b5b9-24443abfc35b	H1	P2	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
a9551619-c733-46bc-b5c9-b6d7e2a1a500	H1	P3	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
e7d7827b-dd23-40eb-bddf-187b4ea306b3	H2	P3	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
34630e0e-b7a6-49b8-9d19-317b517bccea	H2	P4	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
f0ff3755-7c9e-47fe-ac83-6e9d5ebe8fc9	H3	P4	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
476a91e4-63ef-4878-969a-fdcee9a8aa28	H4	P5	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
38971cc7-21b1-4178-8d1a-823542de37e6	H5	P6	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
63b9b21b-695c-4de1-93ec-5722eb796af7	H6	P7	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
625b7fb3-ca17-4596-ab4c-d444f44d8fdf	H6	P8	f	1.00	\N	2022	2026-03-10 10:51:19.787337+00	2025v
\.


--
-- Data for Name: notes; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.notes (id, tenant_id, resource_type, resource_id, parent_id, author_id, body, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.notifications (id, user_id, resource_type, resource_id, action, actor_id, title, body, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: review_assignments; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.review_assignments (id, submission_id, reviewer_id, level, status, decision, sla_due_at, started_at, completed_at, checklist_results, soc_version, assigned_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: review_comments; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.review_comments (id, review_id, author_id, parent_id, body, mentions, is_resolved, resolved_by, soc_version, created_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: reviewer_checklist; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.reviewer_checklist (id, item_code, evidence_item, control_id, control_name, mandatory_advisory, l1_check, l2_check, l3_check, soc_version, created_at, updated_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: sufficiency_evaluations; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.sufficiency_evaluations (id, submission_id, dimension_code, score, rationale, source, evaluated_by, soc_version, evaluated_at, cscf_version) FROM stdin;
\.


--
-- Data for Name: sufficiency_scores; Type: TABLE DATA; Schema: soc2; Owner: postgres
--

COPY soc2.sufficiency_scores (id, cycle_id, control_id, overall_score, status, last_evaluated_at, soc_version, updated_at, cscf_version) FROM stdin;
\.


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: soc2; Owner: postgres
--

SELECT pg_catalog.setval('soc2.audit_log_id_seq', 1, false);


--
-- Name: approval_gates approval_gates_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.approval_gates
    ADD CONSTRAINT approval_gates_pkey PRIMARY KEY (id);


--
-- Name: architecture_details architecture_details_architecture_code_key; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.architecture_details
    ADD CONSTRAINT architecture_details_architecture_code_key UNIQUE (architecture_code);


--
-- Name: architecture_details architecture_details_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.architecture_details
    ADD CONSTRAINT architecture_details_pkey PRIMARY KEY (id);


--
-- Name: assessment_reports assessment_reports_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.assessment_reports
    ADD CONSTRAINT assessment_reports_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: evidence_based_questions audit_questions_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_based_questions
    ADD CONSTRAINT audit_questions_pkey PRIMARY KEY (id);


--
-- Name: canonical_evidence_items canonical_evidence_items_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.canonical_evidence_items
    ADD CONSTRAINT canonical_evidence_items_pkey PRIMARY KEY (id);


--
-- Name: control_applicability control_applicability_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.control_applicability
    ADD CONSTRAINT control_applicability_pkey PRIMARY KEY (id);


--
-- Name: controls controls_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.controls
    ADD CONSTRAINT controls_pkey PRIMARY KEY (id);


--
-- Name: evidence_attachments evidence_attachments_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_attachments
    ADD CONSTRAINT evidence_attachments_pkey PRIMARY KEY (id);


--
-- Name: evidence_domains evidence_domains_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_domains
    ADD CONSTRAINT evidence_domains_pkey PRIMARY KEY (id);


--
-- Name: evidence_submission_history evidence_submission_history_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submission_history
    ADD CONSTRAINT evidence_submission_history_pkey PRIMARY KEY (id);


--
-- Name: evidence_submissions evidence_submissions_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submissions
    ADD CONSTRAINT evidence_submissions_pkey PRIMARY KEY (id);


--
-- Name: evidence_sufficiency_matrix evidence_sufficiency_matrix_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_sufficiency_matrix
    ADD CONSTRAINT evidence_sufficiency_matrix_pkey PRIMARY KEY (item_code, control_id);


--
-- Name: item_control_mappings item_control_mappings_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.item_control_mappings
    ADD CONSTRAINT item_control_mappings_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: review_assignments review_assignments_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_assignments
    ADD CONSTRAINT review_assignments_pkey PRIMARY KEY (id);


--
-- Name: review_comments review_comments_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_comments
    ADD CONSTRAINT review_comments_pkey PRIMARY KEY (id);


--
-- Name: reviewer_checklist reviewer_checklist_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.reviewer_checklist
    ADD CONSTRAINT reviewer_checklist_pkey PRIMARY KEY (id);


--
-- Name: sufficiency_evaluations sufficiency_evaluations_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_evaluations
    ADD CONSTRAINT sufficiency_evaluations_pkey PRIMARY KEY (id);


--
-- Name: sufficiency_scores sufficiency_scores_pkey; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_scores
    ADD CONSTRAINT sufficiency_scores_pkey PRIMARY KEY (id);


--
-- Name: control_applicability uq_soc2_cycle_control; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.control_applicability
    ADD CONSTRAINT uq_soc2_cycle_control UNIQUE (cycle_id, control_id);


--
-- Name: approval_gates uq_soc2_gate_cycle; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.approval_gates
    ADD CONSTRAINT uq_soc2_gate_cycle UNIQUE (cycle_id, gate);


--
-- Name: item_control_mappings uq_soc2_item_control; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.item_control_mappings
    ADD CONSTRAINT uq_soc2_item_control UNIQUE (evidence_item_id, control_id);


--
-- Name: sufficiency_scores uq_soc2_suf_cycle_control; Type: CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_scores
    ADD CONSTRAINT uq_soc2_suf_cycle_control UNIQUE (cycle_id, control_id);


--
-- Name: idx_soc2_ag_cycle; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ag_cycle ON soc2.approval_gates USING btree (cycle_id);


--
-- Name: idx_soc2_al_action; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_al_action ON soc2.audit_log USING btree (action);


--
-- Name: idx_soc2_al_created; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_al_created ON soc2.audit_log USING btree (created_at);


--
-- Name: idx_soc2_al_tenant; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_al_tenant ON soc2.audit_log USING btree (tenant_id);


--
-- Name: idx_soc2_al_user; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_al_user ON soc2.audit_log USING btree (user_id);


--
-- Name: idx_soc2_ar_cycle; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ar_cycle ON soc2.assessment_reports USING btree (cycle_id);


--
-- Name: idx_soc2_arch_category; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_arch_category ON soc2.architecture_details USING btree (category);


--
-- Name: idx_soc2_arch_controls_gin; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_arch_controls_gin ON soc2.architecture_details USING gin (controls_available);


--
-- Name: idx_soc2_arch_mandatory_gin; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_arch_mandatory_gin ON soc2.architecture_details USING gin (mandatory_controls);


--
-- Name: idx_soc2_arch_soc_version; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_arch_soc_version ON soc2.architecture_details USING btree (soc_version);


--
-- Name: idx_soc2_arch_sort; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_arch_sort ON soc2.architecture_details USING btree (sort_order);


--
-- Name: idx_soc2_ca_cycle; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ca_cycle ON soc2.control_applicability USING btree (cycle_id);


--
-- Name: idx_soc2_cei_domain; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_cei_domain ON soc2.canonical_evidence_items USING btree (domain_id);


--
-- Name: idx_soc2_ea_submission; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ea_submission ON soc2.evidence_attachments USING btree (submission_id);


--
-- Name: idx_soc2_ebq_control; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ebq_control ON soc2.evidence_based_questions USING btree (control_id);


--
-- Name: idx_soc2_ebq_framework; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ebq_framework ON soc2.evidence_based_questions USING btree (framework, framework_version);


--
-- Name: idx_soc2_ebq_item; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ebq_item ON soc2.evidence_based_questions USING btree (evidence_item_id);


--
-- Name: idx_soc2_ebq_item_control; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ebq_item_control ON soc2.evidence_based_questions USING btree (evidence_item_id, control_id);


--
-- Name: idx_soc2_ebq_type; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ebq_type ON soc2.evidence_based_questions USING btree (question_type);


--
-- Name: idx_soc2_ebq_unique; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE UNIQUE INDEX idx_soc2_ebq_unique ON soc2.evidence_based_questions USING btree (framework, framework_version, evidence_item_id, COALESCE(control_id, ''::character varying), question_key);


--
-- Name: idx_soc2_es_cycle; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_es_cycle ON soc2.evidence_submissions USING btree (cycle_id);


--
-- Name: idx_soc2_es_item; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_es_item ON soc2.evidence_submissions USING btree (evidence_item_id);


--
-- Name: idx_soc2_es_status; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_es_status ON soc2.evidence_submissions USING btree (status);


--
-- Name: idx_soc2_es_tenant; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_es_tenant ON soc2.evidence_submissions USING btree (tenant_id);


--
-- Name: idx_soc2_esh_changed_at; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_esh_changed_at ON soc2.evidence_submission_history USING btree (changed_at);


--
-- Name: idx_soc2_esh_submission; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_esh_submission ON soc2.evidence_submission_history USING btree (submission_id);


--
-- Name: idx_soc2_esm_control; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_esm_control ON soc2.evidence_sufficiency_matrix USING btree (control_id);


--
-- Name: idx_soc2_esm_item; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_esm_item ON soc2.evidence_sufficiency_matrix USING btree (item_code);


--
-- Name: idx_soc2_icm_control; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_icm_control ON soc2.item_control_mappings USING btree (control_id);


--
-- Name: idx_soc2_icm_item; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_icm_item ON soc2.item_control_mappings USING btree (evidence_item_id);


--
-- Name: idx_soc2_notes_created; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_notes_created ON soc2.notes USING btree (resource_type, resource_id, created_at);


--
-- Name: idx_soc2_notes_resource; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_notes_resource ON soc2.notes USING btree (resource_type, resource_id);


--
-- Name: idx_soc2_notif_user_created; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_notif_user_created ON soc2.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_soc2_notif_user_unread; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_notif_user_unread ON soc2.notifications USING btree (user_id) WHERE (read_at IS NULL);


--
-- Name: idx_soc2_ra_reviewer; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ra_reviewer ON soc2.review_assignments USING btree (reviewer_id);


--
-- Name: idx_soc2_ra_status; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ra_status ON soc2.review_assignments USING btree (status);


--
-- Name: idx_soc2_ra_submission; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ra_submission ON soc2.review_assignments USING btree (submission_id);


--
-- Name: idx_soc2_rc_control; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_rc_control ON soc2.reviewer_checklist USING btree (control_id);


--
-- Name: idx_soc2_rc_item; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_rc_item ON soc2.reviewer_checklist USING btree (item_code);


--
-- Name: idx_soc2_rc_item_control; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_rc_item_control ON soc2.reviewer_checklist USING btree (item_code, control_id);


--
-- Name: idx_soc2_rc_review; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_rc_review ON soc2.review_comments USING btree (review_id);


--
-- Name: idx_soc2_se_submission; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_se_submission ON soc2.sufficiency_evaluations USING btree (submission_id);


--
-- Name: idx_soc2_ss_cycle; Type: INDEX; Schema: soc2; Owner: postgres
--

CREATE INDEX idx_soc2_ss_cycle ON soc2.sufficiency_scores USING btree (cycle_id);


--
-- Name: approval_gates approval_gates_approved_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.approval_gates
    ADD CONSTRAINT approval_gates_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES core.users(id);


--
-- Name: approval_gates approval_gates_cycle_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.approval_gates
    ADD CONSTRAINT approval_gates_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES core.assessment_cycles(id) ON DELETE CASCADE;


--
-- Name: assessment_reports assessment_reports_cycle_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.assessment_reports
    ADD CONSTRAINT assessment_reports_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES core.assessment_cycles(id) ON DELETE CASCADE;


--
-- Name: assessment_reports assessment_reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.assessment_reports
    ADD CONSTRAINT assessment_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES core.users(id);


--
-- Name: audit_log audit_log_tenant_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.audit_log
    ADD CONSTRAINT audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(id);


--
-- Name: canonical_evidence_items canonical_evidence_items_domain_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.canonical_evidence_items
    ADD CONSTRAINT canonical_evidence_items_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES soc2.evidence_domains(id);


--
-- Name: control_applicability control_applicability_control_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.control_applicability
    ADD CONSTRAINT control_applicability_control_id_fkey FOREIGN KEY (control_id) REFERENCES soc2.controls(id);


--
-- Name: control_applicability control_applicability_cycle_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.control_applicability
    ADD CONSTRAINT control_applicability_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES core.assessment_cycles(id) ON DELETE CASCADE;


--
-- Name: evidence_attachments evidence_attachments_submission_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_attachments
    ADD CONSTRAINT evidence_attachments_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE;


--
-- Name: evidence_attachments evidence_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_attachments
    ADD CONSTRAINT evidence_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES core.users(id);


--
-- Name: evidence_submission_history evidence_submission_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submission_history
    ADD CONSTRAINT evidence_submission_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES core.users(id);


--
-- Name: evidence_submission_history evidence_submission_history_submission_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submission_history
    ADD CONSTRAINT evidence_submission_history_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE;


--
-- Name: evidence_submissions evidence_submissions_cycle_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submissions
    ADD CONSTRAINT evidence_submissions_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES core.assessment_cycles(id) ON DELETE CASCADE;


--
-- Name: evidence_submissions evidence_submissions_evidence_item_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submissions
    ADD CONSTRAINT evidence_submissions_evidence_item_id_fkey FOREIGN KEY (evidence_item_id) REFERENCES soc2.canonical_evidence_items(id);


--
-- Name: evidence_submissions evidence_submissions_submitted_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submissions
    ADD CONSTRAINT evidence_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES core.users(id);


--
-- Name: evidence_submissions evidence_submissions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_submissions
    ADD CONSTRAINT evidence_submissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: evidence_sufficiency_matrix evidence_sufficiency_matrix_control_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_sufficiency_matrix
    ADD CONSTRAINT evidence_sufficiency_matrix_control_id_fkey FOREIGN KEY (control_id) REFERENCES soc2.controls(id);


--
-- Name: evidence_sufficiency_matrix evidence_sufficiency_matrix_item_code_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.evidence_sufficiency_matrix
    ADD CONSTRAINT evidence_sufficiency_matrix_item_code_fkey FOREIGN KEY (item_code) REFERENCES soc2.canonical_evidence_items(id);


--
-- Name: item_control_mappings item_control_mappings_control_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.item_control_mappings
    ADD CONSTRAINT item_control_mappings_control_id_fkey FOREIGN KEY (control_id) REFERENCES soc2.controls(id);


--
-- Name: item_control_mappings item_control_mappings_evidence_item_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.item_control_mappings
    ADD CONSTRAINT item_control_mappings_evidence_item_id_fkey FOREIGN KEY (evidence_item_id) REFERENCES soc2.canonical_evidence_items(id);


--
-- Name: notes notes_author_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notes
    ADD CONSTRAINT notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES core.users(id);


--
-- Name: notes notes_parent_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notes
    ADD CONSTRAINT notes_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES soc2.notes(id) ON DELETE CASCADE;


--
-- Name: notes notes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notes
    ADD CONSTRAINT notes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notifications
    ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES core.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: review_assignments review_assignments_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_assignments
    ADD CONSTRAINT review_assignments_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES core.users(id);


--
-- Name: review_assignments review_assignments_submission_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_assignments
    ADD CONSTRAINT review_assignments_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE;


--
-- Name: review_comments review_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_comments
    ADD CONSTRAINT review_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES core.users(id);


--
-- Name: review_comments review_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_comments
    ADD CONSTRAINT review_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES soc2.review_comments(id);


--
-- Name: review_comments review_comments_resolved_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_comments
    ADD CONSTRAINT review_comments_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES core.users(id);


--
-- Name: review_comments review_comments_review_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.review_comments
    ADD CONSTRAINT review_comments_review_id_fkey FOREIGN KEY (review_id) REFERENCES soc2.review_assignments(id) ON DELETE CASCADE;


--
-- Name: sufficiency_evaluations sufficiency_evaluations_evaluated_by_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_evaluations
    ADD CONSTRAINT sufficiency_evaluations_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES core.users(id);


--
-- Name: sufficiency_evaluations sufficiency_evaluations_submission_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_evaluations
    ADD CONSTRAINT sufficiency_evaluations_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES soc2.evidence_submissions(id) ON DELETE CASCADE;


--
-- Name: sufficiency_scores sufficiency_scores_control_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_scores
    ADD CONSTRAINT sufficiency_scores_control_id_fkey FOREIGN KEY (control_id) REFERENCES soc2.controls(id);


--
-- Name: sufficiency_scores sufficiency_scores_cycle_id_fkey; Type: FK CONSTRAINT; Schema: soc2; Owner: postgres
--

ALTER TABLE ONLY soc2.sufficiency_scores
    ADD CONSTRAINT sufficiency_scores_cycle_id_fkey FOREIGN KEY (cycle_id) REFERENCES core.assessment_cycles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fIGu4WhyLZiUjQSnkcoW8tZn8tnWcKZqssze0PkLnOFGu5oRglbncutJlO3nRBI

