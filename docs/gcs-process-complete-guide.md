# Google Cloud Storage (GCS) — Complete process guide

This document is the **full reference** for how **Google Cloud Storage** is used in the SWIFT Compliance Platform: what it stores, how objects are named, how authentication and signing work, upload/read/delete flows, lifecycle cleanup, IAM, local development, and troubleshooting.

---

## 1. GCS vs GCP evidence collection (do not confuse)

| Topic | What it is | Where data lives |
|--------|------------|------------------|
| **GCS (this guide)** | Object storage for **files**: evidence submission attachments, control scoping uploads, architecture diagram images, optional **JSON copies** of manual AWS-style evidence. | **GCS bucket** (`gs://…`) and DB metadata (`storage_path`). |
| **GCP evidence collection** | Backend **collectors** call GCP APIs (Compute, IAM, Logging, etc.) and persist results in **PostgreSQL** (`swift_2026.collector_runs`, `swift_2026.evidence`, `cloud_provider = gcp`). | **Database** (`response_json` on evidence rows). |

**Important:** Running **Fetch AWS evidence** or **Fetch GCP evidence** does **not** write every collector API response to GCS. Those payloads are stored in the database. GCS is used for **binary/file artifacts** and selected **manual evidence JSON** uploads as described below.

For **GCP API-driven collectors**, SWIFT mapping, and HTTP APIs, see `docs/gcp-api-driven-architecture.md`, `backend/app/gcp_evidence/README.md`, and `backend/app/gcp_evidence/SWIFT_2026_GCP_COLLECTOR_PLAN.md`.

---

## 2. Role of GCS in the product

When `STORAGE_BACKEND=gcs` and a bucket is configured, GCS is the **default production object store** for:

1. **Evidence submission attachments** — files users attach to evidence submissions.
2. **Control scoping justification files** — uploads tied to a cycle and control.
3. **Manual AWS-type evidence (JSON copy)** — optional GCS copy when manual evidence is created (`create_manual_evidence`).
4. **Architecture diagrams** — PNG/SVG (or similar) referenced from reference/architecture features.

The **relational database** remains the source of truth for **metadata** (e.g. attachment rows store `storage_path` like `gs://bucket/...`).

---

## 3. Configuration

All settings are read from the backend environment (`backend/app/config.py`, typically `backend/.env`).

| Variable | Purpose |
|----------|---------|
| `STORAGE_BACKEND` | Set to `gcs` to use Google Cloud Storage. Any other value uses **local disk** under `backend/uploads/`. |
| `GCS_BUCKET_NAME` | Target bucket name. If empty while `STORAGE_BACKEND=gcs`, the code treats storage as **non-GCS** (local fallback behavior depends on `_is_gcs()` logic: requires both `gcs` and non-empty bucket). |
| `GCS_PREFIX` | Optional logical prefix for **all** object keys (default in config is often `compliance-audit`). Leading/trailing slashes are normalized. |

### Object key construction

Let `relative_path` be the path chosen by the application feature (see §5).

- If `GCS_PREFIX` is non-empty after stripping slashes:  
  `object_name = "{GCS_PREFIX}/{relative_path}"` (with single slashes normalized).
- If prefix is empty:  
  `object_name = relative_path`.

Values returned from `upload()` are always full URIs: `gs://{GCS_BUCKET_NAME}/{object_name}`.

`GOOGLE_CLOUD_PROJECT` is **not** used by `storage_service.py` for bucket selection; the **bucket name** and **ADC** identity drive access. `GOOGLE_CLOUD_PROJECT` may be used by other features (e.g. Vertex AI).

---

## 4. Authentication

The storage layer uses the **Google Cloud Storage client** with **Application Default Credentials (ADC)**:

1. `google.cloud.storage.Client()` is constructed without an explicit key path in application code.
2. ADC resolution follows standard Google client libraries, for example:
   - **Cloud Run / GCE / GKE** — workload identity or attached service account (recommended in production).
   - **Local development** — `gcloud auth application-default login`, or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON key file.

### Signed URLs (V4 GET)

`get_signed_url(storage_path, expiry_minutes)` generates a time-limited **signed URL** for direct browser/client download **only if** the active credentials can **sign** requests (typically a **service account with a private key**).

- If ADC is a user refresh token or another identity **without** signing capability, `generate_signed_url` fails; the code catches this and returns **`None`**.
- Callers then use **backend streaming** (download bytes server-side and return them from an API response) so features still work without signing.

**Production recommendation:** run the API with a **service account** that has object access on the bucket and can sign, if you want clients to fetch large files directly from GCS via HTTPS instead of through the app.

---

## 5. Object path layout

All patterns below are **relative** paths before `GCS_PREFIX` is applied.

| Feature | Relative path pattern | When written |
|---------|------------------------|--------------|
| Evidence submission attachments | `evidence/{submission_id}/{attachment_id}/{file_name}` | User uploads on a submission (`routers/files.py`). |
| Control scoping justification | `scoping/{cycle_id}/{control_id}/{uuid}_{safe_file_name}` | Scoping upload (`routers/assessments.py`). |
| Manual AWS evidence JSON (copy) | With cycle: `aws_evidence/cycles/{cycle_id}/manual/{control_id}/{item_code}/{evidence_id}.json`<br>Without cycle: `aws_evidence/manual/{control_id}/{item_code}/{evidence_id}.json` | `create_manual_evidence` in `aws_evidence/services/evidence_service.py` (upload errors are logged; DB insert can still proceed if upload fails). |
| Architecture diagrams | `diagrams/swift_2025/{filename}` or `diagrams/swift_2026/{filename}` | `upload_diagram` / scripts such as `backend/scripts/upload_diagrams_to_gcs.py`. |

