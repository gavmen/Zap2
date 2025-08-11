#!/bin/bash

# Secure Chat Application Startup Script

echo "Starting Secure Chat Application..."
echo "==================================="

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "Error: Go is not installed or not in PATH"
    echo "Please install Go 1.18+ and try again"
    exit 1
fi

# Navigate to chat-app directory
cd "$(dirname "$0")/chat-app" || exit 1

echo "Current directory: $(pwd)"

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo "Error: go.mod not found"
    echo "Please make sure you're in the correct directory"
    exit 1
fi

echo "Installing/updating Go dependencies..."
go mod tidy

echo "Starting the chat server..."
echo "Server will be available at: http://localhost:8080"
echo "Test page available at: http://localhost:8080/test.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==================================="

# Start the server
go run main.go
