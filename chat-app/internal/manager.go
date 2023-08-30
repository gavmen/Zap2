package internal

import (
	// "log"
	"fmt"
)

type manager struct {
	Clients     map[*Client]bool
	UserClients map[string]map[*Client]bool
	Broadcast   chan []byte
	Register    chan *Client
	Unregister  chan *Client
}

var Manager = manager{
	Clients:     make(map[*Client]bool),
	Broadcast:   make(chan []byte),
	UserClients: make(map[string]map[*Client]bool),
	Register:    make(chan *Client),
	Unregister:  make(chan *Client),
}

func (m *manager) Start() {
	for {
		select {
		case client := <-m.Register:
			m.Clients[client] = true

			if _, ok := m.UserClients[client.User]; !ok {
				m.UserClients[client.User] = make(map[*Client]bool)
			}
			m.UserClients[client.User][client] = true
			fmt.Println("Registered client:", client.User)
		case client := <-m.Unregister:
			if _, ok := m.Clients[client]; ok {
				close(client.Send)
				delete(m.Clients, client)

				if userClients, ok := m.UserClients[client.User]; ok {
					delete(userClients, client)
					if len(userClients) == 0 {
						delete(m.UserClients, client.User)
					}
				}
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
		}
	}
}

func (m *manager) BroadcastToUser(user string, message []byte) {
	if userClients, ok := m.UserClients[user]; ok {
		for client := range userClients {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(userClients, client)
			}
		}
		if len(userClients) == 0 {
			delete(m.UserClients, user)
		}
	}
}

// func (m *manager) GetUsers() []string {
//     users := make([]string, 0, len(m.UserClients))
//     for user := range m.UserClients {
//         users = append(users, user)
//     }
//     return users
// }
