@echo off
echo Starting MongoDB and Backend Server...

REM Check if MongoDB is running
echo Checking MongoDB status...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is already running.
) else (
    echo Starting MongoDB...
    start /B mongod --dbpath=./data
    timeout /t 5 /nobreak > NUL
    echo MongoDB started.
)

REM Change to backend directory
cd backend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

REM Seed the database
echo Seeding the database...
npm run seed

REM Start the backend server
echo Starting backend server...
npm run dev

pause
