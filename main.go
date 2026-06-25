package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/Hugo-R94/Transcendance/internal/apiHandlers/user"
	"github.com/Hugo-R94/Transcendance/internal/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func dbSetup() (*gorm.DB, *sql.DB) {
	dsn := fmt.Sprintf("host=%v user=%v password=%v dbname=%v port=%v sslmode=%v TimeZone=%v sslrootcert=%v", os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"), os.Getenv("DB_SSL"), os.Getenv("DB_TZ"), os.Getenv("DB_CERT"))
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not open db: %v", err)
	}
	sqldb, err := db.DB()
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not get db generic interface: %v", err)
	}
	db.AutoMigrate(&models.User{})
	return db, sqldb
}

func setupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()
	trustedProxies := os.Getenv("TRUSTED_PROXIES")
	if trustedProxies == "" {
		trustedProxies = "127.0.0.1"
		log.Printf("[INFO] No trusted proxies detected in env, using default 127.0.0.1")
	}
	router.Use(cors.Default())

	v1 := router.Group("/api/v1")
	userGroup := v1.Group("/user")

	user.RegisterUser(userGroup, db)
	user.LoginUser(userGroup, db)
	return router
}

func main() {

	envCheck()

	db, sqldb := dbSetup()
	defer sqldb.Close()

	router := setupRouter(db)
	addrString := os.Getenv("ADDR")
	log.Println("[INFO] Starting server ...")
	err_run := router.Run(addrString)
	if err_run != nil {
		log.Fatalf("[ERROR] Fatal error on server: %v", err_run)
	}
}