**Legacy:** Older objects may exist under `aws_evidence/aws/...` without `cycles/{cycle_id}/`. Cycle deletion cleanup (§8) only removes the **documented cycle-scoped** tree for manual evidence JSON.

---

## 6. Core operations

### 6.1 Upload

1. Caller builds a **relative path** (per table above) and provides **bytes** plus optional `content_type`.
2. `storage_service.upload(relative_path, data, content_type)`:
   - **GCS:** builds `obj_path`, uploads via `blob.upload_from_string`, logs `gs://...`, returns full `gs://` URI.
   - **Local:** writes under `backend/uploads/{relative_path}`, returns filesystem path string.

Uploads are **full-object** (not resumable multipart) in the current implementation.

### 6.2 Download

`download(storage_path)`:

- If path starts with `gs://` — parse bucket and object name, return `blob.download_as_bytes()`.
- Else — read from local filesystem path.

### 6.3 Read URLs (signed vs stream)

| Mechanism | Behavior |
|-----------|----------|
| `get_signed_url` | Returns HTTPS signed URL or `None` if signing is unavailable. |
| Evidence file URL endpoint | May return signed URL; **503** if signing required but unavailable (depends on route). |
| Evidence file GET | Often tries redirect to signed URL; if `None`, **streams** via `download()` through the API. |
| Diagrams `get_diagram_url` | Signed URL when possible; otherwise returns a **backend stream URL** under `/api/v1/ref/diagrams/.../content` so `<img src="...">` still works. |

### 6.4 Delete

| Function | Behavior |
|----------|----------|
| `delete(storage_path)` | Deletes one object (or local file). Missing object: treated as **idempotent** (not found logged at debug). |
| `delete_prefix(relative_prefix)` | Lists all blobs whose name starts with `{GCS_PREFIX}/{relative_prefix}/` (trailing slash enforced for listing), deletes each. Returns count deleted. Used for **bulk** cleanup (e.g. all attachments for a submission). |

---

## 7. Lifecycle: cycle deletion

`backend/app/services/cycle_cleanup.py` runs **before** the assessment cycle row is removed:

1. For each **submission** in that cycle, deletes all objects under `evidence/{submission_id}/` via `delete_prefix`.
2. Deletes AWS manual / cycle-scoped JSON under `aws_evidence/cycles/{cycle_id}/` via `delete_prefix`.
3. Removes related **`swift_2026`** evidence and collector run rows in the evidence DB session (AWS-side cleanup in that job).

**Not** removed automatically by this path (unless extended later):

- Objects under `scoping/{cycle_id}/...`.
- Legacy `aws_evidence/aws/...` keys without the cycle segment (may need batch or manual cleanup).

---

## 8. IAM and bucket setup (checklist)

1. Create a **bucket** (region / dual-region per policy).
2. Choose the **runtime identity** (service account) used for ADC on the API service.
3. Grant **minimal** object permissions on that bucket, e.g.:
   - `roles/storage.objectAdmin` on the bucket, **or**
   - A custom role with `storage.objects.create`, `get`, `delete`, `list` as needed.
4. For **signed URLs** in production, use a signing-capable service account (or equivalent Workload Identity signing setup).
5. Align `GCS_BUCKET_NAME` and `GCS_PREFIX` per environment (e.g. separate buckets or prefixes for staging vs production).

---

## 9. Local development without GCS

- Set `STORAGE_BACKEND` to anything other than `gcs`, **or**
- Leave `GCS_BUCKET_NAME` empty so `_is_gcs()` is false.

Files are stored under `backend/uploads/` with the same relative layout; upload/download/delete use the filesystem branches in `storage_service.py`.

---

## 10. Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| `403` / `Permission denied` on upload | SA lacks bucket permissions | Add `storage.objectAdmin` or finer role on bucket; verify ADC identity. |
| `404` on download | Wrong bucket/object path; object deleted | Check `storage_path` in DB; verify prefix and `GCS_PREFIX`. |
| Signed URLs never returned; always streaming | User ADC or non-signing identity | Expected locally; use service account key in dev or accept streaming; for production use signing-capable SA. |
| Upload “succeeds” but manual evidence JSON missing in GCS | `create_manual_evidence` swallows upload errors | Check logs; DB row may still exist without GCS copy. |
| Cycle deleted but some files remain | Path not under `evidence/{submission_id}/` or `aws_evidence/cycles/{id}/` | Review scoping and legacy paths; run manual cleanup if needed. |

---

## 11. Code reference map

| Concern | Location |
|---------|----------|
| GCS client, upload, download, delete, delete_prefix, diagrams | `backend/app/services/storage_service.py` |
| Submission file upload/delete/url | `backend/app/routers/files.py` |
| Scoping file upload | `backend/app/routers/assessments.py` |
| Manual evidence JSON upload to GCS | `backend/app/aws_evidence/services/evidence_service.py` (`create_manual_evidence`) |
| Cycle deletion + GCS prefix wipes | `backend/app/services/cycle_cleanup.py` |
| Diagram public stream fallback | `backend/app/routers/reference.py` |
| Settings | `backend/app/config.py` |

---

## 12. Summary

**GCS in this platform** is **ADC-backed bucket storage** with an optional **key prefix**, used for **user files**, **diagrams**, and **optional manual evidence JSON**, with **read** via **signed URL or backend stream** and **delete** via single-object or **prefix** delete. It is **not** the primary store for automated **AWS or GCP collector** API payloads; those live in **PostgreSQL** as `response_json` on evidence rows.

For the older standalone draft that focused only on GCS, see `docs/gcp-evidence-collection-guide.md` (same topic; this file is the **complete** consolidated guide).
