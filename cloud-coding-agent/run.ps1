# Run the cloud coding agent with a real Python (avoids WindowsApps Store stubs when PATH is wrong).
# Usage: .\run.ps1   or   .\run.ps1 --batch --excel path\to.xlsx
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$main = Join-Path $here "main.py"

$launcher = Join-Path $env:LOCALAPPDATA "Programs\Python\Launcher\py.exe"
if (Test-Path $launcher) {
    & $launcher -3 $main @args
    exit $LASTEXITCODE
}

$pyCmd = Get-Command py -ErrorAction SilentlyContinue
if ($pyCmd -and $pyCmd.Source -notmatch 'WindowsApps') {
    & py -3 $main @args
    exit $LASTEXITCODE
}

foreach ($name in @('python', 'python3')) {
    $c = Get-Command $name -ErrorAction SilentlyContinue
    if ($c -and $c.Source -notmatch 'WindowsApps') {
        & $c.Path $main @args
        exit $LASTEXITCODE
    }
}

Write-Host "Python 3 not found. Install from https://www.python.org/downloads/ (check 'Add python.exe to PATH')," -ForegroundColor Yellow
Write-Host "or fix PATH so py.exe from the Python Launcher is available." -ForegroundColor Yellow
exit 1
