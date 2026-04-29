@echo off
setlocal

cd /d "%~dp0"

echo =====================================
echo   Darkfront: Last Stand - Start
echo =====================================
echo.

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting Expo...
call npm start

if errorlevel 1 (
  echo.
  echo Failed to start the project.
  pause
  exit /b 1
)

pause
