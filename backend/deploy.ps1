# =============================================================================
# Deploy SWIFT Compliance Platform API to Google Cloud Run
# Project: complianceaudit-488314
# Run from backend: .\deploy.ps1
# =============================================================================
# Prerequisites: gcloud auth login, gcloud auth application-default login
# Permissions: Your account needs Owner/Editor or serviceusage.serviceUsageAdmin
#   on the project. A project owner must grant this in IAM.
# =============================================================================

param(
    [string]$ProjectId = "complianceaudit-488314",
    [string]$Region = "us-central1",
    [string]$ServiceName = "compliance-api",
    [string]$Repository = "compliance-audit",
    [string]$ImageName = "api",
    [switch]$SkipServiceAccount,
    [switch]$SkipDeploy,
    [switch]$DryRun
)

# Continue: gcloud.ps1 writes Python stderr to error stream; Stop would halt on quota-project warning
$ErrorActionPreference = "Continue"
# Disable gcloud prompts (avoids "Aborted by user" when run in script/IDE)
$env:CLOUDSDK_CORE_DISABLE_PROMPTS = "1"
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$ImageTag = "${Region}-docker.pkg.dev/$ProjectId/$Repository/$ImageName"
$FullImage = "${ImageTag}:latest"

Write-Host "=== SWIFT Compliance API - Cloud Run Deploy ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectId | Region: $Region | Service: $ServiceName"
Write-Host "Image: $FullImage"
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN - would execute:" -ForegroundColor Gray
    Write-Host "  1. Enable APIs, create Artifact Registry repo"
    Write-Host "  2. Create SA compliance-api-runner with Storage + Vertex AI"
    Write-Host "  3. gcloud builds submit --tag $FullImage"
    Write-Host "  4. gcloud run deploy $ServiceName --image=$FullImage"
    exit 0
}

# 1. Set project and enable APIs
Write-Host "[1/6] Setting project and enabling APIs..." -ForegroundColor Yellow
$null = gcloud config set project $ProjectId 2>&1
foreach ($Api in @("run.googleapis.com", "artifactregistry.googleapis.com", "cloudbuild.googleapis.com", "iam.googleapis.com")) {
    $null = gcloud services enable $Api --quiet 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Failed to enable $Api - check project permissions (Owner/Editor or serviceusage.serviceUsageAdmin)" }
}
Write-Host "  Done." -ForegroundColor Green

# 2. Create Artifact Registry repository
Write-Host "[2/6] Ensuring Artifact Registry repository..." -ForegroundColor Yellow
$RepoExists = gcloud artifacts repositories describe $Repository --location=$Region 2>$null
if (-not $RepoExists) {
    gcloud artifacts repositories create $Repository `
        --repository-format=docker `
        --location=$Region `
        --description="Compliance Audit API images"
    Write-Host "  Created repository: $Repository" -ForegroundColor Green
} else {
    Write-Host "  Repository exists." -ForegroundColor Green
}

# 3. Create service account
$SaEmail = "compliance-api-runner@${ProjectId}.iam.gserviceaccount.com"
if (-not $SkipServiceAccount) {
    Write-Host "[3/6] Creating service account and granting permissions..." -ForegroundColor Yellow
    $SaExists = gcloud iam service-accounts describe $SaEmail 2>$null
    if (-not $SaExists) {
        gcloud iam service-accounts create compliance-api-runner `
            --display-name="Compliance API Cloud Run" `
            --description="Service account for Compliance API Cloud Run"
        Write-Host "  Created SA: $SaEmail" -ForegroundColor Green
    } else {
        Write-Host "  Service account exists." -ForegroundColor Green
    }
    $Roles = @("roles/storage.objectAdmin", "roles/aiplatform.user", "roles/cloudsql.client")
    foreach ($Role in $Roles) {
        gcloud projects add-iam-policy-binding $ProjectId `
            --member="serviceAccount:$SaEmail" `
            --role=$Role `
            --quiet 2>$null
    }
    Write-Host "  Permissions granted." -ForegroundColor Green
} else {
    Write-Host "[3/6] Skipping service account." -ForegroundColor Gray
}

# 4. Build and push to Artifact Registry
Write-Host "[4/6] Building and pushing image..." -ForegroundColor Yellow
gcloud auth configure-docker "${Region}-docker.pkg.dev" --quiet 2>$null
Push-Location $BackendDir
try {
    gcloud builds submit --tag $FullImage --timeout=1200
    if ($LASTEXITCODE -ne 0) { throw "Cloud Build failed" }
} finally {
    Pop-Location
}
Write-Host "  Image pushed: $FullImage" -ForegroundColor Green

# 5. Deploy to Cloud Run
$CloudSqlInstance = "${ProjectId}:${Region}:compliance-audit"
$BaseEnv = "GOOGLE_CLOUD_PROJECT=$ProjectId,CLOUD_SQL_INSTANCE=$CloudSqlInstance"
if ($SkipDeploy) {
    Write-Host "[5/6] Skipping deploy (use -SkipDeploy). Run manually in a separate terminal:" -ForegroundColor Yellow
    Write-Host "  gcloud run deploy $ServiceName --image=$FullImage --region=$Region --platform=managed --allow-unauthenticated --service-account=compliance-api-runner@${ProjectId}.iam.gserviceaccount.com --add-cloudsql-instances=$CloudSqlInstance --memory=2Gi --cpu=2 --min-instances=0 --max-instances=10 --port=8080 --set-env-vars=`"$BaseEnv`""
    exit 0
}
Write-Host "[5/6] Deploying to Cloud Run..." -ForegroundColor Yellow
# Pipe 'y' to auto-confirm any prompts (fixes "Aborted by user" in non-interactive terminals)
"y" | gcloud run deploy $ServiceName `
    --image=$FullImage `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --service-account=$SaEmail `
    --add-cloudsql-instances=$CloudSqlInstance `
    --memory=2Gi `
    --cpu=2 `
    --min-instances=0 `
    --max-instances=10 `
    --port=8080 `
    --set-env-vars=$BaseEnv `
    --quiet

if ($LASTEXITCODE -ne 0) { throw "Cloud Run deploy failed" }
Write-Host "  Deployed." -ForegroundColor Green

# 6. Output URL
Write-Host "[6/6] Fetching service URL..." -ForegroundColor Yellow
$ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host "Service URL: $ServiceUrl"
Write-Host "Health:      $ServiceUrl/health"
Write-Host "API:         $ServiceUrl/api/v1"
Write-Host ""
Write-Host "NEXT: Set env vars in Cloud Run Console (Variables):" -ForegroundColor Yellow
Write-Host "  DB_NAME, DB_USER, DB_PASSWORD  (CLOUD_SQL_INSTANCE set by deploy)"
Write-Host "  JWT_SECRET_KEY, GCS_BUCKET_NAME, CORS_ORIGINS"
Write-Host ""
