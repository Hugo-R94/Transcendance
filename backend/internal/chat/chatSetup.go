package chat

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
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
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	queryToken := c.Query("token")

	result := h.db.Where("token_string = ?", queryToken).Unscoped().Delete(&models.WSToken{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't check token validity",
		})
		log.Printf("[ERROR] Couldn't check token validity: %v", result.Error)
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)

	if err != nil {
		log.Printf("[WS] upgrade error: %v\n", err)
		return
	}
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
	router.GET("/ws", utils.WSMiddleware(), h.setup)
}
