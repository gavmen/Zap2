let userId = null;
let userPublicKey, userPrivateKey;
let socket;

// Username validation function
function validateUsername(username) {
    const errors = [];
    
    if (!username || username.trim() === '') {
        errors.push('Username is required');
    } else {
        const trimmed = username.trim();
        
        if (trimmed.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (trimmed.length > 20) {
            errors.push('Username must be no more than 20 characters long');
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
        
        if (/^\d+$/.test(trimmed)) {
            errors.push('Username cannot be only numbers');
        }
    }
    
    return errors;
}

// Show error message in modal
function showUsernameError(message) {
    const errorElement = document.getElementById('username-error');
    const inputElement = document.getElementById('username-input');
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    inputElement.classList.add('error');
    
    // Remove error styling after a delay
    setTimeout(() => {
        inputElement.classList.remove('error');
    }, 2000);
}

// Hide error message
function hideUsernameError() {
    const errorElement = document.getElementById('username-error');
    const inputElement = document.getElementById('username-input');
    
    errorElement.style.display = 'none';
    inputElement.classList.remove('error');
}

// Join chat function called from modal
async function joinChat() {
    const usernameInput = document.getElementById('username-input');
    const joinButton = document.getElementById('join-button');
    const loading = document.getElementById('loading');
    
    const username = usernameInput.value.trim();
    
    // Validate username
    const errors = validateUsername(username);
    if (errors.length > 0) {
        showUsernameError(errors[0]);
        return;
    }
    
    // Show loading state
    hideUsernameError();
    joinButton.disabled = true;
    loading.style.display = 'block';
    
    try {
        // Set the userId
        userId = username;
        
        // Update current username display
        document.getElementById('current-username').textContent = userId;
        
        // Initialize the chat application
        await initialize();
        
        // Hide modal and show chat
        document.getElementById('username-modal').style.display = 'none';
        document.getElementById('chat-app').style.display = 'block';
        
        // Focus on message input
        document.getElementById('message-input').focus();
        
    } catch (error) {
        console.error('Error joining chat:', error);
        showUsernameError('Failed to connect to chat. Please try again.');
        joinButton.disabled = false;
        loading.style.display = 'none';
    }
}

// Handle Enter key in username input
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username-input');
    
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinChat();
        }
    });
    
    // Clear error when user starts typing
    usernameInput.addEventListener('input', function() {
        hideUsernameError();
    });
    
    // Focus on username input when page loads
    usernameInput.focus();
});

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Desktop notifications enabled');
        }
    });
}

// Generate RSA keys and establish WebSocket connection
async function initialize() {
    try {
        // Generate key pair with extractable public key but non-extractable private key
        const publicKeyParams = {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        };
        
        const keyPair = await window.crypto.subtle.generateKey(
            publicKeyParams,
            true, // extractable - we need to export the public key
            ["encrypt", "decrypt"]
        );

        // Export the public key to be sent to the server
        const publicKeyData = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        userPublicKey = btoa(String.fromCharCode.apply(null, new Uint8Array(publicKeyData)));
        
        // Import the private key as non-extractable for security
        const privateKeyData = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
        userPrivateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            privateKeyData,
            publicKeyParams,
            false, // non-extractable for security
            ["decrypt"]
        );

        console.log("Keys generated successfully!");
        console.log("Public Key:", userPublicKey);

        // Now, establish the WebSocket connection with the public key
        socket = new WebSocket(`ws://${window.location.host}/ws?user=${encodeURIComponent(userId)}&publicKey=${encodeURIComponent(userPublicKey)}`);
        
        socket.onopen = () => {
            console.log("WebSocket is now open.");
            
            // Show welcome message explaining chat modes
            setTimeout(() => {
                displayMessage("System", "Welcome! You're in Global Chat mode - everyone can see your messages. Click 'Private' to send encrypted messages to specific users.", "notification");
            }, 1000);
        };

        socket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'userList') {
                    updateUserList(data.users);
                } else if (data.type === 'privateMessage') {
                    await handleIncomingMessage(data);
                } else if (data.type === 'globalMessage') {
                    handleGlobalMessage(data);
                } else if (data.type === 'notification') {
                    displayNotification(data.message);
                } else if (data.type === 'error') {
                    handleServerError(data.message);
                } else if (data.type === 'registration_success') {
                    console.log('Registration successful:', data.message);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                console.log("Received raw message:", event.data);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
            handleConnectionError("Connection to server lost");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            handleConnectionError("Failed to connect to server");
        };

    } catch (error) {
        console.error('Error during initialization:', error);
        throw error; // Re-throw so the modal can handle it
    }
}

