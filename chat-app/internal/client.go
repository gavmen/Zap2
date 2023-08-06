package internal

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	Socket *websocket.Conn
	Send   chan []byte
	User   string
}

func (c *Client) Read() {
	defer func() {
		Manager.Unregister <- c
		c.Socket.Close()
	}()
	for {
		_, message, err := c.Socket.ReadMessage()
		if err != nil {
			break
		}
		Manager.Broadcast <- message
	}
}

func (c *Client) Write() {
	defer func() {
		c.Socket.Close()
	}()
	for message := range c.Send {
		err := c.Socket.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			break
		}
	}
}
