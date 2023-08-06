package main

import (
	"chat-app/internal"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
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
	db, err := initDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	userID := 1
	message := &internal.Message{
		UserID:    userID,
		Sender:    "User1",
		Recipient: "User2",
		Content:   "Hello there!",
	}
	err = insertMessage(db, message.Sender, message.Recipient, message.Content)
	if err != nil {
		log.Fatal(err)
	}

	messages, err := getMessages(db, userID)
	if err != nil {
		log.Fatal(err)
	}

	for _, msg := range messages {
		fmt.Printf("Sender: %s, Recipient: %s, Content: %s\n", msg.Sender, msg.Recipient, msg.Content)
	}
}

func insertMessage(db *sql.DB, sender, recipient, content string) error {
	_, err := db.Exec("INSERT IGNORE INTO users (username) VALUES (?)", sender)
	if err != nil {
		return err
	}

	var userID int
	err = db.QueryRow("SELECT id FROM users WHERE username = ?", sender).Scan(&userID)
	if err != nil {
		return err
	}

	_, err = db.Exec("INSERT INTO messages (user_id, sender, recipient, content) VALUES (?, ?, ?, ?)",
		userID, sender, recipient, content)
	return err
}

func getMessages(db *sql.DB, userID int) ([]*internal.Message, error) {
	rows, err := db.Query("SELECT sender, recipient, content FROM messages WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*internal.Message
	for rows.Next() {
		var sender, recipient, content string
		err := rows.Scan(&sender, &recipient, &content)
		if err != nil {
			return nil, err
		}
		message := &internal.Message{
			Sender:    sender,
			Recipient: recipient,
			Content:   content,
		}
		messages = append(messages, message)
	}
	return messages, nil
}

func initDB() (*sql.DB, error) {
	dsn := "gabriel:password@tcp(127.0.0.1:3306)/chat_app"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	return db, nil
}
