# Install Python (backend) and npm (frontend) dependencies for local development.
# Run from repo root:  powershell -ExecutionPolicy Bypass -File .\install-dependencies.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Installing backend Python packages (includes Azure Resource Graph + azure-identity)..."
py -3 -m pip install -r (Join-Path $root "backend\requirements.txt")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Installing frontend npm packages..."
Push-Location (Join-Path $root "frontend")
npm install
$code = $LASTEXITCODE
Pop-Location
if ($code -ne 0) { exit $code }

Write-Host "Done. Copy backend\.env.example to backend\.env and frontend\.env.example to frontend\.env (or .env.local), then set NEXT_PUBLIC_BACKEND_URL and DB/JWT/TENANT_AWS_ENCRYPTION_KEY as needed."
