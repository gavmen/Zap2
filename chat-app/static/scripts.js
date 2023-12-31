const userId = prompt("Enter your username:");
const socket = new WebSocket(`ws://${window.location.host}/ws?user=${encodeURIComponent(userId)}`);
console.log("WebSocket state:", socket.readyState);

socket.onopen = () => {
    console.log("WebSocket is now open.");
};

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

let publicKey, privateKey;

async function fetchAndStoreKeys() {
    try {
        const response = await fetch('http://localhost:5202/encryption/rsa-keys');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        publicKey = data.publicKey;
        privateKey = data.privateKey;
        console.log("Keys fetched successfully!");
        console.log("Server response:", data);
        console.log(truncate("Public: " + publicKey, 50));
        console.log(truncate("Private: " + privateKey, 50));
    } catch (error) {
        console.error('Error fetching the keys:', error.message);
    }
}

fetchAndStoreKeys();

async function encryptMessage(message) {
    try {
        console.log("Encrypting message with data:", {
            PlainText: message,
            PublicKey: publicKey
        });

        const response = await fetch('http://localhost:5202/encryption/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                PlainText: message,
                PublicKey: publicKey
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(truncate('-1:' + data.encryptedText, 50));
        console.log(truncate('-2:' + data.encryptedSymmetricKey, 50));
        return { encryptedText: data.encryptedText, encryptedSymmetricKey: data.encryptedSymmetricKey};
    } catch (error) {
        console.error('Error encrypting the message:', error.message);
    }
}

async function decryptMessage(encryptedText, encryptedSymmetricKey) {
    console.log(truncate('0:' + encryptedSymmetricKey, 50))
    try {
        const response = await fetch('http://localhost:5202/encryption/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                CipherText: encryptedText,
                EncryptedSymmetricKey: encryptedSymmetricKey,
                PrivateKey: privateKey
            })
        });
        console.log(truncate('1:' + encryptedText, 50))
        console.log(truncate('2:' + encryptedSymmetricKey, 50))
        console.log(truncate('3:' + privateKey, 50))
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const decryptedText = await response.text();
        return decryptedText;
    } catch (error) {
        console.error('Error decrypting the message:', error.message);
    }
}

socket.onmessage = async (event) => {
    if (event.data === "pong") {
        console.log("Received pong from server.");
        return;
    }

    const encryptedMessage = JSON.parse(event.data);
    const decryptedMessageContent = await decryptMessage(encryptedMessage.content, encryptedMessage.encryptedSymmetricKey);
    displayMessage({ sender: encryptedMessage.sender, content: decryptedMessageContent });
};

function displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message.sender + ": " + message.content;
    chatBox.appendChild(messageElement);
}

async function sendMessage(message) {
    console.log("WebSocket state before sending:", socket.readyState);

    if (socket.readyState === WebSocket.OPEN) {
        const encryptedData = await encryptMessage(message);
        
        if (!encryptedData || !encryptedData.encryptedText) {
            console.error("Failed to send encrypted message: Encryption failed.");
            return;
        }

        socket.send(JSON.stringify({ 
            sender: userId, 
            content: encryptedData.encryptedText, 
            encryptedSymmetricKey: encryptedData.encryptedSymmetricKey 
        }));

        console.log("Message sent!");
        console.log("User ID:", userId);
        console.log("Encrypted Message:", encryptedData.encryptedText);
    } else {
        console.log("WebSocket is not in the OPEN state.");
    }
}



sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (message) {
        console.log("Sending message...");
        sendMessage(message);
        messageInput.value = "";
    }
});

socket.onclose = (event) => {
    console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
};
