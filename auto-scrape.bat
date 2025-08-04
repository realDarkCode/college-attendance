@echo off
REM This script runs the attendance scraper automatically.

REM Get the directory of the current script
SET "SCRIPTPATH=%~dp0"

REM Navigate to the project directory
cd /d "%SCRIPTPATH%"

echo [%date% %time%] Running the attendance scraper...

REM Execute the Node.js scraper script
REM This requires Node.js to be installed and in the system's PATH
node scripts/run-scraper.js

echo [%date% %time%] Scraper finished.
