# Google Cloud Storage (GCS) — Process in This Platform

**Canonical full guide:** `docs/gcs-process-complete-guide.md` (expanded checklist, troubleshooting, and code map). This file remains a shorter reference.

This document describes **only** how **Google Cloud Storage** is used: configuration, authentication, object paths, upload/read/delete flows, and lifecycle cleanup. It reflects the current backend implementation (`backend/app/services/storage_service.py` and call sites).

It does **not** cover Vertex AI, Cloud SQL, or collecting evidence from GCP APIs (those are separate concerns).

---

## 1) Role of GCS in the product

GCS is the **default production object store** for user-uploaded and system-generated **files** when `STORAGE_BACKEND=gcs`. The database remains the source of truth for metadata (for example attachment rows store a `storage_path` like `gs://bucket/...`).

**Important distinction (AWS evidence):**

- Running **Fetch AWS evidence** (`run_all_collectors`) persists collector output in **PostgreSQL** (`response_json` on evidence rows). That path **does not** write each collector payload to GCS.
- GCS **does** receive JSON when **manual** AWS-type evidence is created via `create_manual_evidence` (see path layout below).

So GCS holds **submission files**, **scoping uploads**, **manual evidence JSON copies**, and **architecture diagrams** — not an automatic full dump of every AWS API collector result unless you add that behavior.

---

## 2) Configuration

Set in `backend/.env` (see `backend/app/config.py`):

| Variable | Purpose |
|----------|---------|
| `STORAGE_BACKEND` | Use `gcs` for GCS (default in config is `gcs`). Any other value uses **local disk** under `backend/uploads/`. |
| `GCS_BUCKET_NAME` | Target bucket name (required for GCS mode to actually use the cloud). |
| `GCS_PREFIX` | Optional logical prefix for **all** relative paths (e.g. `compliance-audit`). Stored object names become `{prefix}/{relative_path}` with slashes normalized. |

The backend builds full object paths as:

```text
object_name = (GCS_PREFIX.strip("/") + "/" + relative_path)   if prefix is non-empty
             = relative_path                                    otherwise
```

Returned paths after upload are always `gs://{GCS_BUCKET_NAME}/{object_name}`.

`GOOGLE_CLOUD_PROJECT` is **not** read by `storage_service.py`; it is used elsewhere (e.g. Vertex AI). For GCS, the **bucket** and **ADC credentials** determine access.

---

## 3) Authentication (how the backend talks to GCS)

The storage layer uses the **Google Cloud Storage client** with **Application Default Credentials (ADC)**:

1. At first use, `google.cloud.storage.Client()` is constructed with no explicit key path in code.
2. ADC resolution order is the standard Google libraries behavior, for example:
   - **Cloud Run / GCE / GKE**: attached service account (recommended for production).
   - **Local development**: `gcloud auth application-default login`, or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON key.

**Signed URLs** (`get_signed_url`): generating V4 signed URLs requires credentials that can **sign** (typically a **service account with a private key**). If ADC is only a user refresh token without signing capability, `generate_signed_url` fails; the code catches that and returns `None`. Downstream features then fall back to **streaming bytes through the backend** (see diagrams and file download behavior below).

---

## 4) Object path layout (what goes where)

All paths below are **relative** before the optional `GCS_PREFIX` is applied.

| Feature | Relative path pattern | When it is written |
|---------|------------------------|-------------------|
| **Evidence submission attachments** | `evidence/{submission_id}/{attachment_id}/{file_name}` | User uploads a file on a submission (`POST` evidence files API in `routers/files.py`). |
| **Control scoping justification** | `scoping/{cycle_id}/{control_id}/{uuid}_{safe_file_name}` | User uploads a justification file for scoping (`routers/assessments.py`). |
| **Manual AWS evidence JSON** (copy) | With cycle: `aws_evidence/cycles/{cycle_id}/manual/{control_id}/{item_code}/{evidence_id}.json`<br>Without cycle: `aws_evidence/manual/{control_id}/{item_code}/{evidence_id}.json` | `create_manual_evidence` in `aws_evidence/services/evidence_service.py` (upload errors are swallowed so DB insert can still proceed). |
| **Architecture diagrams** | `diagrams/swift_2025/{filename}` or `diagrams/swift_2026/{filename}` | `upload_diagram` / scripts such as `backend/scripts/upload_diagrams_to_gcs.py`. |

**Legacy note:** Older AWS JSON may exist under keys like `aws_evidence/aws/...` without `cycles/{cycle_id}/`. Cycle deletion cleanup only removes the **cycle-scoped** prefix documented below.

---

## 5) Upload process (end-to-end)

