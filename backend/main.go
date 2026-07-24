package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/comment"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/game"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/user"
	"github.com/Hugo-R94/Transcendance/backend/internal/database"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func dbSetup() (*gorm.DB, *sql.DB) {
	dsn := fmt.Sprintf("host=%v user=%v dbname=%v sslmode=%v sslrootcert=%v sslcert=%v sslkey=%v", os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_NAME"), os.Getenv("DB_SSL"), os.Getenv("DB_ROOTCA"), os.Getenv("DB_CRT"), os.Getenv("DB_KEY"))
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not open db: %v", err)
	}
	sqldb, err := db.DB()
	if err != nil {
		log.Fatalf("[ERROR] Fatal error, could not get db generic interface: %v", err)
	}
	db.AutoMigrate(&models.User{})
	db.AutoMigrate(&models.Game{})
	db.AutoMigrate(&models.Developer{})
	db.AutoMigrate(&models.Comment{})
	db.AutoMigrate(&models.Publisher{})
	db.AutoMigrate(&models.CommentVote{})
	return db, sqldb
}

func setupRouter(db *gorm.DB) *gin.Engine {

	router := gin.Default()
	trustedProxies := []string{os.Getenv("TRUSTED_PROXIES")}
	if trustedProxies[0] == "" {
		trustedProxies = []string{"127.0.0.1"}
		log.Printf("[INFO] No trusted proxies detected in env, using default 127.0.0.1")
	}
	router.SetTrustedProxies(trustedProxies)
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
	}))

	//	router.GET("/", func(c *gin.Context) {
	//		c.HTML(http.StatusOK, "connexion.html", gin.H{
	//			"title": "Main website",
	//		})
	//	})
	//	router.GET("/signin", func(c *gin.Context) {
	//		c.HTML(http.StatusOK, "index.html", gin.H{})
	//	})

	v1 := router.Group("/api/v1")
	v1.Use(utils.AuthMiddleware())
	userGroup := router.Group("/")
	gameGroup := v1.Group("/game")
	commentGroup := v1.Group("/comments")
	//	commentVoteGroup := v1.Group("/commentVote")
	comment.CommentRoutes(commentGroup, db)
	game.GetGameInfo(gameGroup, db)

	user.RegisterUser(userGroup, db)
	user.LoginUser(userGroup, db)
	user.LogoutUser(userGroup, db)
	return router
}

func main() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	envCheck()

	db, sqldb := dbSetup()
	defer sqldb.Close()

	database.GetAllGames(db)
	go database.CompleteDB(db, ctx)

	router := setupRouter(db)
	server := &http.Server{
		Addr:              os.Getenv("ADDR"),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-quit
		cancel()
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("[ERROR] Shutting down error: %v", err)
		}
	}()

	log.Println("[INFO] Starting server ...")
	if err := server.ListenAndServe(); err != nil {
		if err == http.ErrServerClosed {
			log.Println("[INFO] Shutting down server ...")
		} else {
			log.Fatalf("[ERROR] Fatal error on server: %v", err)
		}
	}
}
