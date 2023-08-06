const socket = new WebSocket("ws://localhost:8080/ws");
console.log("WebSocket state:", socket.readyState);

socket.onopen = () => {
    console.log("WebSocket is now open.");
};

socket.onclose = (event) => {
    console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
};
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    displayMessage(message.sender + ": " + message.content);
};

sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (message) {
        setTimeout(() => {
            sendMessage(message);
            messageInput.value = "";
        }, 100);
    }
});

function displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
}

function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ sender: "You", content: message }));
    } else {
        console.log("WebSocket is not in the OPEN state.");
    }
}

window.addEventListener("beforeunload", () => {
    socket.close();
});

socket.onopen = () => {
    console.log("WebSocket is now open.");
};

socket.onclose = (event) => {
    console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
};

sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (message) {
        console.log("Sending message...");
        sendMessage(message);
        messageInput.value = "";
    }
});