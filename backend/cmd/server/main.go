package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

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
		websocket.ServeWS(hub, ctx.Writer, ctx.Request)
	})

	srvErr := make(chan error, 1)
	go func() {
		srvErr <- r.Run(":8080")
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	select {
	case err := <-srvErr:
		log.Fatalf("server error: %v", err)
	case <-quit:
		log.Println("shutting down ...")
	}
}
