@echo off
echo ========================================================
echo   Starting Library Management System (Backend + Frontend)
echo ========================================================

echo Starting Backend Server on http://localhost:5000 ...
start "Library Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

echo Starting Frontend Dev Server on http://localhost:3000 ...
start "Library Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo - Backend API:  http://localhost:5000
echo - Frontend Web: http://localhost:3000
echo ========================================================
pause
