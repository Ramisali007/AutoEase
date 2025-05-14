@echo off
echo Starting Car Rental Application...

REM Start the backend in a new window
start cmd /k "title Backend Server && cd backend && npm run dev"

REM Wait for backend to start
timeout /t 5 /nobreak > NUL

REM Start the frontend in a new window
start cmd /k "title Frontend Server && cd frontend && npm start"

echo Application started. Check the opened command windows for details.
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > NUL
