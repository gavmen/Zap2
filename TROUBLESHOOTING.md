# Troubleshooting Guide

## Common Issues and Solutions

### 🔧 Server Won't Start

**Problem**: `go: command not found` or similar error
**Solution**: 
- Install Go 1.18+ from https://golang.org/dl/
- Make sure Go is in your system PATH
- On Windows: Use `start.bat` 
- On Linux/macOS: Use `start.sh` or `bash start.sh`

**Problem**: `Failed to connect to database`
**Solution**: 
- Database is optional for basic functionality
- To enable database: Uncomment database initialization lines in `main.go`
- Setup MySQL and create database `chat_app`

### 🌐 Browser Issues

**Problem**: "Failed to generate keys" error
**Solution**:
- Use a modern browser (Chrome 37+, Firefox 34+, Safari 7+, Edge 12+)
- Make sure you're accessing via `http://localhost:8080` (not file://)
- Check browser console for detailed error messages

**Problem**: WebSocket connection fails
**Solution**:
- Check if server is running on port 8080
- Verify no firewall blocking the connection
- Try refreshing the page
- Check browser console for WebSocket errors

**Problem**: "User not found" when sending messages
**Solution**:
- Make sure the recipient user is online (visible in user list)
- Check exact spelling of username
- Usernames are case-sensitive

### 💬 Global Chat Issues

**Problem**: Global messages not appearing
**Solution**:
- Make sure you're in Global mode (check the green "Global" button is active)
- Verify WebSocket connection is established
- Check browser console for JavaScript errors
- Try refreshing the page and reconnecting

**Problem**: Can't switch between chat modes
**Solution**:
- Check that mode toggle buttons are responsive
- Verify JavaScript is enabled in browser
- Try refreshing the page if UI becomes unresponsive
- Check browser console for errors

**Problem**: Private messages appearing in global chat
**Solution**:
- This should not happen - indicates a bug
- Check that you've selected the correct chat mode
- Verify recipient is selected in Private mode
- Report this as a potential security issue

### 🔐 Encryption Issues

**Problem**: "Unable to decrypt message" 
**Solution**:
- This usually means the sender and recipient have different key pairs
- Both users should refresh their browsers to generate new keys
- Make sure both users are using the same application instance

**Problem**: Messages not appearing
**Solution**:
- Check browser console for JavaScript errors
- Verify WebSocket connection is established (should see "Connected to chat server")
- Make sure you've selected a recipient before sending

### 🧪 Testing Issues

**Problem**: Test page shows failures
**Solution**:
- Run tests in order (Key Generation → Connection → Encryption → Public Key Retrieval)
- If key generation fails, check browser compatibility
- If connection fails, verify server is running
- If encryption fails, try refreshing and generating new keys

### 📱 Mobile Issues

**Problem**: UI not responsive on mobile
**Solution**:
- The current UI is optimized for desktop
- Mobile improvements are planned for future updates
- Use landscape mode for better experience

## Performance Tips

### For Better Performance:

1. **Use Chrome or Firefox** for best WebCrypto performance
2. **Close unused tabs** to free up memory
3. **Keep messages under 1000 characters** for faster encryption
4. **Limit to 10-15 concurrent users** for optimal server performance

### For Development:

1. **Enable browser DevTools** to monitor console for errors
2. **Use the test page** (`/test.html`) to debug specific features
3. **Check server logs** in the terminal for Go-side debugging
4. **Monitor WebSocket traffic** in browser Network tab

## Advanced Configuration

### Environment Variables:

```bash
# Optional: Set custom port
export PORT=8080

# Optional: Set database DSN
export DB_DSN="user:pass@tcp(localhost:3306)/chat_app"
```

### Browser Developer Tools:

1. **Open DevTools** (F12)
2. **Check Console tab** for JavaScript errors
3. **Check Network tab** for WebSocket connection status
4. **Check Application tab** to verify no private keys are stored

## Getting Help

### Self-Diagnosis:

1. Open `/test.html` and run all tests
2. Check browser console for error messages
3. Verify server terminal output for Go errors
4. Try with a different browser

### Debug Information to Collect:

- Browser version and type
- Operating system
- Server error messages (from terminal)
- Browser console errors
- WebSocket connection status
- Test page results

## Security Notes

### ✅ Verify Security:

- Private keys should never appear in browser DevTools → Application → Storage
- Check that messages in Network tab are base64-encoded (encrypted)
- Verify only public keys are transmitted to server

### ⚠️ Security Warnings:

- Don't use in production without additional security audits
- Usernames are not authenticated (anyone can claim any name)
- Server can see message metadata (sender, recipient, timestamp)
- No protection against replay attacks in current version

## Quick Commands

### Start Server:
```bash
# Linux/macOS
cd chat-app && go run main.go

# Windows
cd chat-app && go run main.go
```

### Test Connectivity:
```bash
# Test if server responds
curl http://localhost:8080

# Test WebSocket endpoint (should return HTTP 400 - expected)
curl http://localhost:8080/ws
```

### Check Dependencies:
```bash
cd chat-app
go mod tidy
go mod verify
```
