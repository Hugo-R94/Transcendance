package chat

import (
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
)

type hub struct {
	clients    map[string]*client
	broadcast  chan models.Message
	register   chan *client
	unregister chan *client
}

func (h *hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client.ID] = client
		case client := <-h.unregister:
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.send)
			}
		case msg := <-h.broadcast:
			h.broadcastToRecipient(msg)
		}
	}
}

func (h *hub) broadcastToRecipient(msg models.Message) {
	if client, ok := h.clients[msg.RecipientID]; ok {
		select {
		case client.send <- msg:
		default:
			close(client.send)
			delete(h.clients, client.ID)
		}
	}
}
