package chat

import (
	"context"
	"log"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"gorm.io/gorm"
)

type (
	broadcastMessage struct {
		Client  *Client
		Message models.Message
	}

	Hub struct {
		Clients    map[*Client]bool
		Broadcast  chan broadcastMessage
		Register   chan *Client
		Unregister chan *Client
		DB         *gorm.DB
	}
)

func (hub *Hub) HubInit(db *gorm.DB) {
	hub.Clients = make(map[*Client]bool)
	hub.Broadcast = make(chan broadcastMessage)
	hub.Register = make(chan *Client)
	hub.Unregister = make(chan *Client)
	hub.DB = db
}

func (h *Hub) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			log.Println("[INFO] Hub shutting down")
			close(h.Broadcast)
			for Client := range h.Clients {
				Client.Conn.Close()
			}
			return
		case client := <-h.Register:
			h.Clients[client] = true
		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
		case bm := <-h.Broadcast:
			var conv models.Conversation
			if err := h.DB.Where("id = ?", bm.Message.ConversationID).First(&conv).Error; err != nil {
				log.Printf("[ERROR] Couldn't fetch conversation: %v", err)
				continue
			}
			if bm.Client.ID != conv.User1ID && bm.Client.ID != conv.User2ID {
				log.Printf("[ERROR] User %v not authorized in conversation %v", bm.Client.ID, bm.Message.ConversationID)
				continue
			}
			if !conv.Accepted && bm.Message.Type != models.MessageTypeFriendReq {
				continue
			}
			//add info in Message struct and register it
			bm.Message.SenderID = bm.Client.ID
			bm.Message.Time = time.Now()
			if err := h.DB.Transaction(func(tx *gorm.DB) error {
				return tx.Create(&bm.Message).Error
			}); err != nil {
				log.Printf("[ERROR] Failed to save message: %v", err)
				continue
			}

			h.broadcastToRecipient(bm, conv)
		}
	}
}

func (h *Hub) broadcastToRecipient(bm broadcastMessage, conv models.Conversation) {
	for client := range h.Clients {
		if client == bm.Client {
			continue
		}
		if client.ID == conv.User1ID || client.ID == conv.User2ID {
			select {
			case client.Send <- bm.Message:
			case <-time.After(1 * time.Second):
				close(client.Send)
				delete(h.Clients, client)
			}
			return
		}
	}
}
