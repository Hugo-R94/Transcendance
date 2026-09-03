package chat

import (
	"log"
	"net/http"
	"time"
	"fmt"
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

	result := h.db.
		Where("token_string = ?", queryToken).
		Unscoped().
		Delete(&models.WSToken{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't check token validity",
		})

		log.Printf(
			"[ERROR] Couldn't check token validity: %v",
			result.Error,
		)

		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})

		return
	}

	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)

	if err != nil {
		log.Printf(
			"[WS] upgrade error: %v\n",
			err,
		)

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

	go h.sendUnreadNotifications(client, id)
	go h.sendIsRead(client, id)
}

func (h *WSHandler) sendIsRead(
	client *Client,
	userID uuid.UUID,
) {
	var convs []models.Conversation

	if err := h.db.
		Where(
			"user1_id = ? OR user2_id = ?",
			userID,
			userID,
		).
		Find(&convs).Error; err != nil {

		log.Printf("[ERROR] read conversations: %v", err)
		return
	}

	log.Printf(
		"[READ] Found %d conversations for user %v",
		len(convs),
		userID,
	)

	for _, conv := range convs {

		log.Printf(
			"[READ] conversation=%v lastMessageID=%v lastMessageAt=%v read1=%v read2=%v",
			conv.ID,
			conv.LastMessageID,
			conv.LastMessageAt,
			conv.LastReadAtUser1,
			conv.LastReadAtUser2,
		)

		if conv.LastMessageID == uuid.Nil {
			log.Printf("[READ] skip: no last message")
			continue
		}

		if conv.LastMessageAt == nil {
			log.Printf("[READ] skip: no last message date")
			continue
		}

		var lastMessage models.Message

		if err := h.db.
			Where("id = ?", conv.LastMessageID).
			First(&lastMessage).Error; err != nil {

			log.Printf(
				"[READ] error loading message %v: %v",
				conv.LastMessageID,
				err,
			)

			continue
		}

		log.Printf(
			"[READ] last message sender=%v, current user=%v",
			lastMessage.SenderID,
			userID,
		)

		// Le dernier message est le mien
		if lastMessage.SenderID != userID {
			log.Printf("[READ] skip: last message is mine")
			continue
		}

		var lastRead *time.Time

		if conv.User1ID == userID {
			lastRead = conv.LastReadAtUser2
		} else if conv.User2ID == userID {
			lastRead = conv.LastReadAtUser1
		}

		if lastRead == nil {
			log.Printf("[READ] skip: never read")
			continue
		}

		log.Printf(
			"[READ] lastMessageAt=%v lastRead=%v",
			*conv.LastMessageAt,
			*lastRead,
		)

		if conv.LastMessageAt.After(*lastRead) {
			log.Printf("[READ] skip: message is newer than last read")
			continue
		}

		log.Printf("[READ] SENDING READ for conversation %v", conv.ID)

		var id uuid.UUID
		if lastMessage.SenderID == conv.User1ID{
			id = conv.User2ID
		}else{
			id = conv.User1ID
		}
		
		select {
		case client.Send <- models.Message{
			SenderID:       id,
			ConversationID: conv.ID,
			Text:           "",
			Type:           models.MessageTypeRead,
			Time:           *lastRead,
		}:
			log.Printf("[READ] READ SENT")

		default:
			log.Printf(
				"[WARN] WebSocket send buffer full for user %v",
				userID,
			)
			return
		}
	}
}


func (h *WSHandler) sendUnreadNotifications(
	client *Client,
	userID uuid.UUID,
) {
	var convs []models.Conversation

	if err := h.db.
		Where(
			"user1_id = ? OR user2_id = ?",
			userID,
			userID,
		).
		Find(&convs).Error; err != nil {

		log.Printf(
			"[ERROR] unread conversations: %v",
			err,
		)

		return
	}

	for _, conv := range convs {
		var lastRead *time.Time

		if conv.User1ID == userID {
			lastRead = conv.LastReadAtUser1
		} else if conv.User2ID == userID {
			lastRead = conv.LastReadAtUser2
		} else {
			continue
		}

		query := h.db.
			Where(
				"conversation_id = ?",
				conv.ID,
			).
			Where(
				"sender_id != ?",
				userID,
			).
			Order("time DESC")

		if lastRead != nil {
			query = query.Where(
				"time > ?",
				*lastRead,
			)
		}

		var messages []models.Message

		if err := query.
			Limit(1).
			Find(&messages).Error; err != nil {

			log.Printf(
				"[ERROR] unread messages for conversation %v: %v",
				conv.ID,
				err,
			)

			continue
		}

		if len(messages) == 0 {
			continue
		}

		msg := messages[0]

		select {
		case client.Send <- models.Message{
			SenderID:       msg.SenderID,
			ConversationID: conv.ID,
			Text:           msg.Text,
			Type:           models.MessageTypeChatNotification,
			Time:           msg.Time,
		}:
		fmt.Printf("chatsetup send notification")
		default:
			log.Printf(
				"[WARN] WebSocket send buffer full for user %v",
				userID,
			)

			return
		}
	}
}

func ChatSetup(
	router *gin.RouterGroup,
	db *gorm.DB,
	hub *Hub,
) {
	h := &WSHandler{
		db:  db,
		hub: hub,
	}

	router.GET(
		"/ws",
		utils.WSMiddleware(),
		h.setup,
	)
}
