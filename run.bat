@echo off
setlocal
title Apex ROSCA Chit Fund ^& YouPI-PG Gateway

:: Navigate to root directory
cd /d "%~dp0"

echo ========================================================================
echo   Starting Apex ROSCA Chit Fund ^& YouPI-PG Gateway...
echo ========================================================================

:: Prefer backend virtualenv Python if present, fallback to system python
if exist "backend\venv\Scripts\python.exe" (
    set "PY_CMD=backend\venv\Scripts\python.exe"
) else (
    set "PY_CMD=python"
)

:: Execute the unified single-file runner
"%PY_CMD%" run.py %*

:: If the runner stopped with an error, pause so the error is visible
if errorlevel 1 (
    echo.
    echo [ERROR] Application exited with error code %errorlevel%.
    pause
)
