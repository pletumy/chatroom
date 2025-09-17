package websocket

import (
	"time"
)

type Hub struct {
	// all connected clients
	clients    map[*Client]bool
	broadcast  chan *Message
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan *Message, 256),
		register:   make(chan *Client, 128),
		unregister: make(chan *Client, 128),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.broadcast <- &Message{
				Type:      MessageTypeSystem,
				Username:  client.username,
				Content:   client.username + " joined the chat",
				UsersList: h.getUserList(),
				Timestamp: time.Now().Unix(),
			}
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)

				h.broadcast <- &Message{
					Type:      MessageTypeSystem,
					Username:  client.username,
					Content:   client.username + " left the chat",
					UsersList: h.getUserList(),
				}
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) getUserList() []string {
	users := []string{}
	seen := make(map[string]struct{})
	for client := range h.clients {
		if _, ok := seen[client.username]; ok {
			continue
		}
		seen[client.username] = struct{}{}
		users = append(users, client.username)
	}
	return users
}
