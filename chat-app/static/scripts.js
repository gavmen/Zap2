const socket = new WebSocket("ws://localhost:8080/ws");
console.log("WebSocket state:", socket.readyState);
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
        sendMessage(message);
        messageInput.value = "";
    }
});

function displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
}

function sendMessage(message) {
    socket.send(JSON.stringify({ sender: "You", content: message }));
}
