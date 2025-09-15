package main

import (
	"chatroom/backend/internal/websocket"

	"github.com/gin-gonic/gin"
)

func main() {
	hub := websocket.NewHub()
	go hub.Run()

	r := gin.Default()

	r.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/ws", func(ctx *gin.Context) {
		websocket.ServeWS(hub, ctx)
	})

	r.Run(":8080")
}
