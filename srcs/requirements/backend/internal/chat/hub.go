package chat

import (
	"context"
	"log"
	"fmt"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	BroadcastMessage struct {
		Client  *Client
		Message models.Message
	}

	Notification struct {
		TargetID uuid.UUID
		Message models.Message
	}

	Hub struct {
		Clients    map[*Client]bool
		Broadcast  chan BroadcastMessage
		Notify     chan Notification
		Register   chan *Client
		Unregister chan *Client
		DB         *gorm.DB
	}
)

func (hub *Hub) HubInit(db *gorm.DB) {
	hub.Clients = make(map[*Client]bool)
	hub.Broadcast = make(chan BroadcastMessage)
	hub.Notify = make(chan Notification)
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

			for client := range h.Clients {
				client.Conn.Close()
			}

			return

		case client := <-h.Register:
			h.Clients[client] = true

		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}

		case n := <-h.Notify:
			h.sendToTarget(n.TargetID, n.Message)

		case bm := <-h.Broadcast:
			var conv models.Conversation

			if err := h.DB.
				Where("id = ?", bm.Message.ConversationID).
				First(&conv).Error; err != nil {
				log.Printf("[ERROR] Couldn't fetch conversation: %v", err)
				continue
			}

			if bm.Client.ID != conv.User1ID && bm.Client.ID != conv.User2ID {
				log.Printf(
					"[ERROR] User %v not authorized in conversation %v",
					bm.Client.ID,
					bm.Message.ConversationID,
				)
				continue
			}

			if (!conv.Accepted1 || !conv.Accepted2) &&
				bm.Message.Type != models.MessageTypeFriendReq {
				log.Printf(
					"[DEBUG] Message %s dropped: Accepted1=%v Accepted2=%v",
					bm.Message.Type,
					conv.Accepted1,
					conv.Accepted2,
				)
				continue
			}

			bm.Message.SenderID = bm.Client.ID
			bm.Message.Time = time.Now()
			
			if bm.Message.Type == models.MessageTypeChat ||
				bm.Message.Type == models.MessageTypeGameInvit {

				if err := h.DB.Transaction(func(tx *gorm.DB) error {
					if err := tx.Create(&bm.Message).Error; err != nil {
						return err
					}

					if bm.Message.Type == models.MessageTypeChat {
						if err := tx.Model(&models.Conversation{}).
							Where("id = ?", conv.ID).
							Updates(map[string]interface{}{
								"last_message_id": bm.Message.ID,
								"last_message_at": bm.Message.Time,
							}).Error; err != nil {
							return err
						}
					}

					return nil
				}); err != nil {
					log.Printf("[ERROR] Failed to save message: %v", err)
					continue
				}

				if bm.Message.Type == models.MessageTypeChat || bm.Message.Type == models.MessageTypeGameInvit {
					conv.LastMessageID = bm.Message.ID
					conv.LastMessageAt = &bm.Message.Time
					fmt.Printf("maj du last message : last message id = %v  |  at = %v\n", bm.Message.ID, &bm.Message.Time)
				}
			}



			h.BroadcastToRecipient(bm, conv)
		}
	}
}

func (h *Hub) BroadcastToRecipient(
	bm BroadcastMessage,
	conv models.Conversation,
) {
	var recipientID uuid.UUID

	if bm.Client.ID == conv.User1ID {
		recipientID = conv.User2ID
	} else {
		recipientID = conv.User1ID
	}

	for client := range h.Clients {
		if client.ID != conv.User1ID && client.ID != conv.User2ID {
			continue
		}

		select {
		case client.Send <- bm.Message:

		case <-time.After(1 * time.Second):
			close(client.Send)
			delete(h.Clients, client)
		}
	}
	if bm.Message.Type == models.MessageIsTyping || bm.Message.Type == models.MessageTypeRead {
		return
	}
	var lastRead *time.Time

	if recipientID == conv.User1ID {
		lastRead = conv.LastReadAtUser1
	} else if recipientID == conv.User2ID {
		lastRead = conv.LastReadAtUser2
	}

	if lastRead != nil && !bm.Message.Time.After(*lastRead) {
		log.Printf(
			"[CHAT] Message déjà lu, pas de notification. conv=%v",
			conv.ID,
		)
		return
	}

	log.Printf(
		"[CHAT] Notification non-lue -> user=%v conv=%v",
		recipientID,
		conv.ID,
	)

	h.sendToTarget(recipientID, models.Message{
		SenderID:       bm.Client.ID,
		ConversationID: conv.ID,
		Type:           models.MessageTypeChatNotification,
		Time:           bm.Message.Time,
	})
}

func (h *Hub) sendToTarget(targetID uuid.UUID, msg models.Message) {
	for client := range h.Clients {
		if client.ID != targetID {
			continue
		}

		select {
		case client.Send <- msg:

		case <-time.After(1 * time.Second):
			close(client.Send)
			delete(h.Clients, client)
		}
	}
}
