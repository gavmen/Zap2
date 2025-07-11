package internal

import (
	// "chat-app/db"
	"encoding/json"
	"fmt"
	// "log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Socket    *websocket.Conn
	Send      chan []byte
	User      string
	PublicKey string
}

type MessageData struct {
	Client  *Client
	Message map[string]interface{}
}

func (c *Client) Read() {
	defer func() {
		Manager.Unregister <- c
		c.Socket.Close()
	}()

	// rows, err := db.Db.Query("SELECT content FROM messages WHERE user = ?", c.User)
	// if err != nil {
	//     log.Println("Failed to query messages:", err)
	//     return
	// }
	// defer rows.Close()

	// for rows.Next() {
	//     var content string
	//     if err := rows.Scan(&content); err != nil {
	//         log.Println("Failed to scan row:", err)
	//         continue
	//     }
	//     c.Send <- []byte(content)
	//     fmt.Println("Sent message to", c.User, ":", content)
	// }

	for {
		_, message, err := c.Socket.ReadMessage()
		if err != nil {
			Manager.Unregister <- c
			break
		}
		
		// Try to parse as JSON message
		var msgData map[string]interface{}
		if err := json.Unmarshal(message, &msgData); err == nil {
			// Handle structured message
			Manager.HandleMessage <- &MessageData{
				Client:  c,
				Message: msgData,
			}
		} else {
			// Fallback: treat as plain text broadcast
			Manager.Broadcast <- message
		}
	}
}

func (c *Client) Write() {
	defer func() {
		c.Socket.Close()
		fmt.Println("WebSocket connection closed for user:", c.User)
	}()

	for message := range c.Send {
		// fmt.Println("Sending message to", c.User, ":", string(message))

		err := c.Socket.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			fmt.Println("Error sending message to", c.User, ":", err)
			break
		}
	}
	fmt.Println("Write function finished for user:", c.User)
}
