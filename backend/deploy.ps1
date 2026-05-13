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
    [string]$BucketName = "",
    [string]$DbHost = "34.171.237.58",
    [string]$DbPort = "5432",
    [string]$DbName = "compliance",
    [string]$DbUser = "postgres",
    [string]$DbUserApp = "compliance-audit01",
    [string]$DbPassword = "Compliance_Audit01",
    [string]$DbSsl = "false",
    [switch]$SkipServiceAccount,
    [switch]$SkipBucket,
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
if (-not $BucketName) { $BucketName = "${ProjectId}-compliance-uploads" }

Write-Host "=== SWIFT Compliance API - Cloud Run Deploy ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectId | Region: $Region | Service: $ServiceName"
Write-Host "Image: $FullImage | Bucket: gs://$BucketName"
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN - would execute:" -ForegroundColor Gray
    Write-Host "  1. Enable APIs, create Artifact Registry repo"
    Write-Host "  2. Create GCS bucket gs://$BucketName (region: $Region)"
    Write-Host "  3. Create Cloud Build staging bucket gs://${ProjectId}_cloudbuild (region: $Region)"
    Write-Host "  4. Create SA compliance-api-runner with Storage + Vertex AI"
    Write-Host "  5. Grant Cloud Build default SA storage.objectAdmin"
    Write-Host "  6. gcloud builds submit --tag $FullImage"
    Write-Host "  7. gcloud run deploy $ServiceName --image=$FullImage"
    exit 0
}

# 1. Set project and enable APIs
Write-Host "[1/7] Setting project and enabling APIs..." -ForegroundColor Yellow
$null = gcloud config set project $ProjectId 2>&1
foreach ($Api in @("run.googleapis.com", "artifactregistry.googleapis.com", "cloudbuild.googleapis.com", "iam.googleapis.com", "storage.googleapis.com")) {
    $null = gcloud services enable $Api --quiet 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Failed to enable $Api - check project permissions (Owner/Editor or serviceusage.serviceUsageAdmin)" }
}
Write-Host "  Done." -ForegroundColor Green

# 2. Create Artifact Registry repository
Write-Host "[2/7] Ensuring Artifact Registry repository..." -ForegroundColor Yellow
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

# 3. Create GCS bucket (single region, not multi-region)
if (-not $SkipBucket) {
    Write-Host "[3/7] Ensuring GCS bucket gs://$BucketName (location: $Region)..." -ForegroundColor Yellow
    $null = gcloud storage buckets describe "gs://$BucketName" 2>$null
    if ($LASTEXITCODE -ne 0) {
        gcloud storage buckets create "gs://$BucketName" `
            --project=$ProjectId `
            --location=$Region
        if ($LASTEXITCODE -ne 0) { throw "Failed to create bucket gs://$BucketName - check project permissions and bucket name uniqueness" }
        Write-Host "  Created bucket: gs://$BucketName (region: $Region)" -ForegroundColor Green
    } else {
        Write-Host "  Bucket exists." -ForegroundColor Green
    }
} else {
    Write-Host "[3/7] Skipping bucket creation (use -SkipBucket)." -ForegroundColor Gray
}

# 3b. Create Cloud Build staging bucket (required for gcloud builds submit)
$CloudBuildBucket = "${ProjectId}_cloudbuild"
Write-Host "[3b/7] Ensuring Cloud Build staging bucket gs://$CloudBuildBucket..." -ForegroundColor Yellow
$null = gcloud storage buckets describe "gs://$CloudBuildBucket" 2>$null
if ($LASTEXITCODE -ne 0) {
    gcloud storage buckets create "gs://$CloudBuildBucket" `
        --project=$ProjectId `
        --location=$Region
    if ($LASTEXITCODE -ne 0) { throw "Failed to create Cloud Build bucket gs://$CloudBuildBucket" }
    Write-Host "  Created bucket: gs://$CloudBuildBucket (region: $Region)" -ForegroundColor Green
} else {
    Write-Host "  Bucket exists." -ForegroundColor Green
}

