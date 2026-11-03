@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 start-local.py
  goto finished
)
where node >nul 2>nul
if not errorlevel 1 (
  node start-local.mjs
  goto finished
)
where python >nul 2>nul
if not errorlevel 1 (
  python start-local.py
  goto finished
)
echo Python 3 or Node.js is required to open this local test version.
echo See TEST-BEFORE-DEPLOYING.md for instructions.
pause
exit /b 1
:finished
if errorlevel 1 pause
