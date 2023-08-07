package db

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var Db *sql.DB

func InitDB() error {
	var err error
	Db, err = sql.Open("mysql", "gabriel:password@tcp(localhost:3306)/chat_app_db")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
		return err
	}

	if err = Db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
		return err
	}

	log.Println("Connected to the database")
	return nil
}
