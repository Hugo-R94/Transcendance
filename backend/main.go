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

	apichat "github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/apiChat"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/comment"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/game"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/user"
	"github.com/Hugo-R94/Transcendance/backend/internal/chat"

	//"github.com/Hugo-R94/Transcendance/backend/internal/chat"
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
	if err := db.AutoMigrate(&models.User{}, &models.Game{}, &models.Developer{}, &models.Publisher{}, &models.Comment{}, &models.CommentVote{}, &models.Conversation{}, &models.Message{}); err != nil {
		log.Fatalf("[ERROR] Fatal error, Failed to automigrate: %v", err)
	}
	return db, sqldb
}

func setupRouter(db *gorm.DB, hub *chat.Hub) *gin.Engine {

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

	v1 := router.Group("/api/v1")
	v1.Use(utils.AuthMiddleware())
	userGroup := router.Group("/")
	gameGroup := v1.Group("/game")
	commentGroup := v1.Group("/comments")

	//	commentVoteGroup := v1.Group("/commentVote")
	comment.CommentRoutes(commentGroup, db)
	game.GetGameInfo(gameGroup, db)
	user.GetUserInfo(userGroup, v1, db)
	
	user.RegisterUser(userGroup, db)
	user.LoginUser(userGroup, db)
	user.LogoutUser(userGroup, db)
	user.RefreshUser(userGroup, db)
	user.ChangePP(v1, db)
	apichat.FriendAccept(v1, db)
	apichat.FriendReq(v1, db)
	apichat.GetConvs(v1, db)
	chat.ChatSetup(v1, db, hub)
	user.GetPP(v1, db)
	user.GetUserComments(v1, db)
	user.UserDescriptionRoutes(v1, db)
	user.AddGameToList(v1, db)
	user.GetUserGameList(v1, db)
	for _, route := range router.Routes() {
		log.Printf("Route enregistrée: %s %s", route.Method, route.Path)
	}
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

	var hub chat.Hub
	hub.HubInit(db)

	router := setupRouter(db, &hub)
	server := &http.Server{
		Addr:              os.Getenv("ADDR"),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go hub.Run()

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
