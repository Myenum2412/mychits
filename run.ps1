# Apex ROSCA Chit Fund & YouPI-PG Gateway - PowerShell Unified Runner
Set-Location -Path $PSScriptRoot

$pythonPath = if (Test-Path "$PSScriptRoot\backend\venv\Scripts\python.exe") {
    "$PSScriptRoot\backend\venv\Scripts\python.exe"
} else {
    "python"
}

Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  Starting Apex ROSCA Chit Fund & YouPI-PG Gateway..." -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Green

& $pythonPath "$PSScriptRoot\run.py" $args
