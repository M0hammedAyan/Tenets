Write-Host "================================" -ForegroundColor Cyan
Write-Host "🌊 Tenets - Flood Prediction System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Create two terminal windows for backend and frontend
Write-Host "🚀 Starting complete system..." -ForegroundColor Green
Write-Host ""

# Start Backend in separate PowerShell window
Write-Host "📡 Starting Flask Backend (Port 5000)..." -ForegroundColor Cyan
$backendProcess = Start-Process powershell -ArgumentList "-NoExit -Command `& '.venv\Scripts\python.exe' backend/flask_api.py" -PassThru

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in separate PowerShell window
Write-Host "🎨 Starting Next.js Frontend (Port 3000)..." -ForegroundColor Cyan
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit -Command `& npm run dev" -PassThru

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ System Starting!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend API:   http://localhost:5000" -ForegroundColor Yellow
Write-Host "📍 Frontend UI:   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open the dashboard..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✨ Dashboard opened!" -ForegroundColor Green
Write-Host "Close these PowerShell windows to stop the system" -ForegroundColor Yellow
