package main

import (
	"fmt"
	"log"
	"os"

	"github.com/Hugo-R94/Transcendance/internal/apiHandlers/user"
	"github.com/Hugo-R94/Transcendance/internal/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {

	err_env := godotenv.Load(".env")
	if err_env != nil {
		log.Printf("[WARNING] Error while trying to load .env: %v", err_env)
	}

	dsn := fmt.Sprintf("host=%v user=%v password=%v dbname=%v port=%v sslmode=%v TimeZone=%v", os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"), os.Getenv("DB_SSL"), os.Getenv("DB_TZ"))
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not open db: %v", err)
	}
	sqldb, err := db.DB()
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not get db generic interface: %v", err)
	}

	defer sqldb.Close()

	db.AutoMigrate(&models.User{})
	portString := os.Getenv("ADDR")

	if portString == "" {
		log.Fatal("[ERROR] ADDR not found in env")
	}
	router := gin.Default()
	router.Use(cors.Default())

	api := router.Group("/api")
	userGroup := api.Group("/user")

	user.RegisterUser(userGroup, db)

	//	user.GET(":id", handler_user_get)
	//	user.PUT(":id", handler_user_put)
	//	user.PATCH(":id", handler_user_patch)
	//	user.DELETE(":id", handle_user_delete)

	log.Println("[INFO] Starting server ...")
	err_run := router.Run(portString)
	if err_run != nil {
		log.Fatalf("[ERROR] Fatal error on server: %v", err_run)
	}
}
