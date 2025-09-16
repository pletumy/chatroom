package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 1024 * 4
)

type Client struct {
	// represent single conn to the hub
	hub       *Hub
	conn      *websocket.Conn
	send      chan *Message
	username  string
	closeOnce sync.Once
}

// ReadDeadline = now + pongWait (chờ client pong).

// WriteDeadline = now + writeWait (chờ server gửi xong).

// SetReadLimit(maxMessageSize) (giới hạn size).

// Ticker mỗi pingPeriod giây gửi một ping → client phải trả pong.

// ReadPump: read messages from WebSocket and forward to hub.broadcast
func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, msgBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("unexpected close error: %v", err)
			}
			break
		}
		var m Message
		if err := json.Unmarshal(msgBytes, &m); err != nil {
			m = Message{
				Type:     MessageTypeMessage,
				Username: c.username,
				Content:  string(msgBytes),
				// Users: ,
				Timestamp: time.Now().Unix(),
			}
		} else {
			if m.Type == "" {
				m.Type = MessageTypeMessage
			}
			if m.Username == "" {
				m.Username = c.username
			}
			m.Timestamp = time.Now().Unix()
		}

		if len(m.Content) > maxMessageSize {
			m.Content = m.Content[:maxMessageSize]
		}

		c.hub.broadcast <- &m
	}
}

func (c *Client) WriteBump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			b, _ := json.Marshal(msg)
			if err := c.conn.WriteMessage(websocket.TextMessage, b); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