// Limit chars on logs (to delete) //////
function truncate(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength) + '...';
}
/////////////////////////////////////////

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const recipientInput = document.getElementById("recipient-input");

// Add Enter key support for message input
messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendButton.click();
    }
});

// Add Enter key support for recipient input (switches to message input)
recipientInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        messageInput.focus();
    }
});

// Remove the old key fetching and encryption/decryption functions
// We will replace them with new browser-based crypto functions

async function getRecipientPublicKey(recipientId) {
    try {
        const response = await fetch(`/publicKey?user=${encodeURIComponent(recipientId)}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        return data.publicKey;
    } catch (error) {
        console.error('Error fetching recipient public key:', error);
        return null;
    }
}

sendButton.addEventListener("click", async () => {
    const message = messageInput.value.trim();

    if (!message) {
        alert("Please enter a message.");
        messageInput.focus();
        return;
    }
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("Not connected to server. Please refresh the page.");
        return;
    }

    // Disable send button during operation
    sendButton.disabled = true;
    sendButton.textContent = "Sending...";

    try {
        if (isPrivateMode) {
            // Private message mode
            await sendPrivateMessage(message);
        } else {
            // Global message mode
            await sendGlobalMessage(message);
        }
        
        // Clear the message input
        messageInput.value = "";
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message: ' + error.message);
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
        sendButton.textContent = "Send";
        messageInput.focus();
    }
});

// Utility Functions for Encryption/Decryption
async function importPublicKey(publicKeyString) {
    try {
        const keyData = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));
        return await window.crypto.subtle.importKey(
            "spki",
            keyData,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            false,
            ["encrypt"]
        );
    } catch (error) {
        console.error('Error importing public key:', error);
        throw new Error('Failed to import public key');
    }
}

async function encryptMessage(message, publicKey) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            data
        );
        return btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted)));
    } catch (error) {
        console.error('Error encrypting message:', error);
        throw new Error('Failed to encrypt message');
    }
}

async function decryptMessage(encryptedMessage) {
    try {
        const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            userPrivateKey,
            encryptedData
        );
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error('Error decrypting message:', error);
        throw new Error('Failed to decrypt message');
    }
}

// UI Management Functions
function displayMessage(sender, message, type = 'received') {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="sender">${sender}</span>
            <span class="time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${message}</div>
    `;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displayNotification(message) {
    const chatBox = document.getElementById("chat-box");
    const notificationElement = document.createElement("div");
    notificationElement.className = "notification";
    notificationElement.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    chatBox.appendChild(notificationElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateUserList(users) {
    const userListElement = document.getElementById("user-list");
    userListElement.innerHTML = "<h3>Online Users:</h3>";
    
    users.forEach(user => {
        if (user !== userId) { // Don't show ourselves
            const userElement = document.createElement("div");
            userElement.className = "user-item";
            userElement.textContent = user;
            userElement.onclick = () => selectRecipient(user);
            userListElement.appendChild(userElement);
        }
    });
}

function selectRecipient(username) {
    // Switch to private mode when selecting a recipient
    switchToPrivateMode();
    
    const recipientInput = document.getElementById("recipient-input");
    recipientInput.value = username;
    
    // Visual feedback
    const userItems = document.querySelectorAll(".user-item");
    userItems.forEach(item => item.classList.remove("selected"));
    event.target.classList.add("selected");
    
    // Focus message input
    document.getElementById("message-input").focus();
}

async function handleIncomingMessage(data) {
    try {
        if (!data.sender || !data.encryptedContent) {
            console.error('Invalid message data:', data);
            displayMessage('System', '[Invalid message received]', 'error');
            return;
        }
        
        const decryptedMessage = await decryptMessage(data.encryptedContent);
        displayMessage(`${data.sender} → You`, decryptedMessage, 'received');
        
        // Optional: Play notification sound or show desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${data.sender}`, {
                body: decryptedMessage.substring(0, 50) + (decryptedMessage.length > 50 ? '...' : ''),
                icon: '/favicon.ico'
            });
        }
        
    } catch (error) {
        console.error('Error handling incoming message:', error);
        displayMessage(`${data.sender} → You`, '[Unable to decrypt message - key mismatch or corruption]', 'error');
    }
}

// Chat mode management
let isPrivateMode = false;

function switchToGlobalMode() {
    isPrivateMode = false;
    
    // Update UI
    document.getElementById('global-mode-btn').classList.add('active');
    document.getElementById('private-mode-btn').classList.remove('active');
    document.getElementById('chat-title').textContent = 'Global Chat';
    document.getElementById('recipient-input').style.display = 'none';
    document.getElementById('message-input').placeholder = 'Type a message to everyone...';
    document.getElementById('input-container').classList.remove('private-mode');
    
    // Update mode indicator
    const indicator = document.getElementById('mode-indicator');
    indicator.textContent = 'Global Chat - Everyone can see your messages';
    indicator.className = 'mode-indicator global';
    
    // Focus message input
    document.getElementById('message-input').focus();
}

function switchToPrivateMode() {
    isPrivateMode = true;
    
    // Update UI
    document.getElementById('private-mode-btn').classList.add('active');
    document.getElementById('global-mode-btn').classList.remove('active');
    document.getElementById('chat-title').textContent = 'Private Chat';
    document.getElementById('recipient-input').style.display = 'block';
    document.getElementById('message-input').placeholder = 'Type a private message...';
    document.getElementById('input-container').classList.add('private-mode');
    
    // Update mode indicator
    const indicator = document.getElementById('mode-indicator');
    indicator.textContent = 'Private Chat - Only the recipient can see your messages';
    indicator.className = 'mode-indicator private';
    
    // Focus recipient input
    document.getElementById('recipient-input').focus();
}

async function sendGlobalMessage(message) {
    // Send global message (unencrypted, visible to everyone)
    const messageData = {
        type: 'globalMessage',
        content: message,
        sender: userId,
        timestamp: Date.now()
    };
    
    socket.send(JSON.stringify(messageData));
    
    // Display the sent message in our chat
    displayMessage(`You`, message, 'global');
}

async function sendPrivateMessage(message) {
    const recipient = recipientInput.value.trim();
    
    if (!recipient) {
        alert("Please select or enter a recipient.");
        recipientInput.focus();
        throw new Error("No recipient specified");
    }
    
    if (recipient === userId) {
        alert("You cannot send a message to yourself.");
        throw new Error("Cannot send to self");
    }
    
    const recipientPublicKeyString = await getRecipientPublicKey(recipient);
    if (!recipientPublicKeyString) {
        alert(`Could not retrieve public key for "${recipient}". Make sure they are online.`);
        throw new Error("Recipient public key not found");
    }

    // 1. Import the recipient's public key
    const recipientPublicKey = await importPublicKey(recipientPublicKeyString);
    
    // 2. Encrypt the message
    const encryptedMessage = await encryptMessage(message, recipientPublicKey);
    
    // 3. Send via WebSocket
    const messageData = {
        type: 'privateMessage',
        recipient: recipient,
        encryptedContent: encryptedMessage,
        sender: userId,
        timestamp: Date.now()
    };
    
    socket.send(JSON.stringify(messageData));
    
    // Display the sent message in our chat
    displayMessage(`You → ${recipient}`, message, 'sent');
}

function handleGlobalMessage(data) {
    if (!data.sender || !data.content) {
        console.error('Invalid global message data:', data);
        return;
    }
    
    // Don't display our own messages again (already displayed when sent)
    if (data.sender !== userId) {
        displayMessage(data.sender, data.content, 'global');
        
        // Optional: Show notification for global messages
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${data.sender} in Global Chat`, {
                body: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
                icon: '/favicon.ico'
            });
        }
    }
}

// Handle server error messages
function handleServerError(message) {
    console.error('Server error:', message);
    
    // If we're still in the modal (registration phase), show error in modal
    const modal = document.getElementById('username-modal');
    if (modal && modal.style.display !== 'none') {
        showUsernameError(message);
        
        // Re-enable the join button and hide loading
        const joinButton = document.getElementById('join-button');
        const loading = document.getElementById('loading');
        if (joinButton) joinButton.disabled = false;
        if (loading) loading.style.display = 'none';
    } else {
        // If we're in the chat, show as a system message
        displayMessage("System", `Error: ${message}`, "error");
    }
}

// Handle connection errors
function handleConnectionError(message) {
    console.error('Connection error:', message);
    
    // If we're still in the modal (registration phase), show error in modal
    const modal = document.getElementById('username-modal');
    if (modal && modal.style.display !== 'none') {
        showUsernameError(message);
        
        // Re-enable the join button and hide loading
        const joinButton = document.getElementById('join-button');
        const loading = document.getElementById('loading');
        if (joinButton) joinButton.disabled = false;
        if (loading) loading.style.display = 'none';
    } else {
        // If we're in the chat, show as a system message
        displayMessage("System", message, "error");
    }
}
