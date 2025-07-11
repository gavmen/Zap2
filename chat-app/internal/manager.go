package internal

import (
	// "log"
	"encoding/json"
	"fmt"
)

type manager struct {
	Clients       map[*Client]bool
	UserClients   map[string]*Client // Changed to store a single client per user for simplicity
	Broadcast     chan []byte
	Register      chan *Client
	Unregister    chan *Client
	HandleMessage chan *MessageData
}

var Manager = manager{
	Clients:       make(map[*Client]bool),
	Broadcast:     make(chan []byte),
	UserClients:   make(map[string]*Client), // Changed to store a single client per user
	Register:      make(chan *Client),
	Unregister:    make(chan *Client),
	HandleMessage: make(chan *MessageData),
}

func (m *manager) Start() {
	for {
		select {
		case client := <-m.Register:
			// Check if username is already taken
			if existingClient, exists := m.UserClients[client.User]; exists {
				// Send error message to the new client
				errorMsg := map[string]interface{}{
					"type":    "error",
					"message": "Username is already taken. Please choose a different username.",
				}
				if errorData, err := json.Marshal(errorMsg); err == nil {
					select {
					case client.Send <- errorData:
					default:
					}
				}
				close(client.Send)
				fmt.Printf("Registration rejected for user %s: username already taken\n", client.User)
				continue
			}

			m.Clients[client] = true
			m.UserClients[client.User] = client // Store the client instance
			fmt.Println("Registered client:", client.User)
			
			// Send success confirmation
			successMsg := map[string]interface{}{
				"type":    "registration_success",
				"message": "Successfully connected to chat",
			}
			if successData, err := json.Marshal(successMsg); err == nil {
				select {
				case client.Send <- successData:
				default:
				}
			}
			
			m.broadcastUserList()

		case client := <-m.Unregister:
			if _, ok := m.Clients[client]; ok {
				close(client.Send)
				delete(m.Clients, client)
				delete(m.UserClients, client.User)
				fmt.Println("Unregistered client:", client.User)
				m.broadcastUserList()
			}
		case message := <-m.Broadcast:
			for client := range m.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(m.Clients, client)
				}
			}
		case messageData := <-m.HandleMessage:
			m.handleStructuredMessage(messageData)
		}
	}
}

// BroadcastToUser sends a message to a specific user.
func (m *manager) BroadcastToUser(user string, message []byte) {
	if client, ok := m.UserClients[user]; ok {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(m.Clients, client)
			delete(m.UserClients, user)
		}
	}
}

func (m *manager) broadcastUserList() {
	users := make([]string, 0, len(m.UserClients))
	for user := range m.UserClients {
		users = append(users, user)
	}
	
	userListMessage := map[string]interface{}{
		"type":  "userList",
		"users": users,
	}
	
	messageBytes, err := json.Marshal(userListMessage)
	if err != nil {
		fmt.Println("Error marshaling user list:", err)
		return
	}
	
	// Broadcast to all clients
	for client := range m.Clients {
		select {
		case client.Send <- messageBytes:
		default:
			close(client.Send)
			delete(m.Clients, client)
		}
	}
}

func (m *manager) handleStructuredMessage(messageData *MessageData) {
	msgType, ok := messageData.Message["type"].(string)
	if !ok {
		fmt.Println("Message missing type field")
		return
	}
	
	switch msgType {
	case "privateMessage":
		m.handlePrivateMessage(messageData)
	case "globalMessage":
		m.handleGlobalMessage(messageData)
	default:
		fmt.Println("Unknown message type:", msgType)
	}
}

func (m *manager) handlePrivateMessage(messageData *MessageData) {
	recipient, ok := messageData.Message["recipient"].(string)
	if !ok {
		fmt.Println("Private message missing recipient")
		return
	}
	
	encryptedContent, ok := messageData.Message["encryptedContent"].(string)
	if !ok {
		fmt.Println("Private message missing encrypted content")
		return
	}
	
	// Create the message to send to recipient
	privateMessage := map[string]interface{}{
		"type":             "privateMessage",
		"sender":           messageData.Client.User,
		"encryptedContent": encryptedContent,
	}
	
	messageBytes, err := json.Marshal(privateMessage)
	if err != nil {
		fmt.Println("Error marshaling private message:", err)
		return
	}
	
	// Send to specific recipient
	m.BroadcastToUser(recipient, messageBytes)
	
	fmt.Printf("Private message sent from %s to %s\n", messageData.Client.User, recipient)
}

func (m *manager) handleGlobalMessage(messageData *MessageData) {
	content, ok := messageData.Message["content"].(string)
	if !ok {
		fmt.Println("Global message missing content")
		return
	}
	
	// Create the global message to broadcast to all users
	globalMessage := map[string]interface{}{
		"type":      "globalMessage",
		"sender":    messageData.Client.User,
		"content":   content,
		"timestamp": messageData.Message["timestamp"],
	}
	
	messageBytes, err := json.Marshal(globalMessage)
	if err != nil {
		fmt.Println("Error marshaling global message:", err)
		return
	}
	
	// Broadcast to all clients
	for client := range m.Clients {
		select {
		case client.Send <- messageBytes:
		default:
			close(client.Send)
			delete(m.Clients, client)
		}
	}
	
	fmt.Printf("Global message sent from %s: %s\n", messageData.Client.User, content)
}

// GetPublicKeyForUser retrieves the public key for a given user.
func (m *manager) GetPublicKeyForUser(user string) (string, bool) {
	if client, ok := m.UserClients[user]; ok {
		return client.PublicKey, true
	}
	return "", false
}
