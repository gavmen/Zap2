package internal

import (
	// "chat-app/db"
	"fmt"
	// "log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Socket *websocket.Conn
	Send   chan []byte
	User   string
}

func (c *Client) Read() {
	// defer func() {
	//     Manager.Unregister <- c
	//     c.Socket.Close()
	// }()

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
			break
		}
		Manager.Broadcast <- message
		// fmt.Println("Received message from", c.User, ":", string(message))
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
