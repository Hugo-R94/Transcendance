package chat

import (
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type (
	ChatHandler struct {
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

func (h *ChatHandler) setup(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if exists == false {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User id missing",
		})
		return
	}
	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
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
	h := &ChatHandler{db: db, hub: hub}
	router.GET("/ws", h.setup)
}
