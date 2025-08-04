@echo off
title Installing College Attendance Tracker
echo =====================================
echo     College Attendance Tracker Setup
echo =====================================
echo.
echo Starting installation of College Attendance Tracker...
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
echo Step 2: Building production build...
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
echo Installation completed! Press any key to exit...
pause > nul

:end
echo.
echo Batch file finished. Press any key to exit...
pause > nul