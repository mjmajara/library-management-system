Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Library Management System (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "Starting Backend API (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm start"

Write-Host "Starting Frontend React App (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Servers launched in separate PowerShell windows:" -ForegroundColor Yellow
Write-Host "  Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
