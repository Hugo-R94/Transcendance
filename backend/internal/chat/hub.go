package chat

import (
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

func (h *Hub) run() {
	for {
		select {
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
			//check if user can send a message in the conv
			userInConv := false
			for _, user := range conv.Users {
				if user.ID == bm.Client.ID {
					userInConv = true
					break
				}
			}
			if !userInConv {
				log.Printf("[ERROR] User %v not authorized in conversation %v", bm.Client.ID, bm.Message.ConversationID)
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

			//send message to every user in conv but the sender
			h.broadcastToRecipient(bm, conv)
		}
	}
}

func (h *Hub) broadcastToRecipient(bm broadcastMessage, conv models.Conversation) {
	for client := range h.Clients {
		if client == bm.Client {
			continue
		}
		for _, user := range conv.Users {
			if user.ID == client.ID {
				select {
				case client.Send <- bm.Message:
				case <-time.After(1 * time.Second):
					close(client.Send)
					delete(h.Clients, client)
				}
			}
		}
	}
}
