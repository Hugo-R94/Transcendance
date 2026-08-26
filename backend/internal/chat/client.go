package chat

import (
	"encoding/json"
	"log"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	Hub  *Hub
	Conn *websocket.Conn
	Send chan models.Message
	ID   uuid.UUID
}

func validType(typeMsg string) bool {
	if typeMsg == models.MessageTypeChat ||
		typeMsg == models.MessageTypeConnect ||
		typeMsg == models.MessageTypeDisconnect ||
		typeMsg == models.MessageTypeFriendReq ||
		typeMsg == models.MessageTypeFriendAccept ||
		typeMsg == models.MessageTypeUnfriend ||
		typeMsg == models.MessageTypeGameInvit ||
		typeMsg == models.MessageTypeRead {
		return true
	}

	return false
}
func (h *Hub) MarkAsRead(
	userID uuid.UUID,
	conversationID uuid.UUID,
) {
	now := time.Now()

	var conv models.Conversation

	if err := h.DB.
		Where("id = ?", conversationID).
		First(&conv).Error; err != nil {
		log.Printf("[ERROR] Couldn't fetch conversation: %v", err)
		return
	}

	updates := map[string]interface{}{}

	switch userID {
	case conv.User1ID:
		updates["last_read_at_user1"] = now

	case conv.User2ID:
		updates["last_read_at_user2"] = now

	default:
		log.Printf(
			"[ERROR] User %v isn't in conversation %v",
			userID,
			conversationID,
		)
		return
	}

	if err := h.DB.
		Model(&models.Conversation{}).
		Where("id = ?", conversationID).
		Updates(updates).Error; err != nil {
		log.Printf("[ERROR] Couldn't update last read: %v", err)
		return
	}

	log.Printf(
		"[CHAT] User %v read conversation %v",
		userID,
		conversationID,
	)
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		var msg models.MessageSend

		if err := c.Conn.ReadJSON(&msg); err != nil {
			break
		}

		if jsonBytes, err := json.Marshal(msg); err == nil {
			log.Printf(
				"[WS DEBUG] JSON REÇU de [%s] : %s",
				c.ID,
				string(jsonBytes),
			)
		}

		convID, err := uuid.Parse(msg.ConversationID)
		if err != nil {
			log.Printf(
				"[ERROR] Invalid conversation ID: %s",
				msg.ConversationID,
			)
			continue
		}

		if !validType(msg.Type) {
			log.Printf(
				"[ERROR] Invalid message type: %s",
				msg.Type,
			)
			continue
		}

		if msg.Type == models.MessageTypeRead {
			c.Hub.MarkAsRead(c.ID, convID)
			continue
		}

		newMsg := models.Message{
			ConversationID: convID,
			Text:           msg.Text,
			Type:           msg.Type,
		}

		log.Printf(
			"json{\ntype:\t%s\nmessage:\t%s\n}",
			newMsg.Type,
			newMsg.Text,
		)

		c.Hub.Broadcast <- BroadcastMessage{
			Client:  c,
			Message: newMsg,
		}
	}
}

func (c *Client) writePump() {
	defer c.Conn.Close()

	for msg := range c.Send {
		if jsonBytes, err := json.Marshal(msg); err == nil {
			log.Printf(
				"[WS DEBUG] JSON ENVOYÉ à [%s] : %s",
				c.ID,
				string(jsonBytes),
			)
		}

		if err := c.Conn.WriteJSON(msg); err != nil {
			break
		}
	}
}