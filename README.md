
# Secure Chat Application

A real-time chat application with end-to-end encrypted messaging capabilities, built using Go WebSockets and modern browser cryptography.

## Features

- **End-to-End Encryption**: Private messages encrypted using RSA-OAEP in the browser
- **Global Chat**: Public chat visible to all connected users
- **Dual Chat Modes**: Switch between global and private messaging
- **Secure Key Management**: Private keys never leave the browser
- **Real-time Communication**: WebSocket-based instant messaging
- **Modern Interface**: Clean, responsive web interface

## Architecture

The application consists of two main components:

1. **Go WebSocket Server**: Handles real-time messaging and user management
2. **Browser Frontend**: Modern HTML5/CSS3/JavaScript interface with crypto operations
3. **MySQL Database** (optional): Message persistence

### Security Model

- **Key Generation**: RSA-2048 key pairs generated in browser using Web Crypto API
- **Global Messages**: Unencrypted messages visible to all users
- **Private Messages**: Encrypted with recipient's public key
- **Public Key Exchange**: Server facilitates key distribution without accessing private keys

## Setup

### Prerequisites

- Go 1.18 or higher
- MySQL server (optional)
- Modern web browser with Web Crypto API support

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd chat-app
   ```

2. **Install dependencies:**
   ```bash
   go mod tidy
   ```

3. **Start the server:**
   ```bash
   go run main.go
   ```

4. **Open your browser:**
   - Main application: http://localhost:8080
   - Test page: http://localhost:8080/test.html

### Database Setup (Optional)

1. **Create MySQL database:**
   ```sql
   CREATE DATABASE chat_app;
   CREATE USER 'gabriel'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON chat_app.* TO 'gabriel'@'localhost';
   ```

2. **Enable database in main.go:**
   ```go
   // Uncomment these lines:
   dsn := "gabriel:password@tcp(localhost:3306)/chat_app?parseTime=true"
   internal.InitDB(dsn)
   ```

## Usage

### Chat Modes

#### Global Chat (Default)
- Public messaging visible to all connected users
- No encryption - messages sent in plain text
- Real-time delivery to everyone
- Good for group discussions

#### Private Chat
- End-to-end encrypted messages between two users
- Select recipient from online users list
- Secure communication only sender and recipient can read
- Good for private conversations

### Getting Started

1. Enter your username when prompted
2. Wait for key generation to complete
3. Choose your chat mode:
   - **Global**: Type and press Enter - everyone sees your message
   - **Private**: Click "Private" button, select recipient, then type message
4. Switch modes anytime using the Global/Private buttons

## Configuration

### Environment Variables

```bash
# Database connection (optional)
DB_DSN="username:password@tcp(localhost:3306)/database_name"

# Server port (default: 8080)
PORT=8080
```

### Browser Requirements

- Chrome 37+
- Firefox 34+
- Safari 7+
- Edge 12+

## Security Notes

### Current Security Features

- Private keys never transmitted over network
- End-to-end message encryption
- Public key integrity maintained by server
- Non-extractable private keys in browser

### Limitations

- No user authentication (anyone can claim any username)
- No message forward secrecy
- Server can see message metadata (sender, recipient, timestamp)
- No protection against replay attacks

## Project Structure

```

chat-app/
├── main.go              # Main server application
├── internal/
│   ├── client.go        # WebSocket client handling
│   ├── manager.go       # Connection and message management
│   ├── database.go      # Database operations
│   └── message.go       # Message data structures
├── static/
│   ├── index.html       # Main chat interface
│   ├── scripts.js       # Client-side application logic
│   └── test.html        # Testing interface
└── go.mod               # Go module dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Use responsibly and ensure compliance with applicable laws.

---

**Security Notice**: This is a demonstration application. For production use, conduct a security audit and implement additional security measures.

````
```

## Development Status

### Completed Features

- [x] Browser-based RSA key generation
- [x] End-to-end message encryption
- [x] Real-time WebSocket communication
- [x] User presence management
- [x] Private messaging system
- [x] Modern web interface
- [x] Message display and UI

### In Progress

- [ ] User authentication system
- [ ] Message persistence (database integration)
- [ ] Error handling improvements
- [ ] Mobile-responsive design

### Planned Features

- [ ] Group chat functionality
- [ ] File sharing with encryption
- [ ] Message status indicators
- [ ] Push notifications
- [ ] Advanced security features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Use responsibly and ensure compliance with applicable laws and regulations regarding encryption software.

---

** Important Security Notice**: This is a demonstration application. For production use, conduct a thorough security audit and implement additional security measures as needed.
