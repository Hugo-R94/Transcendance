package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/Hugo-R94/Transcendance/backend/internal/database"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func dbSetup() (*gorm.DB, *sql.DB) {
	dsn := fmt.Sprintf("host=%v user=%v dbname=%v sslmode=%v sslrootcert=%v sslcert=%v sslkey=%v", os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_NAME"), os.Getenv("DB_SSL"), os.Getenv("DB_ROOTCA"), os.Getenv("DB_CRT"), os.Getenv("DB_KEY"))
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not open db: %v", err)
	}

	//Used to close connection to db gracefully
	sqldb, err := db.DB()
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not get db generic interface: %v", err)
	}

	if err := db.AutoMigrate(&models.User{}, &models.Game{}, &models.Developer{}, &models.Publisher{}, &models.Comment{}, &models.CommentVote{}, &models.Conversation{}, &models.Message{}, &models.UserBlock{}, &models.WSToken{}); err != nil {
		log.Fatalf("[ERROR] Fatal error, Failed to automigrate: %v", err)
	}
	return db, sqldb
}

func dbUpdate(db *gorm.DB, ctx context.Context) {
	database.GetAllGames(db)
	database.CompleteDB(db, ctx)
}
