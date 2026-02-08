@echo off
REM SoftSettle Demo Launch Script
REM This script starts the backend and frontend servers for local testing

setlocal enabledelayedexpansion

echo.
echo ========================================
echo     SoftSettle Demo - Local Startup
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Check if we're in the right directory
if not exist "%SCRIPT_DIR%packages\backend" (
    echo Error: packages\backend not found. Please run this from the soft_settle root directory.
    pause
    exit /b 1
)

echo Starting SoftSettle services...
echo.

REM Open two terminal windows - one for backend, one for frontend
echo Starting Backend (port 4000)...
start "SoftSettle Backend" cmd /k "cd %SCRIPT_DIR%packages\backend && npm start"

timeout /t 3 /nobreak

echo Starting Frontend (port 3000)...
start "SoftSettle Frontend" cmd /k "cd %SCRIPT_DIR%packages\frontend && npm run dev"

echo.
echo ========================================
echo Services starting...
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:4000
echo.
echo Close these windows to stop the services.
echo ========================================
echo.
