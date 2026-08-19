package chat

import (
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
	if typeMsg == models.MessageTypeChat || typeMsg == models.MessageTypeConnect || typeMsg == models.MessageTypeDisconnect || typeMsg == models.MessageTypeFriendReq || typeMsg == models.MessageTypeFriendAccept {
		return true
	}
	return false
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
		convID, err := uuid.Parse(msg.ConversationID)
		if err != nil {
			continue
		}
		if !validType(msg.Type) {
			continue
		}
		newMsg := models.Message{
			ConversationID: convID,
			Text:           msg.Text,
			Type:           msg.Type,
		}
		c.Hub.Broadcast <- broadcastMessage{Client: c, Message: newMsg}
	}
}

func (c *Client) writePump() {
	defer c.Conn.Close()
	for msg := range c.Send {
		if err := c.Conn.WriteJSON(msg); err != nil {
			break
		}
	}
}
