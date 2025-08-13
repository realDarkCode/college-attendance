@echo off
title College Attendance Tracker Setup
echo ========================================
echo College Attendance Tracker Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check if npm is available
echo [2/6] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    echo Please ensure npm is installed with Node.js
    echo.
    pause
    exit /b 1
)
echo ✓ npm is available

REM Install dependencies
echo [3/6] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo.
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully

REM Create data directory and files if they don't exist
echo [4/6] Setting up data files...
if not exist "data" mkdir data
if not exist "data\attendance.json" echo [] > data\attendance.json
if not exist "data\holidays.json" echo [] > data\holidays.json
if not exist "data\credentials.json" echo {"username":"","password":""} > data\credentials.json
if not exist "data\scrape-status.json" echo {"lastRun":"","status":"idle","progress":0} > data\scrape-status.json
echo ✓ Data files created

REM Set up Windows Task Scheduler for cron job
echo [5/6] Setting up automated scraping...
echo.
echo Setting up Windows Task Scheduler to run scraper daily at 8:00 AM...
echo.

REM Get current directory
set "CURRENT_DIR=%CD%"

REM Create the task
schtasks /create /tn "College Attendance Scraper" /tr "node \"%CURRENT_DIR%\scripts\run-scraper.js\"" /sc daily /st 08:00 /f >nul 2>&1

if %errorlevel% equ 0 (
    echo ✓ Scheduled task created successfully
    echo   Task will run daily at 8:00 AM
    echo   Task name: "College Attendance Scraper"
) else (
    echo ⚠ Failed to create scheduled task automatically
    echo   You may need to run this script as Administrator
    echo   Or manually set up the task in Task Scheduler
)

echo.
echo [6/6] Final setup steps...

REM Build the application
echo Building the application...
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Application built successfully
) else (
    echo ⚠ Build failed, but you can still run in development mode
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your College Attendance Tracker is now set up!
echo.
echo Next steps:
echo 1. Start the application: npm run dev
echo 2. Open your browser to: http://localhost:3000
echo 3. Go to Settings and enter your college credentials
echo 4. The scraper will run automatically daily at 8:00 AM
echo.
echo Manual commands:
echo - Start development server: npm run dev
echo - Build for production: npm run build
echo - Start production server: npm start
echo - Run scraper manually: node scripts\run-scraper.js
echo.
echo To manage the scheduled task:
echo - View tasks: schtasks /query /tn "College Attendance Scraper"
echo - Delete task: schtasks /delete /tn "College Attendance Scraper" /f
echo.
echo For any issues, check the README.md file or create an issue on GitHub.
echo.
pause
