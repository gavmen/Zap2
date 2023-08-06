const userId = prompt("Enter your username:");
const socket = new WebSocket(`ws://${window.location.host}/ws?user=${encodeURIComponent(userId)}`);
console.log("WebSocket state:", socket.readyState);

socket.onopen = () => {
    console.log("WebSocket is now open.");
};

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

socket.onmessage = (event) => {
    if (event.data === "pong") {
        console.log("Received pong from server.");
        return;
    }

    const message = JSON.parse(event.data);
    displayMessage(message);
};

function displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message.sender + ": " + message.content;
    chatBox.appendChild(messageElement);
}

function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ sender: userId, content: message })); // Use userId here
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
