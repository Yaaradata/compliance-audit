# Deploy Backend to Google Cloud Run

**Project:** complianceaudit-488314  
**Region:** us-central1

## Prerequisites

1. [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install)
2. Authenticate:
   ```powershell
   gcloud auth login
   gcloud auth application-default login
   ```

## Quick Deploy

```powershell
cd backend
.\deploy.ps1
```

## What the Script Does

1. **Enables APIs:** Cloud Run, Artifact Registry, Cloud Build, IAM
2. **Creates Artifact Registry repo** `compliance-audit` (if not exists)
3. **Creates service account** `compliance-api-runner` with:
   - `roles/storage.objectAdmin` — GCS for evidence files
   - `roles/aiplatform.user` — Vertex AI (Gemini)
   - `roles/cloudsql.client` — Cloud SQL (if used)
4. **Builds** Docker image via Cloud Build
5. **Pushes** to `us-central1-docker.pkg.dev/complianceaudit-488314/compliance-audit/api:latest`
6. **Deploys** to Cloud Run service `compliance-api`

## After Deploy: Set Environment Variables

In [Cloud Run Console](https://console.cloud.google.com/run) → Edit & Deploy → Variables:

| Variable | Description |
|----------|-------------|
| `DB_NAME` | compliance |
| `DB_USER` | postgres (or your app user) |
| `DB_PASSWORD` | (use Secret Manager for production) |
| `JWT_SECRET_KEY` | Secret for JWT signing |
| `GCS_BUCKET_NAME` | GCS bucket for evidence uploads |
| `CORS_ORIGINS` | Comma-separated frontend URLs |

**Cloud SQL:** The deploy script sets `CLOUD_SQL_INSTANCE` and adds the Cloud SQL connection. The backend connects via Unix socket—no Cloud SQL Proxy needed in production.

## Options

```powershell
.\deploy.ps1 -SkipServiceAccount   # Skip SA creation (use existing)
.\deploy.ps1 -DryRun               # Show what would run
.\deploy.ps1 -Region europe-west1  # Use different region
```

## Files

- `backend/Dockerfile` — Container image
- `backend/.dockerignore` — Excluded from build
- `backend/deploy.ps1` — Deployment script (APIs, SA, build, push, deploy)
