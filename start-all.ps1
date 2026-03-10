$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Tenets - Flood Prediction System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting complete system..." -ForegroundColor Green
Write-Host ""

# Start backend in a new PowerShell window
Write-Host "Starting Flask backend (Port 5000)..." -ForegroundColor Cyan
$backendCmd = "& '.\.venv\Scripts\python.exe' '.\backend\flask_api.py'"
$backendProcess = Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList @("-NoExit", "-Command", $backendCmd) -PassThru

# Give backend a moment to initialize
Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window
Write-Host "Starting Next.js frontend (Port 3000)..." -ForegroundColor Cyan
$frontendProcess = Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList @("-NoExit", "-Command", "npm run dev") -PassThru

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "System starting" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Yellow

# Open browser automatically
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Dashboard opened" -ForegroundColor Green
Write-Host "Close the spawned PowerShell windows to stop the system" -ForegroundColor Yellow
