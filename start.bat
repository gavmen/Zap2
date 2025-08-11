@echo off
title Secure Chat Application

echo Starting Secure Chat Application...
echo ==================================

REM Check if Go is installed
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Go is not installed or not in PATH
    echo Please install Go 1.18+ and try again
    pause
    exit /b 1
)

REM Navigate to chat-app directory
cd /d "%~dp0chat-app"
if %errorlevel% neq 0 (
    echo Error: Could not navigate to chat-app directory
    pause
    exit /b 1
)

echo Current directory: %cd%

REM Check if go.mod exists
if not exist "go.mod" (
    echo Error: go.mod not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)

echo Installing/updating Go dependencies...
go mod tidy

echo Starting the chat server...
echo Server will be available at: http://localhost:8080
echo Test page available at: http://localhost:8080/test.html
echo.
echo Press Ctrl+C to stop the server
echo ==================================

REM Start the server
go run main.go

pause
