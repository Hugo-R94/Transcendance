package main

import (
	"log"
	"os"

	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/apiChat"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/apigambling"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/comment"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/game"
	"github.com/Hugo-R94/Transcendance/backend/internal/apiHandlers/user"
	"github.com/Hugo-R94/Transcendance/backend/internal/chat"
	"github.com/Hugo-R94/Transcendance/backend/internal/gambling"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

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
	gambleGroup := router.Group("/gamble")
	gambleGroup.GET("/ws", utils.WSMiddleware(), gambling.HandleWebSocket(db))
	gameGroup := v1.Group("/game")
	chatGroup := router.Group("/chat")
	commentGroup := v1.Group("/comments")
	comment.CommentRoutes(commentGroup, db)
	game.GetGameInfo(gameGroup, db)	
	user.GetUserInfo(userGroup, v1, db)
	user.RegisterUser(userGroup, db)
	user.LoginUser(userGroup, db)
	user.LogoutUser(userGroup, db)
	user.RefreshUser(userGroup, db)
	user.ChangePP(v1, db)
	apichat.FriendAccept(v1, db, hub)
	apichat.UnFriendReq(v1, db, hub)
	apichat.FriendReq(v1, db, hub)
	apichat.GetConvs(v1, db)
	apichat.BlockUser(v1, db, hub)
	apichat.GetBlockList(v1, db)
	apichat.UnBlockUser(v1, db)
	apichat.GenWSToken(v1, db)
	apigambling.GetHistory(v1, db)
	chat.ChatSetup(chatGroup, db, hub)
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
