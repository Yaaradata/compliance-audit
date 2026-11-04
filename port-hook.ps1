# =============================================================================
# port-hook.ps1 - Port deploy guard + reporter for Yaaradata/compliance-audit
# -----------------------------------------------------------------------------
# Dot-source from deploy.ps1:   . "$PSScriptRoot\port-hook.ps1"
#
# Needs two env vars (Port > your avatar > Credentials):
#   PORT_CLIENT_ID, PORT_CLIENT_SECRET
# Optional:
#   PORT_API_URL   default https://api.getport.io/v1  (US orgs: https://api.us.getport.io/v1)
#
# Blueprint: deployTarget   Entities: compliance-api, compliance-frontend
# Works on Windows PowerShell 5.1 and PowerShell 7+.
# =============================================================================

$script:PortApi       = if ($env:PORT_API_URL) { $env:PORT_API_URL.TrimEnd('/') } else { 'https://api.getport.io/v1' }
$script:PortBlueprint = 'deployTarget'
$script:PortToken     = $null

function Get-PortToken {
    if ($script:PortToken) { return $script:PortToken }
    if (-not $env:PORT_CLIENT_ID -or -not $env:PORT_CLIENT_SECRET) {
        throw "PORT_CLIENT_ID / PORT_CLIENT_SECRET are not set. Get them from Port > avatar > Credentials."
    }
    $body = @{ clientId = $env:PORT_CLIENT_ID; clientSecret = $env:PORT_CLIENT_SECRET } | ConvertTo-Json
    $resp = Invoke-RestMethod -Method Post -Uri "$script:PortApi/auth/access_token" `
                -ContentType 'application/json' -Body $body
    $script:PortToken = $resp.accessToken
    return $script:PortToken
}

function Invoke-Port {
    param(
        [Parameter(Mandatory)][ValidateSet('GET','PATCH')][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        [hashtable]$Body
    )
    $params = @{
        Method  = $Method
        Uri     = "$script:PortApi$Path"
        Headers = @{ Authorization = "Bearer $(Get-PortToken)" }
    }
    if ($Body) {
        $params.ContentType = 'application/json; charset=utf-8'
        $params.Body = [System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 6))
    }
    Invoke-RestMethod @params
}

function Get-PortDeployTarget {
    param([Parameter(Mandatory)][string]$Target)
    (Invoke-Port -Method GET -Path "/blueprints/$script:PortBlueprint/entities/$Target").entity
}

# -----------------------------------------------------------------------------
# Assert-PortUnlocked - call BEFORE building/deploying.
# Fails closed: if Port can't be reached, the deploy is blocked too
# (a silent pass during a demo freeze is the worse failure).
# -----------------------------------------------------------------------------
function Assert-PortUnlocked {
    param(
        [Parameter(Mandatory)][string]$Target,
        [switch]$OverrideLock
    )
    try {
        $entity = Get-PortDeployTarget -Target $Target
    } catch {
        Write-Host "[port] Could not read '$Target' from Port: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "[port] Blocking deploy. Re-run with -OverrideLock if you're sure." -ForegroundColor Red
        if (-not $OverrideLock) { exit 3 }
        return
    }

    $p = $entity.properties
    if ($p.lockedForDemo -eq $true) {
        $reason = if ($p.lockReason) { $p.lockReason } else { '(no reason given)' }
        if ($OverrideLock) {
            Write-Warning "[port] '$Target' is LOCKED for demo - overriding. Reason on lock: $reason"
            return
        }
        Write-Host ""
        Write-Host "  DEPLOY BLOCKED: '$Target' is locked for demo." -ForegroundColor Red
        Write-Host "  Reason        : $reason" -ForegroundColor Red
        if ($p.lastDeployedBy) {
            Write-Host "  Last deploy   : $($p.lastCommit) by $($p.lastDeployedBy) at $($p.lastDeployedAt)" -ForegroundColor DarkGray
        }
        Write-Host "  Unlock in Port (untick 'Locked For Demo') or re-run with -OverrideLock." -ForegroundColor Yellow
        Write-Host ""
        exit 2
    }
    Write-Host "[port] '$Target' is unlocked - continuing." -ForegroundColor Green
}

function Get-GitCommitInfo {
    $sha = (git rev-parse --short HEAD 2>$null)
    if (-not $sha) { return 'unknown' }
    $dirty = (git status --porcelain 2>$null)
    if ($dirty) { return "$sha-dirty" }
    return $sha
}

function Get-Deployer {
    $name = (git config user.email 2>$null)
    if (-not $name) { $name = (git config user.name 2>$null) }
    if (-not $name) { $name = $env:USERNAME }
    return $name
}

# -----------------------------------------------------------------------------
# Send-PortDeploy - call AFTER a successful deploy.
# Never fails the deploy itself; a reporting error is only a warning.
# -----------------------------------------------------------------------------
function Send-PortDeploy {
    param(
        [Parameter(Mandatory)][string]$Target,
        [string]$Url
    )
    $props = @{
        lastDeployedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        lastCommit     = Get-GitCommitInfo
        lastDeployedBy = Get-Deployer
    }
    if ($Url) { $props.url = $Url.Trim() }

    try {
        Invoke-Port -Method PATCH -Path "/blueprints/$script:PortBlueprint/entities/$Target" `
                    -Body @{ properties = $props } | Out-Null
        Write-Host "[port] Reported deploy of '$Target' ($($props.lastCommit) by $($props.lastDeployedBy))." -ForegroundColor Green
    } catch {
        Write-Warning "[port] Deploy succeeded but reporting to Port failed: $($_.Exception.Message)"
    }
}

# -----------------------------------------------------------------------------
# Set-PortDemoLock - lock/unlock from the terminal instead of the Port UI.
#   Set-PortDemoLock -Target compliance-frontend -Reason "Starling demo Thu 3pm"
#   Set-PortDemoLock -Target compliance-frontend -Unlock
# -----------------------------------------------------------------------------
function Set-PortDemoLock {
    param(
        [Parameter(Mandatory)][string]$Target,
        [string]$Reason,
        [switch]$Unlock
    )
    if ($Unlock) {
        $props = @{ lockedForDemo = $false; lockReason = '' }
    } else {
        if (-not $Reason) { throw "Give a -Reason when locking (it's shown to whoever gets blocked)." }
        $props = @{ lockedForDemo = $true; lockReason = $Reason }
    }
    Invoke-Port -Method PATCH -Path "/blueprints/$script:PortBlueprint/entities/$Target" `
                -Body @{ properties = $props } | Out-Null
    $state = if ($Unlock) { 'UNLOCKED' } else { "LOCKED ($Reason)" }
    Write-Host "[port] '$Target' is now $state." -ForegroundColor Cyan
}
