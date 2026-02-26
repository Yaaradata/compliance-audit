# SWIFT Compliance Platform — What It Is and Why It Exists

> **Purpose:** This document describes what the platform is, who it is for, and why it exists. It is based on an end-to-end read of the backend and frontend codebase.  
> **Audience:** Stakeholders, new developers, and anyone needing a high-level understanding.  
> **Related:** For API and database detail, see [Backend API & Database Design](./backend-api-and-database-design.md).

---

## 1. What the platform is

### Product name and one-line purpose

- **Product name:** **YaaraLabs SWIFT Compliance Platform** (API title: *SWIFT Compliance Platform API*).
- **One-line purpose:** A **multi-tenant SaaS** that helps **banks** run **SWIFT Customer Security Control Framework (CSCF) v2025** compliance assessments from evidence collection through review, approval, and reporting.

### Main capabilities

| Capability | Description |
|------------|-------------|
| **Multi-tenant onboarding** | Platform admins onboard banks as tenants and assign bank admins (compliance officers). All data is tenant-scoped. |
| **Architecture-based scoping** | Banks choose an architecture type (A1, A2, A3, A4, or B). The system scopes which of the 32 CSCF controls and 53 evidence items apply. |
| **Assessment cycles** | Yearly cycles (e.g. 2025) per tenant. Users create a cycle, set architecture, then collect evidence and run the full workflow within that cycle. |
| **Domain-based evidence collection** | Eight domains (A–H): Network & Architecture, System Hardening, Access Management, Vulnerability & Patching, Monitoring & Detection, Third-Party & Outsourcing, Physical Security, Policies & Governance. Evidence items and controls are organized by domain. |
| **Evidence upload and forms** | Per evidence item: file uploads (PDF, images, exports) and structured form fields. Support for per-system, per-zone, and per-quarter scoping where applicable. |
| **Sufficiency and AI evaluation** | Evidence is evaluated against *sufficiency definition* (what must be present) and *evaluation criteria* (reviewer checks). AI can summarize evidence, suggest control mappings, and indicate what is missing. |
| **Review workflow** | L1/L2 internal review and L3 external assessor review. Submissions can be approved or returned with comments. |
| **Approval and attestation** | Senior sign-off (e.g. CISO, Head of Compliance). Approval gates (evidence complete, internal review, assessment complete, final attestation), gap actions (remediation or risk acceptance), and audit trail. |
| **Reports** | Assessment report with configurable sections. AI can draft sections; content is editable. Export (e.g. PDF, Word, XML) for submission or audit. |
| **Vendors and reference data** | Third-party/vendor registry per cycle. Read-only reference data: frameworks, domains, evidence items, controls, and dependencies. |
| **Audit and cycle management** | Audit log for key actions. Users can create, update, and delete assessment cycles (deleting a cycle removes all evidence and related data for that cycle). |

---

## 2. Why it exists

### Problem domain

- Banks that use **SWIFT** must comply with the **SWIFT Customer Security Control Framework (CSCF)**.
- Compliance requires: **collecting evidence** for many controls, **reviewing** that evidence (internally and often by an external assessor), **senior sign-off**, and a **formal report**.
- Doing this with spreadsheets, email, and shared drives is error-prone, hard to audit, and does not scale.

### Target users

| Role | Who | Main use of the platform |
|------|-----|---------------------------|
| **Platform administrator** | Operator of the SaaS | Onboard tenants (banks), manage users and bank admins. |
| **Compliance officer** | Bank’s compliance team | Create and manage assessment cycles, drive evidence collection, oversee review and report. |
| **IT SME** | Bank’s IT / security staff | Upload evidence and fill forms for assigned domains/items. |
| **Internal reviewer** | Bank’s internal review function | L1/L2 review of submissions; approve or return with comments. |
| **External assessor** | Independent assessor | L3 review; read evidence and add assessment comments. |
| **Approver** | CISO / Head of Compliance | Sign off on the assessment; handle gap actions and attestation. |

### Value

- **Single place** for evidence, reviews, approvals, and reporting — all tied to a cycle and architecture.
- **Role-based access** and **tenant isolation** so each bank only sees its own data.
- **Structured workflow** from collection → review → approval → report, with clear status and audit trail.
- **AI-assisted** sufficiency checks, summaries, and report drafts to speed up work and highlight gaps.
- **Reference data** (domains, evidence items, controls) aligned with CSCF so the bank follows a consistent, standards-based process.

---

## 3. Core concepts (brief definitions)

| Concept | Definition |
|--------|------------|
| **Tenant** | A bank (or organization) onboarded by the platform. All cycles, evidence, reviews, and reports are scoped to a tenant. |
| **Assessment cycle** | A single compliance assessment run, usually for one year (e.g. 2025). Has a chosen architecture type; contains all evidence submissions, reviews, approvals, and reports for that run. |
| **Architecture type** | One of A1, A2, A3, A4, B. Determines which CSCF controls and evidence items are in scope for the cycle. |
| **Domain** | One of eight evidence areas (A–H). Each domain has a set of evidence items and related controls. |
| **Evidence item** | A canonical type of evidence to collect (e.g. “A1 — Network Architecture Diagram”). 53 items across 8 domains; each can map to one or more controls. |
| **Control** | A CSCF control (32 total: 25 mandatory, 7 advisory). Applicability depends on architecture; evidence items contribute to satisfying controls. |
| **Evidence submission** | The actual upload (files + form data) for an evidence item within a cycle. Status flows: draft → submitted → in review → approved / returned. |
| **Sufficiency** | Whether the evidence contains what is required (sufficiency definition) and meets evaluation criteria. Scored per dimension and per control; AI can evaluate and explain gaps. |
| **Review** | L1/L2/L3 review of a submission: approve, return, or add comments. |
| **Approval / attestation** | Senior sign-off on the assessment; may include gap actions (remediation or risk acceptance) and digital attestation. |
| **Report** | The assessment report: sections (e.g. executive summary, control assessments, gap analysis). Content can be AI-drafted and manually edited; export for submission or audit. |

