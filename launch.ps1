$ErrorActionPreference = 'Stop'
$gardenRoot = $PSScriptRoot
$gardenAddress = 'http://127.0.0.1:8765'
$gardenReady = $false
try {
    $gardenHealth = Invoke-WebRequest "$gardenAddress/health" -UseBasicParsing -TimeoutSec 2
    $gardenReady = $gardenHealth.Content -eq 'yiyu-garden'
    if (-not $gardenReady) { throw 'Port 8765 is used by another app.' }
} catch {
    if ($_.Exception.Message -like '*another app*') { throw }
}
if (-not $gardenReady) {
    $gardenNode = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $gardenNode) { $gardenNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
    if (-not (Test-Path -LiteralPath $gardenNode)) { throw 'Node.js was not found on this computer.' }
    Start-Process -FilePath $gardenNode -ArgumentList ('"' + (Join-Path $gardenRoot 'server.cjs') + '"') -WorkingDirectory $gardenRoot -WindowStyle Hidden
    for ($gardenAttempt = 0; $gardenAttempt -lt 30; $gardenAttempt++) {
        Start-Sleep -Milliseconds 200
        try { if ((Invoke-WebRequest "$gardenAddress/health" -UseBasicParsing -TimeoutSec 1).Content -eq 'yiyu-garden') { $gardenReady = $true; break } } catch {}
    }
}
if (-not $gardenReady) { throw 'Unable to start local server on port 8765.' }
Start-Process $gardenAddress
