# SoftSettle Demo Launch Script (PowerShell)
# This script starts the backend and frontend servers for local testing

Write-Host ""
Write-Host "========================================"
Write-Host "     SoftSettle Demo - Local Startup"
Write-Host "========================================"
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if we're in the right directory
if (-not (Test-Path "$rootDir\packages\backend")) {
    Write-Host "Error: packages\backend not found. Please run this from the soft_settle root directory." -ForegroundColor Red
    exit 1
}

Write-Host "Starting SoftSettle services..." -ForegroundColor Green
Write-Host ""

# Start backend in a new window
Write-Host "Starting Backend (port 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\packages\backend'; npm start"

Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\packages\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================"
Write-Host "Services starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend:   http://localhost:4000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close the terminal windows to stop the services."
Write-Host "========================================"
Write-Host ""