---

## 4. User flows (high level)

1. **Login**  
   User signs in → receives JWT → frontend stores token and keeps user/role/tenant/active cycle in auth context. Unauthenticated users are redirected to login; platform admins can be directed to admin.

2. **Create or choose a cycle**  
   From “Your Assessment Cycles” the user creates a new cycle (label, year) or opens an existing one. If the cycle has no architecture yet, they are sent to **Select Architecture** (A1–B). Backend scopes controls and evidence for that architecture.

3. **Collect evidence**  
   User opens a **cycle → domain → evidence item**. They upload files and fill form fields; they can run **Evaluate evidence** to see sufficiency and evaluation results (and AI feedback on what’s missing). Submissions move from draft to submitted as needed.

4. **Review**  
   Reviewers open the **Review** queue, see submissions, and approve or return with comments. L3 assessor adds assessment-level comments where applicable.

5. **Approval**  
   Approver opens the **Approval** view, sees compliance state and gaps, adds gap actions (remediation or risk acceptance), and completes sign-off/attestation when the checklist is satisfied.

6. **Report**  
   User opens **Report**, generates or refreshes AI drafts for sections, edits content, and exports (e.g. PDF/Word) for submission or audit.

7. **Cycle management**  
   From “Your Assessment Cycles,” the user can **delete** a cycle. Deletion removes that cycle and all its evidence, reviews, approvals, and related data; the API and DB handle cascading deletes.

---

## 5. Technology stack

| Layer | Technology |
|--------|------------|
| **Backend** | **FastAPI**; **PostgreSQL** (SQLAlchemy 2.x); JWT auth (e.g. python-jose, HS256); bcrypt for passwords; Pydantic/settings; optional **Vertex AI (Gemini)** for AI features; CORS for frontend. |
| **Frontend** | **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4**. Auth and active cycle/architecture stored in context and localStorage; routes under `/cycles/[cycleId]/...` for cycle-scoped flows. |
| **Auth** | POST `/api/v1/auth/login` and `/auth/signup`; JWT with subject, email, role, tenant id; `Authorization: Bearer <token>`; tenant-scoped queries and role-based access across routers. |

---

## 6. Key API areas (backend)

All under prefix **`/api/v1`**:

| Area | Router | Purpose |
|------|--------|---------|
| **Auth** | `auth` | Signup, login, me, change-password; JWT creation and validation. |
| **Tenants** | `tenants` | Tenant CRUD (platform admin); tenant isolation. |
| **Users** | `users` | User CRUD; tenant and role management. |
| **Assessments** | `assessments` | List/create/get/update/**delete** cycles; dashboard; advance phase. |
| **Reference** | `reference` | Frameworks, domains, evidence items, controls (read-only). |
| **Evidence** | `evidence` | List/create/get/update/delete submissions; evaluate evidence (sufficiency + criteria). |
| **Files** | `files` | Upload/list/download/delete evidence files. |
| **Controls** | `controls` | Control applicability and control matrix per cycle. |
| **Sufficiency** | `sufficiency` | Sufficiency evaluation and scores. |
| **Reviews** | `reviews` | Review assignments and comments. |
| **Approval** | `approval` | Approval gates, gap actions, attestation. |
| **Reports** | `reports` | Report sections, generate, edit, export. |
| **Vendors** | `vendors` | Vendor registry per cycle. |
| **Audit log** | `audit_log` | Read audit trail. |

---

## 7. Frontend structure (main areas)

- **`/login`** — Sign in / sign up.
- **`/assessments/new`** — Your Assessment Cycles: create cycle, open cycle, delete cycle, switch cycle.
- **`/select-architecture`** — Choose architecture (A1–B) for a new or existing cycle.
- **`/cycles/[cycleId]/dashboard`** — Cycle dashboard (domains, controls, progress).
- **`/cycles/[cycleId]/domains/[domainId]`** — Domain view and evidence items; quick upload and evaluate.
- **`/cycles/[cycleId]/domains/[domainId]/items/[itemId]`** — Full evidence item intake (inputs, uploads, evaluate).
- **`/cycles/[cycleId]/review`** — Review queue for the cycle.
- **`/cycles/[cycleId]/approval`** — Approval and attestation for the cycle.
- **`/cycles/[cycleId]/report`** — Report view, AI drafts, export.
- **`/cycles/[cycleId]/evidence-model`** — Evidence model / reference view.
- **`/admin`** — Platform admin (tenants, users).

---

## 8. Summary

The **SWIFT Compliance Platform** is a **multi-tenant SaaS** for **banks** to run **SWIFT CSCF v2025** compliance assessments. It exists to replace ad-hoc evidence and review processes with a **structured, role-based workflow**: evidence collection and AI-assisted sufficiency checks → internal and external review → senior approval and attestation → report generation and export. The platform provides **tenant isolation**, **architecture-based scoping**, and **audit trail** so that each bank can manage its assessment in one place, with clear ownership and traceability.

For detailed API contracts, database schema, and workflow specifications, see [Backend API & Database Design](./backend-api-and-database-design.md).
