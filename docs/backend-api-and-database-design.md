# SWIFT Compliance Platform — Backend API & Database Design

> **Version:** 1.0  
> **Date:** February 2026  
> **Scope:** Full backend specification derived from the Next.js frontend codebase.  
> **Stack recommendation:** Node.js / NestJS (or Express) + PostgreSQL + Prisma ORM + JWT auth

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Application Workflow](#3-application-workflow)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [File Storage](#7-file-storage)
8. [AI Integration Points](#8-ai-integration-points)
9. [Appendix: Control & Evidence Reference Data](#9-appendix-control--evidence-reference-data)

---

## 1. System Overview

The SWIFT Compliance Platform is a multi-tenant SaaS application that helps banks manage their SWIFT Customer Security Control Framework (CSCF) v2025 compliance assessments.

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Tenant** | A bank onboarded by a platform admin. All data is tenant-scoped. |
| **Architecture Type** | One of A1, A2, A3, A4, B — determines which CSCF controls and evidence items are in scope. |
| **Assessment Cycle** | A yearly cycle (e.g. "2025") during which all evidence is collected and reviewed. |
| **Domain** | One of 8 evidence collection areas (A–H): Network, Hardening, Access, Vulnerability, Monitoring, Third-Party, Physical, Governance. |
| **Evidence Item** | A specific piece of evidence to collect (e.g. "A1 — Network Architecture Diagram"). 53 items across 8 domains. |
| **Control** | One of 32 CSCF controls (25 mandatory + 7 advisory). Each evidence item maps to 1–32 controls. |
| **Evidence Submission** | An actual file/data uploaded for an evidence item. Goes through a review and approval workflow. |
| **Review** | L1/L2 internal review or L3 external assessment of an evidence submission. |
| **Approval** | Senior sign-off (CISO / Head of Compliance) for the full assessment. |
| **Report** | Generated assessment report with sections, AI drafts, and manual edits. |

### Data Flow

```
Platform Admin
  └─ Onboards Tenant (bank details, bank admins)
       └─ Bank Admin / Compliance Officer
            └─ Selects Architecture Type (A1–B)
                 └─ System scopes controls + evidence items
                      └─ IT SMEs upload evidence per domain/item
                           └─ Internal Reviewers review (L1/L2)
                                └─ External Assessor reviews (L3)
                                     └─ Approver signs off (CISO)
                                          └─ Report generated + exported
```

---

## 2. User Roles & Permissions

### Role Definitions

| Role | Code | Description |
|------|------|-------------|
| Platform Administrator | `admin` | Manages tenants, onboards banks, assigns bank admins. Cross-tenant access. |
| Compliance Officer | `compliance_officer` | Creates evidence requests, manages collection, oversees assessment within their tenant. |
| IT Subject Matter Expert | `it_sme` | Uploads evidence, fills in forms. Scoped to assigned domains/items within their tenant. |
| Internal Reviewer | `internal_reviewer` | L1/L2 reviewer. Reviews evidence submissions, approves or returns them. |
| External Assessor | `external_assessor` | L3 independent assessor. Read-only review access + assessment comments. |
| Approver | `approver` | Senior sign-off authority (CISO, Head of Compliance). Final attestation. |

### Permission Matrix

| Resource | admin | compliance_officer | it_sme | internal_reviewer | external_assessor | approver |
|----------|-------|--------------------|--------|-------------------|--------------------|----------|
| Tenants | CRUD | Read (own) | Read (own) | Read (own) | Read (own) | Read (own) |
| Users / Bank Admins | CRUD | Read (own tenant) | — | — | — | — |
| Architecture Selection | — | CRUD | Read | Read | Read | Read |
| Evidence Submissions | — | CRUD | Create/Update (own) | Read | Read | Read |
| Reviews | — | Read | Read (own) | CRUD | Create (comments) | Read |
| Approval / Attestation | — | Read | — | — | Read | CRUD |
| Report | — | CRUD | Read | Read | Read | Read/Export |
| File Uploads | — | Upload | Upload | Read | Read | Read |

---

## 3. Application Workflow

### 3.1 Onboarding Flow

```
1. Platform Admin logs in
2. Admin creates a new Tenant:
   - Bank name, slug, details
   - Assigns one or more Bank Admins (email + name)
3. Bank Admin receives invite, signs up with role "compliance_officer"
4. Bank Admin selects Architecture Type (A1, A2, A3, A4, or B)
5. System scopes the assessment:
   - Filters controls to mandatory + advisory for that architecture
   - Filters evidence items to applicable domains
   - Creates an Assessment Cycle record
```

### 3.2 Evidence Collection Flow

```
1. Compliance Officer sees Dashboard:
   - Domain cards with completion percentages
   - Control sufficiency heatmap
   - AI suggestions for next steps
2. CO navigates to a Domain (e.g. Domain A — Network & Architecture)
3. CO selects an Evidence Item (e.g. A1 — Network Architecture Diagram)
4. IT SME uploads evidence:
   - File uploads (PDF, PNG, XLSX, config exports)
   - Form fields (text, select, checkbox, date, textarea)
   - Per-system / per-zone / per-quarter scoped inputs
5. System evaluates sufficiency:
   - Per-dimension sufficiency scoring
   - Per-control sufficiency scoring
   - Overall item completion percentage
6. Submission is saved with status "draft" or "submitted"
```

### 3.3 Review Flow

```
1. Evidence submission enters Review Queue with status "pending"
2. Internal Reviewer (L1/L2) picks up the item:
   - Views document + AI summary
   - Checks control mappings with relevance scores
   - Adds comments
   - Action: Approve → status "approved"
   - Action: Return → status "returned" (with reason)
3. If returned, IT SME revises and resubmits
4. External Assessor (L3) reviews approved items:
   - Adds independent assessment comments
   - Confirms or challenges findings
```

### 3.4 Approval & Attestation Flow

```
1. Approver sees Approval page:
   - Overall compliance score (% of mandatory controls at >=90%)
   - Control compliance matrix with per-control scores
   - Open gaps list with remediation/risk-accept options
   - Sign-off checklist (all mandatory reviewed, all evidence approved, etc.)
2. Approver addresses gaps:
   - Add remediation plan (with target date)
   - Accept risk (with justification)
3. When all prerequisites met:
   - Approver clicks "Sign & Attest" (MFA required)
   - Creates an attestation record with digital signature
```

### 3.5 Report Generation Flow

```
1. Report has 7 sections:
   - Executive Summary (AI draft)
   - Scope Statement
   - Methodology
   - Control Assessments (AI draft per control)
   - Gap Analysis (AI draft)
   - Evidence Index
   - Glossary
2. AI generates draft content based on collected evidence
3. Compliance Officer reviews and edits each section
4. Export to PDF, Word, or XML
```

---

## 4. Database Schema

### 4.1 Entity-Relationship Overview

```
tenants ──< users
tenants ──< assessments
assessments ──< assessment_architecture (1:1)
assessments ──< evidence_submissions
assessments ──< control_scores
assessments ──< report_sections
assessments ──< attestations

evidence_submissions ──< evidence_files
evidence_submissions ──< evidence_form_data
evidence_submissions ──< reviews
reviews ──< review_comments

tenants ──< swift_systems
tenants ──< swift_zones
tenants ──< vendors

(Reference tables: ref_controls, ref_evidence_items, ref_domains, ref_architectures)
```

### 4.2 Table Definitions

#### `tenants`

Multi-tenant root table. Each row is an onboarded bank.

```sql
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active       BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX idx_tenants_slug ON tenants(slug);
```

---

#### `users`

All platform users. Tenant-scoped except for role='admin'.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(30) NOT NULL CHECK (role IN (
                        'admin', 'compliance_officer', 'it_sme',
                        'internal_reviewer', 'external_assessor', 'approver'
                    )),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

---

#### `assessments`

One assessment per tenant per cycle year.

```sql
CREATE TABLE assessments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cycle_year          INTEGER NOT NULL,  -- e.g. 2025
    architecture_id     VARCHAR(5) NOT NULL CHECK (architecture_id IN ('A1','A2','A3','A4','B')),
    status              VARCHAR(30) NOT NULL DEFAULT 'in_progress' CHECK (status IN (
                            'not_started', 'in_progress', 'under_review', 'attested', 'archived'
                        )),
    overall_score       DECIMAL(5,2),  -- computed, cached
    mandatory_score     DECIMAL(5,2),
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (tenant_id, cycle_year)
);

CREATE INDEX idx_assessments_tenant ON assessments(tenant_id);
```

---

#### `assessment_controls`

Per-assessment, per-control applicability and score. Pre-populated when architecture is selected.

```sql
CREATE TABLE assessment_controls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    control_id          VARCHAR(10) NOT NULL,    -- e.g. '1.1', '2.4A'
    control_name        VARCHAR(255) NOT NULL,
    control_type        CHAR(1) NOT NULL CHECK (control_type IN ('M', 'A')),
    applicability       VARCHAR(15) NOT NULL CHECK (applicability IN ('mandatory', 'advisory', 'n/a')),
    objective           INTEGER NOT NULL,         -- 1, 2, or 3
    score               DECIMAL(5,2) DEFAULT 0,  -- 0–100, computed from evidence
    status              VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN (
                            'not_started', 'partial', 'review', 'approved', 'gap'
                        )),
    evidence_count      INTEGER NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (assessment_id, control_id)
);

CREATE INDEX idx_ac_assessment ON assessment_controls(assessment_id);
```

---

#### `ref_domains`

Static reference table — 8 CSCF evidence domains.

```sql
CREATE TABLE ref_domains (
    id              CHAR(1) PRIMARY KEY,  -- 'A'..'H'
    name            VARCHAR(255) NOT NULL,
    color           VARCHAR(10),
    accent_color    VARCHAR(10),
    sort_order      INTEGER NOT NULL
);

-- Seed data:
-- A | Network & Architecture
-- B | System Hardening & Config
-- C | Access Management
-- D | Vulnerability & Patch Mgmt
-- E | Monitoring & Detection
-- F | Third-Party & Outsourcing
-- G | Physical Security
-- H | Policies & Governance
```

---

#### `ref_evidence_items`

Static reference table — 53 canonical evidence items.

```sql
CREATE TABLE ref_evidence_items (
    id                  VARCHAR(5) PRIMARY KEY,    -- e.g. 'A1', 'B7', 'H9'
    domain_id           CHAR(1) NOT NULL REFERENCES ref_domains(id),
    sort_order          INTEGER NOT NULL,
    name                VARCHAR(255) NOT NULL,
    priority            VARCHAR(10) NOT NULL CHECK (priority IN ('CRITICAL','HIGH','HIGH*','MEDIUM')),
    evidence_type       VARCHAR(100) NOT NULL,     -- 'Diagram + Text', 'Config Export', etc.
    description         TEXT NOT NULL,
    reduction_note      TEXT,
    control_count       INTEGER NOT NULL,
    per_system          BOOLEAN NOT NULL DEFAULT false,
    per_zone            BOOLEAN NOT NULL DEFAULT false,
    per_quarter         BOOLEAN NOT NULL DEFAULT false,
    per_access_point    BOOLEAN NOT NULL DEFAULT false,
    is_advisory         BOOLEAN NOT NULL DEFAULT false,
    is_conditional      BOOLEAN NOT NULL DEFAULT false,
    conditional_note    TEXT
);

CREATE INDEX idx_rei_domain ON ref_evidence_items(domain_id);
```

---

#### `ref_evidence_item_controls`

Many-to-many: evidence items × controls they satisfy.

```sql
CREATE TABLE ref_evidence_item_controls (
    evidence_item_id    VARCHAR(5) NOT NULL REFERENCES ref_evidence_items(id),
    control_id          VARCHAR(10) NOT NULL,
    control_name        VARCHAR(255) NOT NULL,
    applicability       VARCHAR(5) NOT NULL CHECK (applicability IN ('M', 'A', 'M+A')),

    PRIMARY KEY (evidence_item_id, control_id)
);
```

---

#### `ref_evidence_inputs`

Input field definitions per evidence item (form schema).

```sql
CREATE TABLE ref_evidence_inputs (
    id                  VARCHAR(50) PRIMARY KEY,
    evidence_item_id    VARCHAR(5) NOT NULL REFERENCES ref_evidence_items(id),
    label               VARCHAR(255) NOT NULL,
    input_type          VARCHAR(20) NOT NULL CHECK (input_type IN (
                            'file', 'checkbox', 'select', 'text', 'textarea', 'date'
                        )),
    is_required         BOOLEAN NOT NULL DEFAULT false,
    accept              VARCHAR(100),     -- for file inputs: '.pdf,.png,.xlsx'
    placeholder         VARCHAR(255),
    options             JSONB,            -- for select: ["option1","option2"]
    min_length          INTEGER,
    scope               VARCHAR(20) DEFAULT 'global' CHECK (scope IN (
                            'global', 'per-system', 'per-zone', 'per-quarter'
                        )),
    sort_order          INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_rei_inputs_item ON ref_evidence_inputs(evidence_item_id);
```

---

#### `ref_sufficiency_dimensions`

Sufficiency evaluation dimensions per evidence item.

```sql
CREATE TABLE ref_sufficiency_dimensions (
    id                  SERIAL PRIMARY KEY,
    evidence_item_id    VARCHAR(5) NOT NULL REFERENCES ref_evidence_items(id),
    dimension_code      VARCHAR(30) NOT NULL,
    label               VARCHAR(255) NOT NULL,
    rationale           TEXT NOT NULL,
    control_ref         VARCHAR(10),
    sort_order          INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_rsd_item ON ref_sufficiency_dimensions(evidence_item_id);
```

---

#### `evidence_submissions`

Actual evidence collected per assessment per evidence item.

```sql
CREATE TABLE evidence_submissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    evidence_item_id    VARCHAR(5) NOT NULL REFERENCES ref_evidence_items(id),
    submitted_by        UUID NOT NULL REFERENCES users(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
                            'draft', 'submitted', 'pending_review', 'in_review',
                            'approved', 'returned', 'archived'
                        )),
    completion_pct      DECIMAL(5,2) DEFAULT 0,
    version             INTEGER NOT NULL DEFAULT 1,
    submitted_at        TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Per-system / per-zone scoping
    swift_system_id     UUID,        -- NULL if not per-system
    swift_zone_id       VARCHAR(30), -- NULL if not per-zone
    quarter             VARCHAR(10), -- NULL if not per-quarter, e.g. 'Q1 2025'
    vendor_id           UUID,        -- NULL if not per-vendor

    UNIQUE (assessment_id, evidence_item_id, version, swift_system_id, swift_zone_id, quarter, vendor_id)
);

CREATE INDEX idx_es_assessment ON evidence_submissions(assessment_id);
CREATE INDEX idx_es_item ON evidence_submissions(evidence_item_id);
CREATE INDEX idx_es_status ON evidence_submissions(status);
CREATE INDEX idx_es_submitter ON evidence_submissions(submitted_by);
```

---

#### `evidence_files`

Files attached to evidence submissions.

```sql
CREATE TABLE evidence_files (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id       UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    input_id            VARCHAR(50),  -- refs ref_evidence_inputs.id, NULL for ad-hoc uploads
    file_name           VARCHAR(500) NOT NULL,
    file_type           VARCHAR(100) NOT NULL,
    file_size_bytes     BIGINT NOT NULL,
    storage_path        VARCHAR(1000) NOT NULL,  -- S3 key or local path
    uploaded_by         UUID NOT NULL REFERENCES users(id),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    ai_summary          TEXT,          -- AI-generated summary
    ai_confidence       DECIMAL(5,2)   -- AI confidence score (0–100)
);

CREATE INDEX idx_ef_submission ON evidence_files(submission_id);
```

---

#### `evidence_form_data`

Key-value form field data per submission.

```sql
CREATE TABLE evidence_form_data (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id       UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    input_id            VARCHAR(50) NOT NULL,  -- refs ref_evidence_inputs.id
    value               TEXT NOT NULL,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (submission_id, input_id)
);

CREATE INDEX idx_efd_submission ON evidence_form_data(submission_id);
```

---

#### `reviews`

Review records for evidence submissions.

```sql
CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id       UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    reviewer_id         UUID NOT NULL REFERENCES users(id),
    review_level        VARCHAR(5) NOT NULL CHECK (review_level IN ('L1', 'L2', 'L3')),
    decision            VARCHAR(20) CHECK (decision IN ('approved', 'returned', 'pending')),
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_submission ON reviews(submission_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_decision ON reviews(decision);
```

---

#### `review_comments`

Comments on reviews.

```sql
CREATE TABLE review_comments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id           UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    author_id           UUID NOT NULL REFERENCES users(id),
    body                TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rc_review ON review_comments(review_id);
```

---

#### `control_mappings`

AI-generated or manual control-to-file relevance mappings.

```sql
CREATE TABLE control_mappings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id             UUID NOT NULL REFERENCES evidence_files(id) ON DELETE CASCADE,
    control_id          VARCHAR(10) NOT NULL,
    relevance_pct       DECIMAL(5,2),   -- 0–100
    impact              VARCHAR(20),    -- e.g. '+15%'
    is_manual           BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cm_file ON control_mappings(file_id);
```

---

#### `sufficiency_scores`

Per-submission, per-dimension sufficiency evaluation results.

```sql
CREATE TABLE sufficiency_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id       UUID NOT NULL REFERENCES evidence_submissions(id) ON DELETE CASCADE,
    dimension_id        INTEGER NOT NULL REFERENCES ref_sufficiency_dimensions(id),
    score               DECIMAL(5,2) NOT NULL DEFAULT 0,  -- 0–100
    ai_rationale        TEXT,
    evaluated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (submission_id, dimension_id)
);
```

---

#### `attestations`

Senior sign-off records.

```sql
CREATE TABLE attestations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    attester_id         UUID NOT NULL REFERENCES users(id),
    attestation_type    VARCHAR(30) NOT NULL DEFAULT 'full' CHECK (attestation_type IN (
                            'full', 'partial', 'risk_accepted'
                        )),
    mandatory_score     DECIMAL(5,2) NOT NULL,
    mandatory_approved  INTEGER NOT NULL,
    mandatory_total     INTEGER NOT NULL,
    checklist           JSONB NOT NULL,  -- {items: [{label, done}]}
    signature_hash      VARCHAR(500),    -- digital signature / MFA proof
    attested_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address          INET,
    user_agent          TEXT
);

CREATE INDEX idx_att_assessment ON attestations(assessment_id);
```

---

#### `gap_actions`

Gap remediation plans or risk acceptances.

```sql
CREATE TABLE gap_actions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    control_id          VARCHAR(10) NOT NULL,
    action_type         VARCHAR(20) NOT NULL CHECK (action_type IN ('remediation', 'risk_accept')),
    description         TEXT NOT NULL,
    target_date         DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ga_assessment ON gap_actions(assessment_id);
```

---

#### `report_sections`

Per-assessment report content.

```sql
CREATE TABLE report_sections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    sort_order          INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'complete')),
    is_ai_generated     BOOLEAN NOT NULL DEFAULT false,
    content             TEXT,              -- rich text / markdown
    ai_draft            TEXT,              -- original AI draft
    last_edited_by      UUID REFERENCES users(id),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (assessment_id, sort_order)
);

CREATE INDEX idx_rs_assessment ON report_sections(assessment_id);
```

---

#### `swift_systems`

Tenant-specific SWIFT system inventory.

```sql
CREATE TABLE swift_systems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ss_tenant ON swift_systems(tenant_id);
```

---

#### `swift_zones`

Tenant-specific zone definitions.

```sql
CREATE TABLE swift_zones (
    id              VARCHAR(50) NOT NULL,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,

    PRIMARY KEY (id, tenant_id)
);
```

---

#### `vendors`

Third-party vendor registry per tenant.

```sql
CREATE TABLE vendors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    classification      VARCHAR(30) NOT NULL,  -- Critical, High, Medium, Low
    access_description  TEXT,
    swift_components    TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_tenant ON vendors(tenant_id);
```

---

#### `audit_log`

Immutable audit trail for compliance.

```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,  -- e.g. 'evidence.submit', 'review.approve'
    resource_type   VARCHAR(50) NOT NULL,   -- e.g. 'evidence_submission', 'attestation'
    resource_id     UUID,
    metadata        JSONB,                  -- action-specific details
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_al_tenant ON audit_log(tenant_id);
CREATE INDEX idx_al_user ON audit_log(user_id);
CREATE INDEX idx_al_action ON audit_log(action);
CREATE INDEX idx_al_created ON audit_log(created_at);
```

---

## 5. API Endpoints

### Base URL: `/api/v1`

All endpoints require `Authorization: Bearer <token>` except auth endpoints.  
All tenant-scoped endpoints auto-filter by the authenticated user's tenant.

---

### 5.1 Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/auth/signup` | Register new user | `{email, password, name, role, tenantId?}` | `{user, token}` |
| `POST` | `/auth/login` | Log in | `{email, password}` | `{user, token}` |
| `POST` | `/auth/logout` | Log out (invalidate token) | — | `204` |
| `GET` | `/auth/me` | Get current user profile | — | `{user}` |
| `PUT` | `/auth/me` | Update profile | `{name, email}` | `{user}` |
| `POST` | `/auth/change-password` | Change password | `{currentPassword, newPassword}` | `204` |

---

### 5.2 Tenants (Admin Only)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/tenants` | List all tenants | — | `{tenants[]}` |
| `POST` | `/tenants` | Onboard new bank | `{name, slug, details, bankAdmins[{email, name}]}` | `{tenant}` |
| `GET` | `/tenants/:id` | Get tenant details | — | `{tenant}` |
| `PUT` | `/tenants/:id` | Update tenant | `{name, details, isActive}` | `{tenant}` |
| `GET` | `/tenants/:id/admins` | List bank admins | — | `{admins[]}` |
| `PUT` | `/tenants/:id/admins` | Update bank admins | `{admins[{email, name}]}` | `{admins[]}` |

---

### 5.3 Users

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/users` | List users (admin: all; others: own tenant) | `?role=&tenantId=` | `{users[]}` |
| `POST` | `/users` | Create user (admin only) | `{email, name, role, tenantId}` | `{user}` |
| `GET` | `/users/:id` | Get user | — | `{user}` |
| `PUT` | `/users/:id` | Update user | `{name, role, isActive}` | `{user}` |
| `DELETE` | `/users/:id` | Deactivate user | — | `204` |

---

### 5.4 Assessments

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/assessments` | List assessments for tenant | `?cycleYear=&status=` | `{assessments[]}` |
| `POST` | `/assessments` | Create assessment + select architecture | `{cycleYear, architectureId}` | `{assessment}` |
| `GET` | `/assessments/:id` | Get assessment with scores | — | `{assessment, controls[], domainProgress[]}` |
| `PUT` | `/assessments/:id` | Update assessment | `{architectureId, status}` | `{assessment}` |
| `GET` | `/assessments/:id/dashboard` | Dashboard summary | — | `{overallScore, domainScores[], controlScores[], gaps[], suggestions[]}` |

---

### 5.5 Assessment Controls

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/assessments/:id/controls` | List all controls with applicability + scores | — | `{controls[]}` |
| `GET` | `/assessments/:id/controls/:controlId` | Get single control detail | — | `{control, evidenceItems[], score}` |
| `GET` | `/assessments/:id/control-matrix` | Control-to-evidence matrix | — | `{matrix[]}` |

---

### 5.6 Evidence Submissions

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/assessments/:id/evidence` | List all submissions | `?domain=&status=&search=` | `{submissions[]}` |
| `POST` | `/assessments/:id/evidence` | Create submission | `{evidenceItemId, swiftSystemId?, zoneId?, quarter?}` | `{submission}` |
| `GET` | `/assessments/:id/evidence/:subId` | Get submission detail | — | `{submission, files[], formData[], sufficiency[]}` |
| `PUT` | `/assessments/:id/evidence/:subId` | Update submission | `{status}` | `{submission}` |
| `DELETE` | `/assessments/:id/evidence/:subId` | Delete draft submission | — | `204` |

---

### 5.7 Evidence Files

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/evidence/:subId/files` | Upload file | `multipart/form-data: file, inputId?` | `{file}` |
| `GET` | `/evidence/:subId/files` | List files for submission | — | `{files[]}` |
| `GET` | `/evidence/:subId/files/:fileId` | Download file | — | `binary stream` |
| `DELETE` | `/evidence/:subId/files/:fileId` | Delete file | — | `204` |
| `GET` | `/evidence/:subId/files/:fileId/ai-summary` | Get AI summary | — | `{summary, confidence, controlMappings[]}` |

---

### 5.8 Evidence Form Data

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/evidence/:subId/form-data` | Get all form values | — | `{formData[]}` |
| `PUT` | `/evidence/:subId/form-data` | Save form values (batch) | `{fields[{inputId, value}]}` | `{formData[]}` |
| `PATCH` | `/evidence/:subId/form-data/:inputId` | Update single field | `{value}` | `{field}` |

---

### 5.9 Sufficiency Evaluation

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/evidence/:subId/evaluate` | Trigger AI sufficiency evaluation | — | `{scores[], overallScore, controlScores{}}` |
| `GET` | `/evidence/:subId/sufficiency` | Get latest sufficiency scores | — | `{scores[]}` |

---

### 5.10 Reviews

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/assessments/:id/reviews` | List all reviews | `?status=&level=` | `{reviews[]}` |
| `POST` | `/assessments/:id/reviews` | Create / assign review | `{submissionId, reviewerId, level}` | `{review}` |
| `GET` | `/reviews/:reviewId` | Get review detail | — | `{review, comments[]}` |
| `PUT` | `/reviews/:reviewId` | Update decision | `{decision}` (approved/returned) | `{review}` |
| `POST` | `/reviews/:reviewId/comments` | Add comment | `{body}` | `{comment}` |

---

### 5.11 Approval & Attestation

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/assessments/:id/approval` | Get approval status | — | `{score, checklist[], gaps[], canAttest}` |
| `POST` | `/assessments/:id/gap-actions` | Create gap action | `{controlId, actionType, description, targetDate}` | `{gapAction}` |
| `PUT` | `/assessments/:id/gap-actions/:gaId` | Update gap action | `{status, description}` | `{gapAction}` |
| `POST` | `/assessments/:id/attest` | Sign & attest | `{mfaToken, checklist}` | `{attestation}` |
| `GET` | `/assessments/:id/attestations` | List attestations | — | `{attestations[]}` |

---

### 5.12 Report

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/assessments/:id/report` | Get all report sections | — | `{sections[]}` |
| `POST` | `/assessments/:id/report/generate` | Trigger AI report generation | — | `{sections[]}` |
| `GET` | `/assessments/:id/report/:sectionId` | Get section content | — | `{section}` |
| `PUT` | `/assessments/:id/report/:sectionId` | Edit section content | `{content}` | `{section}` |
| `POST` | `/assessments/:id/report/:sectionId/regenerate` | Regenerate AI draft | — | `{section}` |
| `GET` | `/assessments/:id/report/export/:format` | Export report | (format: pdf, docx, xml) | `binary stream` |

---

### 5.13 Reference Data (Read-Only)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/ref/architectures` | List all 5 architecture types | `{architectures[]}` |
| `GET` | `/ref/architectures/:id` | Get architecture with controls | `{architecture, mandatoryControls[], advisoryControls[]}` |
| `GET` | `/ref/domains` | List 8 evidence domains | `{domains[]}` |
| `GET` | `/ref/domains/:id` | Get domain with evidence items | `{domain, evidenceItems[], subGroups[]}` |
| `GET` | `/ref/evidence-items` | List all 53 evidence items | `{items[]}` |
| `GET` | `/ref/evidence-items/:id` | Get item detail with inputs, sufficiency | `{item, inputs[], sufficiency[], controls[]}` |
| `GET` | `/ref/controls` | List all 32 controls | `{controls[]}` |
| `GET` | `/ref/controls/:id` | Get control with mapped evidence items | `{control, evidenceItems[]}` |

---

### 5.14 Tenant Configuration

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/config/swift-systems` | List SWIFT systems | — | `{systems[]}` |
| `POST` | `/config/swift-systems` | Add system | `{name, description}` | `{system}` |
| `PUT` | `/config/swift-systems/:id` | Update system | `{name, description}` | `{system}` |
| `DELETE` | `/config/swift-systems/:id` | Remove system | — | `204` |
| `GET` | `/config/zones` | List zones | — | `{zones[]}` |
| `POST` | `/config/zones` | Add zone | `{id, name, description}` | `{zone}` |
| `GET` | `/config/vendors` | List vendors | — | `{vendors[]}` |
| `POST` | `/config/vendors` | Add vendor | `{name, classification, access, swiftComponents}` | `{vendor}` |
| `PUT` | `/config/vendors/:id` | Update vendor | `{...}` | `{vendor}` |
| `DELETE` | `/config/vendors/:id` | Remove vendor | — | `204` |
| `GET` | `/config/access-points` | List access points | — | `{accessPoints[]}` |

---

### 5.15 Audit Log

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/audit-log` | List audit events | `?action=&userId=&from=&to=&page=&limit=` → `{events[], total}` |

---

## 6. Authentication & Authorization

### 6.1 Auth Flow

```
1. POST /auth/signup or /auth/login
2. Server returns JWT access token + refresh token
3. Client sends: Authorization: Bearer <access_token>
4. Server middleware:
   a. Validates JWT signature + expiry
   b. Extracts userId + tenantId + role from claims
   c. Injects into request context
5. Route guards check: role permissions + tenant scoping
```

### 6.2 JWT Claims

```json
{
  "sub": "user-uuid",
  "email": "user@bank.com",
  "role": "compliance_officer",
  "tenantId": "tenant-uuid",
  "iat": 1740000000,
  "exp": 1740086400
}
```

### 6.3 Middleware Chain

```
Request
  → Auth Middleware (validate JWT, extract user)
  → Tenant Middleware (auto-scope queries to user.tenantId)
  → Role Guard (check role against endpoint permission)
  → Controller
  → Audit Middleware (log action to audit_log)
```

### 6.4 Multi-Tenancy Strategy

- **Row-Level Security:** Every tenant-scoped table has `tenant_id`. All queries auto-filter.
- **Admin bypass:** Platform admins can query across tenants by providing `?tenantId=`.
- **No data leakage:** JOIN queries always include tenant_id predicate.

---

## 7. File Storage

### Strategy

- **Storage backend:** AWS S3 (or Azure Blob / MinIO for on-prem).
- **Key format:** `tenants/{tenantId}/assessments/{assessmentId}/evidence/{submissionId}/{fileId}/{filename}`
- **Upload flow:**
  1. Client calls `POST /evidence/:subId/files` with multipart form.
  2. Server streams to S3, creates `evidence_files` record.
  3. Returns file metadata (id, name, size, upload time).
- **Download flow:**
  1. Client calls `GET /evidence/:subId/files/:fileId`.
  2. Server generates pre-signed S3 URL (5 min TTL) and redirects.
- **Max file size:** 100 MB per file.
- **Allowed types:** PDF, PNG, JPG, XLSX, CSV, DOCX, ZIP, TXT, XML, JSON.

---

## 8. AI Integration Points

| Feature | Trigger | Input | Output |
|---------|---------|-------|--------|
| **Evidence AI Summary** | File upload | Uploaded file content | Summary text + confidence score |
| **Control Mapping** | File upload | File content + control definitions | Control IDs with relevance % |
| **Sufficiency Evaluation** | Manual trigger ("Evaluate") | Submission form data + files | Per-dimension scores + rationale |
| **Report Draft Generation** | Manual trigger ("Generate") | Assessment data + evidence + scores | Section content (markdown) |
| **AI Suggestions** | Dashboard load | Current gaps + scores | Prioritized next-step suggestions |

### AI Pipeline Architecture

```
File Upload → Preprocessing (extract text, OCR if needed)
  → Embedding (chunk + vectorize)
  → Control Mapping (similarity search against control descriptions)
  → Sufficiency Scoring (LLM evaluates against dimension criteria)
  → Store results in DB (control_mappings, sufficiency_scores, evidence_files.ai_summary)
```

---

## 9. Appendix: Control & Evidence Reference Data

### 9.1 Architecture → Control Applicability

| Control | Type | A1 | A2 | A3 | A4 | B |
|---------|------|----|----|----|----|---|
| 1.1 SWIFT Environment Protection | M | M | M | M | M | — |
| 1.2 OS Privileged Account Control | M | M | M | M | M | M |
| 1.3 Virtualisation/Cloud Protection | A | A | A | A | A | — |
| 1.4 Restriction of Internet Access | M | M | M | M | M | — |
| 1.5 Customer Environment Protection | M | M | M | M | M | — |
| 2.1 Internal Data Flow Security | M | M | M | M | M | — |
| 2.2 Security Updates | M | M | M | M | M | M |
| 2.3 System Hardening | M | M | M | M | M | M |
| 2.4A Back Office Data Flow Security | A | A | A | A | A | — |
| 2.5A External Transmission Data Protection | A | A | A | A | A | — |
| 2.6 Operator Session Confidentiality | M | M | M | M | M | M |
| 2.7 Vulnerability Scanning | M | M | M | M | M | — |
| 2.8 Outsourced Critical Activity Protection | M | M | M | M | A | M |
| 2.9 Transaction Business Controls | M | M | M | M | A | M |
| 2.10 Application Hardening | M | M | M | — | — | — |
| 2.11A RMA Business Controls | A | A | A | A | — | A |
| 3.1 Physical Security | M | M | M | M | M | M |
| 4.1 Password Policy | M | M | M | M | M | M |
| 4.2 Multi-Factor Authentication | M | M | M | M | M | M |
| 5.1 Logical Access Control | M | M | M | M | M | M |
| 5.2 Token Management | M | M | M | M | A | M |
| 5.3A Personnel Vetting Process | A | A | A | A | A | A |
| 5.4 Physical & Logical Password Storage | M | M | M | M | M | M |
| 6.1 Malware Protection | M | M | M | M | M | M |
| 6.2 Software Integrity | M | M | M | A | A | — |
| 6.3 Database Integrity | M | M | M | A | A | — |
| 6.4 Logging and Monitoring | M | M | M | M | M | M |
| 6.5A Intrusion Detection | A | A | A | A | A | — |
| 7.1 Cyber Incident Response Planning | M | M | M | M | M | M |
| 7.2 Security Training & Awareness | M | M | M | M | M | M |
| 7.3A Penetration Testing | A | A | A | A | A | A |
| 7.4A Scenario Risk Assessment | A | A | A | A | A | A |

### 9.2 Evidence Domains Summary

| Domain | Name | Items | Key Controls |
|--------|------|-------|--------------|
| A | Network & Architecture | 6 | 1.1, 1.3, 1.4, 1.5, 2.1, 2.4A, 2.5A |
| B | System Hardening & Config | 8 | 1.2, 2.3, 2.6, 2.10, 4.1, 4.2 |
| C | Access Management | 9 | 5.1, 5.2, 5.3A, 5.4 |
| D | Vulnerability & Patch Mgmt | 6 | 2.2, 2.7, 7.3A |
| E | Monitoring & Detection | 7 | 6.1, 6.2, 6.3, 6.4, 6.5A |
| F | Third-Party & Outsourcing | 4 | 2.8 |
| G | Physical Security | 4 | 3.1 |
| H | Policies & Governance | 9 | 2.9, 2.11A, 7.1, 7.2, 7.4A |

### 9.3 Table Count Summary

| Category | Tables | Description |
|----------|--------|-------------|
| Core | 4 | tenants, users, assessments, audit_log |
| Evidence | 5 | evidence_submissions, evidence_files, evidence_form_data, control_mappings, sufficiency_scores |
| Review & Approval | 4 | reviews, review_comments, attestations, gap_actions |
| Report | 1 | report_sections |
| Configuration | 3 | swift_systems, swift_zones, vendors |
| Reference (static) | 5 | ref_domains, ref_evidence_items, ref_evidence_item_controls, ref_evidence_inputs, ref_sufficiency_dimensions |
| Assessment state | 1 | assessment_controls |
| **Total** | **23** | |

---

*End of document.*
