package internal

import (
	"log"
	"time"

	"gorm.io/gorm"
)

// type Message struct {
// 	Sender  string `json:"sender"`
// 	Content string `json:"content"`
// }

type Message struct {
	ID        int
	Sender    string
	Content   string
	CreatedAt int64
}

func InsertMessage(sender, content string) error {
	message := &Message{
		Sender:    sender,
		Content:   content,
		CreatedAt: time.Now().Unix(),
	}
	return DB.Create(message).Error
}

func LoadMessages() ([]Message, error) {
	var messages []Message
	if err := DB.Order("created_at desc").Limit(50).Find(&messages).Error; err != nil {
		log.Println("Error loading messages:", err)
		return nil, err
	}
	return messages, nil
}

func (m *Message) AfterCreate(tx *gorm.DB) (err error) {
	log.Println("New message written to the database:", m.ID)
	return
}
