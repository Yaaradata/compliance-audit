# Kill whatever is listening on port 8000
$conns = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if (-not $conns) {
    Write-Host "No process is listening on port 8000."
    exit 0
}
foreach ($c in $conns) {
    $pid = $c.OwningProcess
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "PID $pid" }
    Write-Host "Killing $name (PID $pid) on port 8000..."
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
Write-Host "Done. Port 8000 should be free."
