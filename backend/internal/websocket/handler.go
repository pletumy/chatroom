package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func ServeWS(hub *Hub) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		username := ctx.Query("username")
		if username == "" {
			ctx.JSON(400, gin.H{"error": "username required"})
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			log.Printf("upgrade error: %v", err)
			return
		}

		client := &Client{
			hub:      hub,
			conn:     conn,
			send:     make(chan *Message, 256),
			username: username,
		}

		client.hub.register <- client

		go client.WriteBump()
		go client.ReadPump()
	}
}