1. **Caller** computes a **relative path** (see table above) and byte content (and optional `content_type`).
2. **`storage_service.upload(relative_path, data, content_type)`**  
   - If `_is_gcs()` is false → writes `backend/uploads/{relative_path}` and returns that filesystem path.  
   - If GCS → builds `obj_path` with prefix, gets bucket blob, `upload_from_string`, logs `gs://...`, returns full `gs://` URI.
3. **Database** (where applicable) stores the returned `storage_path` on `EvidenceAttachment` or returns it to the client (scoping upload) so later reads use the same URI.

No multipart resumable upload API is used in this layer; objects are uploaded as whole byte strings.

---

## 6) Read and URL process

| Operation | Behavior |
|-----------|----------|
| **`download(storage_path)`** | If `gs://` → parse bucket + object, `download_as_bytes`. Else → read local file. |
| **`get_signed_url(storage_path, expiry_minutes)`** | For `gs://` → V4 GET signed URL, or `None` if signing is not possible. |
| **Evidence file URL** (`/evidence/.../files/{id}/url`) | Returns signed URL or **503** if signing unavailable (no stream fallback on this endpoint). |
| **Evidence file GET** (`/evidence/.../files/{id}`) | Tries signed URL → **redirect**; if `None`, **streams** file via `download()` through the API. |
| **Diagrams** (`get_diagram_url`) | Same: signed URL if possible; else returns a **backend stream URL** (`/api/v1/ref/diagrams/...`) so the UI still loads images. |

---

## 7) Delete process

| Operation | Behavior |
|-----------|----------|
| **`delete(storage_path)`** | Deletes one object (or local file). Missing object → treated as idempotent (404-style errors logged at debug). |
| **`delete_prefix(relative_prefix)`** | Lists all blobs whose **object name** starts with `{prefix}/{relative_prefix}/` (trailing slash added for GCS listing), deletes each. Returns count deleted. Used for **bulk** cleanup. |

**Per-file delete:** removing one attachment calls `storage_service.delete(attachment.storage_path)` (`routers/files.py`).

---

## 8) Lifecycle: what happens when a cycle is deleted

`backend/app/services/cycle_cleanup.py` runs **before** the assessment cycle row is removed:

1. For every **submission** in that cycle, it deletes **all objects** under relative prefix `evidence/{submission_id}/` via `delete_prefix` (covers all attachments under that submission tree).
2. It deletes **AWS manual / cycle-scoped JSON** under `aws_evidence/cycles/{cycle_id}/` via `delete_prefix`, then removes matching **`swift_2026`** `Evidence` and `CollectorRun` rows from the AWS evidence database session.

**Not** removed automatically by this job:

- Objects under `scoping/{cycle_id}/...` (no dedicated prefix delete in this cleanup path unless added later).
- Legacy `aws_evidence/aws/...` keys without `cycles/{cycle_id}/` (documented in code comments as possibly needing manual or batch cleanup).

---

## 9) IAM and bucket setup (operational checklist)

1. Create a **bucket** (region / dual-region per your policy).
2. Create or choose a **service account** the runtime will use (ADC).
3. Grant that identity **minimal** object access on that bucket, for example:
   - `roles/storage.objectAdmin` on the bucket (or tighter custom role with `storage.objects.create`, `get`, `delete`, `list` as needed).
4. For **signed URLs** in production, use a service account key or a signing-compatible workload identity setup; otherwise rely on **backend streaming** for downloads.
5. Ensure `GCS_BUCKET_NAME` and `GCS_PREFIX` match the bucket and your desired isolation (e.g. one bucket per environment with different prefixes).

---

## 10) Local development without GCS

Set `STORAGE_BACKEND` to something other than `gcs`, or leave `GCS_BUCKET_NAME` empty so `_is_gcs()` is false. Files land under `backend/uploads/` with the same relative path structure; URLs and deletes use the filesystem branch in `storage_service.py`.

---

## 11) Code reference map

| Concern | Location |
|---------|----------|
| GCS client, upload/download/delete/prefix/diagram helpers | `backend/app/services/storage_service.py` |
| Submission file upload/delete/url | `backend/app/routers/files.py` |
| Scoping file upload | `backend/app/routers/assessments.py` |
| Manual evidence JSON upload to GCS | `backend/app/aws_evidence/services/evidence_service.py` (`create_manual_evidence`) |
| Cycle deletion + GCS prefix wipes | `backend/app/services/cycle_cleanup.py` |
| Diagram stream fallback (no auth) | `backend/app/routers/reference.py` |
| Settings | `backend/app/config.py` |

---

## Summary

The **GCS process** here is: **ADC-backed bucket access**, **prefix-scoped object keys**, **upload on user or manual evidence actions**, **read via signed URL or backend stream**, **single-object or prefix delete**, and **cycle-scoped cleanup** for submission evidence and `aws_evidence/cycles/{cycle_id}/`. It is **not** a separate “evidence collection from GCP” pipeline; it is **object storage** for files and selected JSON copies alongside the main application database.
