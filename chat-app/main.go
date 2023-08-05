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
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Connection Header:", r.Header.Get("Connection"))
	fmt.Println("Upgrade Header:", r.Header.Get("Upgrade"))
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	client := &internal.Client{Socket: conn, Send: make(chan []byte)}
	internal.Manager.Register <- client

	go client.Read()
	go client.Write()
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go internal.Manager.Start()

	log.Fatal(http.ListenAndServe(":8080", nil))
}
