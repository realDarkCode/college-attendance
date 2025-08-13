@echo off
title College Attendance Tracker - Auto Setup
color 0A

:: Handle uninstall command
if "%1"=="uninstall" goto uninstall_startup

:: Handle test command  
if "%1"=="test" goto test_services

:: Main setup
:main_setup
echo ================================================================
echo        COLLEGE ATTENDANCE TRACKER - AUTO SETUP
echo ================================================================
echo.
echo This will configure the College Attendance Tracker to run 
echo automatically in the background on every Windows startup.
echo.

:: Get script directory
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_PATH=%~f0"

echo Setting up automatic startup...
echo.

:: Create a VBS script for silent execution
echo Creating silent startup script...
(
echo Dim shell, fso, scriptDir, batFile
echo Set shell = CreateObject^("WScript.Shell"^)
echo Set fso = CreateObject^("Scripting.FileSystemObject"^)
echo scriptDir = "%SCRIPT_DIR%"
echo batFile = scriptDir ^& "auto-service.bat"
echo shell.Run """" ^& batFile ^& """", 0, False
echo Set shell = Nothing
echo Set fso = Nothing
) > "%SCRIPT_DIR%auto-silent.vbs"

:: Create the service bat file that actually runs the services
echo Creating service runner...
(
echo @echo off
echo title College Attendance Tracker - Background Service
echo cd /d "%SCRIPT_DIR%"
echo echo Starting web application...
echo start "College Attendance - Web App" /min cmd /c "call start.bat"
echo echo Waiting for web app to initialize...
echo timeout /t 15 /nobreak ^>nul
echo echo Starting scraper service loop...
echo :scraper_loop
echo echo Running attendance scraper at %%date%% %%time%%...
echo node scripts\run-scraper.js
echo echo Scraper completed. Next run in 3 hours...
echo timeout /t 10800 /nobreak ^>nul
echo goto scraper_loop
) > "%SCRIPT_DIR%auto-service.bat"

:: Add to Windows startup using registry
echo Adding to Windows startup registry...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "CollegeAttendanceTracker" /t REG_SZ /d "wscript.exe \"%SCRIPT_DIR%auto-silent.vbs\"" /f >nul 2>&1

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS: College Attendance Tracker configured for auto-startup!
    echo.
    echo What happens now:
    echo • Web application will start automatically on Windows boot
    echo • Attendance scraper will run every 3 hours in background
    echo • Everything runs silently without visible windows
    echo • Services start automatically on every computer restart
    echo.
    echo To remove auto-startup, run: auto.bat uninstall
    echo To test now without restarting, run: auto.bat test
) else (
    echo.
    echo ❌ ERROR: Failed to configure auto-startup.
    echo Please run this script as Administrator.
)

echo.
pause
goto end

:: Handle uninstall command
:uninstall_startup
echo Removing College Attendance Tracker from auto-startup...
echo.

:: Remove from registry
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "CollegeAttendanceTracker" /f >nul 2>&1

:: Clean up created files
del "%~dp0auto-silent.vbs" >nul 2>&1
del "%~dp0auto-service.bat" >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ SUCCESS: Auto-startup removed!
    echo College Attendance Tracker will no longer start automatically.
) else (
    echo ✅ Auto-startup removed (or was not configured).
)
echo.
pause
goto end

:test_services
echo Testing services without configuring auto-startup...
echo.
cd /d "%~dp0"
echo Starting web application...
start "College Attendance - Web App" /min cmd /c "call start.bat"
timeout /t 15 /nobreak >nul
echo.
echo Running scraper once...
node scripts\run-scraper.js
echo.
echo Test completed! Services should be running.
pause
goto end

:end
exit /b

:test_services
