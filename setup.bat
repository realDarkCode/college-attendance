@echo off
title Installing Attendance Tracker
echo =====================================
echo       Attendance Tracker Setup
echo =====================================
echo.
echo Starting installation of Attendance Tracker...
echo.
echo Step 1: Installing dependencies...
call npm install
echo npm install exit code: %errorlevel%
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Press any key to exit...
    pause > nul
    goto :end
)
echo.
echo Dependencies installed successfully!
echo.
echo Step 2: Setting up data files...
if not exist "data" mkdir data
if not exist "data\attendance.json" echo [] > data\attendance.json
if not exist "data\holidays.json" echo [] > data\holidays.json
if not exist "data\config.json" echo {"username":"","password":"","calendarOnly":false,"notifications":true} > data\config.json
if not exist "data\scrape-status.json" echo {"lastRun":"","status":"idle","progress":0} > data\scrape-status.json
echo Data files created successfully!
echo.
echo Step 3: Building production build...
call npm run build
echo npm build exit code: %errorlevel%
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to build the application!
    echo Press any key to exit...
    pause > nul
    goto :end
)
echo.
echo =====================================
echo      Setup completed successfully!
echo =====================================
echo.
echo Next steps:
echo 1. Start the application: npm run dev
echo 2. Open your browser to: http://localhost:3000
echo 3. Go to Settings and enter your college credentials
echo.
echo Installation completed! Press any key to exit...
pause > nul

:end
echo.
echo Batch file finished. Press any key to exit...
pause > nul