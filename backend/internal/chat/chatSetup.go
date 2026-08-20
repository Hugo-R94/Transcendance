package chat

import (
	"fmt"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type (
	WSHandler struct {
		db  *gorm.DB
		hub *Hub
	}
)

var upgrader = websocket.Upgrader{
	// Allow all origins for development; restrict this in production.
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *WSHandler) setup(c *gin.Context) {

	// =====================================================
	// Récupération du token dans ?token=...
	// =====================================================

	tokenStr := c.Query("token")

	fmt.Printf("[WS] token present: %v\n", tokenStr != "")

	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Missing token",
		})
		return
	}

	// =====================================================
	// Validation du JWT
	// =====================================================

	claims := &models.TokenClaims{}

	token, err := jwt.ParseWithClaims(
		tokenStr,
		claims,
		func(token *jwt.Token) (any, error) {
			return utils.JwtSecret, nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
	)

	if err != nil {
		fmt.Printf("[WS] token error: %v\n", err)

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})
		return
	}

	if token == nil || !token.Valid {
		fmt.Println("[WS] token invalid")

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})
		return
	}

	// =====================================================
	// Récupération de l'ID utilisateur depuis le JWT
	// =====================================================

	if claims.ID == "" {
		fmt.Println("[WS] token has no user ID")

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID missing from token",
		})
		return
	}

	id, err := uuid.Parse(claims.ID)

	if err != nil {
		fmt.Printf("[WS] invalid user ID: %v\n", err)

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	fmt.Printf("[WS] authenticated user: %s\n", id.String())

	// =====================================================
	// Upgrade HTTP -> WebSocket
	// =====================================================

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		fmt.Printf("[WS] upgrade error: %v\n", err)
		return
	}

	// =====================================================
	// Création du client
	// =====================================================

	client := &Client{
		Hub:  h.hub,
		Conn: conn,
		Send: make(chan models.Message, 256),
		ID:   id,
	}

	h.hub.Register <- client

	go client.writePump()
	go client.readPump()
}

func ChatSetup(router *gin.RouterGroup, db *gorm.DB, hub *Hub) {
	h := &WSHandler{
		db:  db,
		hub: hub,
	}

	router.GET("/ws", h.setup)
}