# 4. Create service account
$SaEmail = "compliance-api-runner@${ProjectId}.iam.gserviceaccount.com"
if (-not $SkipServiceAccount) {
    Write-Host "[4/7] Creating service account and granting permissions..." -ForegroundColor Yellow
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
    Write-Host "[4/7] Skipping service account." -ForegroundColor Gray
}

# 4b. Ensure Cloud Build default SA can read/write staging bucket (fixes storage.objects.get denied)
Write-Host "[4b/7] Granting Cloud Build service account storage access..." -ForegroundColor Yellow
$ProjectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)" 2>$null
if ($ProjectNumber) {
    $BuildSaEmail = "${ProjectNumber}-compute@developer.gserviceaccount.com"
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$BuildSaEmail" `
        --role="roles/storage.objectAdmin" `
        --quiet 2>$null
    Write-Host "  Cloud Build SA $BuildSaEmail granted storage.objectAdmin" -ForegroundColor Green
} else {
    Write-Host "  Could not resolve project number; Cloud Build may need manual storage permissions" -ForegroundColor Gray
}

# 5. Build and push to Artifact Registry
Write-Host "[5/7] Building and pushing image..." -ForegroundColor Yellow
gcloud auth configure-docker "${Region}-docker.pkg.dev" --quiet 2>$null
Push-Location $BackendDir
try {
    gcloud builds submit --tag $FullImage --timeout=1200
    if ($LASTEXITCODE -ne 0) { throw "Cloud Build failed" }
} finally {
    Pop-Location
}
Write-Host "  Image pushed: $FullImage" -ForegroundColor Green

# 6. Deploy to Cloud Run
$CloudSqlInstance = "${ProjectId}:${Region}:compliance-audit01"
$BaseEnv = "GOOGLE_CLOUD_PROJECT=$ProjectId,GCS_BUCKET_NAME=$BucketName,DB_HOST=$DbHost,DB_PORT=$DbPort,DB_NAME=$DbName,DB_USER=$DbUser,DB_USER_APP=$DbUserApp,DB_PASSWORD=$DbPassword,DB_SSL=$DbSsl,CLOUD_SQL_INSTANCE=$CloudSqlInstance"
if ($SkipDeploy) {
    Write-Host "[6/7] Skipping deploy (use -SkipDeploy). Run manually in a separate terminal:" -ForegroundColor Yellow
    Write-Host "  gcloud run deploy $ServiceName --image=$FullImage --region=$Region --platform=managed --allow-unauthenticated --service-account=compliance-api-runner@${ProjectId}.iam.gserviceaccount.com --add-cloudsql-instances=$CloudSqlInstance --memory=2Gi --cpu=2 --cpu-boost --min-instances=0 --max-instances=10 --port=8080 --set-env-vars=`"$BaseEnv`""
    exit 0
}
Write-Host "[6/7] Deploying to Cloud Run..." -ForegroundColor Yellow
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
    --cpu-boost `
    --min-instances=0 `
    --max-instances=10 `
    --port=8080 `
    --set-env-vars=$BaseEnv `
    --quiet

if ($LASTEXITCODE -ne 0) { throw "Cloud Run deploy failed" }
Write-Host "  Deployed." -ForegroundColor Green

# 7. Output URL
Write-Host "[7/7] Fetching service URL..." -ForegroundColor Yellow
$ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host "Service URL: $ServiceUrl"
Write-Host "Health:      $ServiceUrl/health"
Write-Host "API:         $ServiceUrl/api/v1"
Write-Host "GCS Bucket:  gs://$BucketName"
Write-Host ""
Write-Host "NEXT: Set env vars in Cloud Run Console (Variables):" -ForegroundColor Yellow
Write-Host "  CLOUD_SQL_INSTANCE=$CloudSqlInstance (required on Cloud Run; else app uses DB_HOST TCP and often times out)"
Write-Host "  JWT_SECRET_KEY, CORS_ORIGINS"
Write-Host "  DB_* are optional when CLOUD_SQL_INSTANCE is set (socket ignores DB_HOST for the DB URL)."
Write-Host ""
