
# Secure Chat Application

A real-time, end-to-end encrypted chat application built with Go, WebSockets, and browser-based cryptography.

## 🔐 Security Features

- **End-to-End Encryption**: Private messages are encrypted in the browser using RSA-OAEP
- **Global Chat**: Unencrypted public messages visible to all users
- **Dual Mode Messaging**: Switch between global and private chat modes
- **Secure Key Management**: Private keys never leave the client's browser
- **Non-Exportable Private Keys**: Private keys are marked as non-extractable for maximum security
- **Public Key Distribution**: Secure exchange of public keys via the server

## 🏗️ Architecture

### Components

1. **Go WebSocket Server** (`chat-app/`): Handles real-time messaging and user management
2. **Browser-Based Encryption**: All cryptographic operations performed in the browser
3. **MySQL Database** (optional): Message persistence and user data
4. **Static Frontend**: Modern HTML5/CSS3/JavaScript interface

### Security Model

1. **Key Generation**: RSA-2048 key pairs generated in browser using `window.crypto.subtle`
2. **Global Messages**: Unencrypted messages sent to all users for public conversation
3. **Private Messages**: Messages encrypted with recipient's public key for secure communication
4. **Mode Switching**: Users can switch between global and private chat modes
5. **Public Key Exchange**: Server facilitates public key distribution without handling private keys

## 🚀 Setup & Running

### Prerequisites

- Go 1.18+ installed
- MySQL server (optional, for message persistence)
- Modern web browser with WebCrypto API support

### Quick Start (Without Database)

1. **Clone and navigate to the project:**
   ```bash
   cd chat-app
   ```

2. **Install Go dependencies:**
   ```bash
   go mod tidy
   ```

3. **Start the server:**
   ```bash
   go run main.go
   ```

4. **Open your browser:**
   - Main chat: http://localhost:8080
   - Test page: http://localhost:8080/test.html

### Full Setup (With Database)

1. **Setup MySQL:**
   ```sql
   CREATE DATABASE chat_app;
   CREATE USER 'gabriel'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON chat_app.* TO 'gabriel'@'localhost';
   ```

2. **Uncomment database initialization in `main.go`:**
   ```go
   // Remove comments from these lines:
   dsn := "gabriel:password@tcp(localhost:3306)/chat_app?parseTime=true"
   internal.InitDB(dsn)
   ```

3. **Start MySQL and run the server:**
   ```bash
   sudo service mysql start  # Linux/WSL
   go run main.go
   ```

## 🧪 Testing

### Test Page Features

Visit http://localhost:8080/test.html to test:

1. **Key Generation**: Verify RSA key pair creation
2. **WebSocket Connection**: Test real-time connectivity
3. **Encryption/Decryption**: Verify end-to-end encryption
4. **Public Key Retrieval**: Test key exchange mechanism

### Manual Testing

1. **Open multiple browser windows/tabs**
2. **Enter different usernames** when prompted
3. **Select recipients** from the user list
4. **Send encrypted messages** between users

## 💬 Usage

### Chat Modes

The application supports two chat modes:

#### 🌐 Global Chat Mode (Default)
- **Public messaging** where everyone can see your messages
- **No encryption** - messages are sent in plain text
- **Real-time delivery** to all connected users
- **Perfect for group discussions** and general conversation

#### 🔒 Private Chat Mode
- **End-to-end encrypted** messages between two users
- **Select recipient** from the online users list
- **Secure communication** that only sender and recipient can read
- **Perfect for sensitive conversations**

### Starting a Chat

1. **Enter your username** when prompted
2. **Wait for key generation** (automatic)
3. **Choose your chat mode:**
   - **Global**: Start typing and press Enter - everyone sees your message
   - **Private**: Click "Private" button, select a recipient from user list, then type your message

### Switching Between Modes

- **Global Mode**: Click the "Global" button or start typing in the default interface
- **Private Mode**: Click the "Private" button or click on any username in the user list
- **Quick Switch**: Click on any online user to automatically switch to private mode with them selected

### Features

- **Dual Chat Modes** - Global public chat and private encrypted messaging
- **Real-time messaging** with WebSocket connectivity
- **User presence** - see who's online
- **Mode switching** - easily switch between global and private modes
- **Message history** - view conversation in chat box
- **Visual indicators** - clear UI showing current chat mode
- **Click-to-chat** - click any username to start private conversation
- **Encryption status** - visual feedback for security operations

## 🔧 Configuration

### Environment Variables

```bash
# Database connection (if using database)
DB_DSN="username:password@tcp(localhost:3306)/database_name"

# Server port (default: 8080)
PORT=8080
```

### Browser Compatibility

Requires browsers with WebCrypto API support:
- Chrome 37+
- Firefox 34+
- Safari 7+
- Edge 12+

## 🛡️ Security Considerations

### ✅ What's Secure

- Private keys never transmitted over network
- Messages encrypted end-to-end
- Public key integrity maintained by server
- Non-extractable private keys

### ⚠️ Current Limitations

- No user authentication (anyone can claim any username)
- No message forward secrecy
- Server can see message metadata (sender, recipient, timestamp)
- No protection against replay attacks

### 🔮 Future Security Enhancements

- User authentication system
- Perfect Forward Secrecy (PFS)
- Message authenticity verification
- Rate limiting and abuse prevention

## 📁 Project Structure

```
Zap2/
├── chat-app/
│   ├── main.go              # Main server application
│   ├── internal/
│   │   ├── client.go        # WebSocket client handling
│   │   ├── manager.go       # Connection and message management
│   │   ├── database.go      # Database operations
│   │   └── message.go       # Message data structures
│   ├── static/
│   │   ├── index.html       # Main chat interface
│   │   ├── scripts.js       # Client-side application logic
│   │   └── test.html        # Testing and debugging interface
│   └── go.mod               # Go module dependencies
├── EncryptionAPI/           # Legacy C# API (deprecated)
└── README.md                # This file
```

## 🚧 Development Status

### ✅ Completed Features

- [x] Browser-based RSA key generation
- [x] End-to-end message encryption
- [x] Real-time WebSocket communication
- [x] User presence management
- [x] Private messaging system
- [x] Modern web interface
- [x] Message display and UI

### 🔄 In Progress

- [ ] User authentication system
- [ ] Message persistence (database integration)
- [ ] Error handling improvements
- [ ] Mobile-responsive design

### 📋 Planned Features

- [ ] Group chat functionality
- [ ] File sharing with encryption
- [ ] Message status indicators
- [ ] Push notifications
- [ ] Advanced security features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes. Use responsibly and ensure compliance with applicable laws and regulations regarding encryption software.

---

**⚠️ Important Security Notice**: This is a demonstration application. For production use, conduct a thorough security audit and implement additional security measures as needed.
