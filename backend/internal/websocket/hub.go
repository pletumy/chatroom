package websocket

import (
	"fmt"
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
				Content:   fmt.Sprintf("%s joined", client.username),
				Timestamp: time.Now().Unix(),
			}
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
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

func (h *Hub) broadcastUserList() {
	users := []string{}
	for client := range h.clients {
		users = append(users, client.username)
	}

	for client := range h.clients {
		client.send <- &Message{
			Type:      MessageTypeUserList,
			Users:     users,
			Timestamp: time.Now().Unix(),
		}
	}
}
