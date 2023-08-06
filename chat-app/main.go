package main

import (
	"chat-app/internal"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Connection Header:", r.Header.Get("Connection"))
	fmt.Println("Upgrade Header:", r.Header.Get("Upgrade"))

	user := r.URL.Query().Get("user")

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	client := &internal.Client{
		Socket: conn,
		Send:   make(chan []byte),
		User:   user,
	}

	internal.Manager.Register <- client

	go client.Write()
	client.Read()
}

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	http.HandleFunc("/ws", handleConnections)
	go internal.Manager.Start()

	log.Println("Chat server started. Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
