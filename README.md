
# ChatApp Project

---

## Overview

This project comprises a chat application built using Go and a separate Encryption API developed using .NET Core. The chat application allows users to send and receive encrypted messages, ensuring that the content is secure during transmission. The Encryption API provides functionalities for generating RSA key pairs, encrypting plain messages, and decrypting encrypted messages.

## Project Structure

### 1. Chat App (`chat-app`)

- **internal**: Application-specific code not intended for external use.
- **main.go**: The main entry point for the Go application.
- **static**: Contains static assets for the web frontend, such as HTML, CSS, and JS files.

### 2. Encryption API (`EncryptionAPI`)

- **Controllers**: Contains API controllers responsible for handling requests.
- **Services**: Service classes handling the business logic.
- **Program.cs**: Entry point for the .NET Core application.
- **Startup.cs**: Configuration file for setting up services, middleware, etc.

## Setup & Running

### Chat App

1. Navigate to the `chat-app` directory.
2. If there's a frontend component:
   - Install Node.js dependencies using `npm install`.
   - Start the frontend using `npm start` or the appropriate command.
3. For the Go backend:
   - Run `go run main.go` to start the Go server.

### Encryption API

1. Navigate to the `EncryptionAPI` directory.
2. Restore .NET dependencies using `dotnet restore`.
3. Build the solution using `dotnet build`.
4. Run the API using `dotnet run`.

## Contributions & Future Work

- Ensure that error handling is robust across both applications.
- Consider adding authentication to the chat app for enhanced security.
- Integrate a database to store chat history if required.

---

*Note: This README is a starting point and might require additional details or corrections based on the deeper functionality and requirements of the project. Always refer to the code and any accompanying documentation for the most accurate information.*
