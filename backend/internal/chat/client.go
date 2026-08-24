package chat

import (
    "encoding/json"
    "log"

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

        if jsonBytes, err := json.Marshal(msg); err == nil {
            log.Printf("[WS DEBUG] JSON REÇU de [%s] : %s", c.ID, string(jsonBytes))
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
		log.Printf("json{\ntype:\t%s\nmessage:\t%s\n}", newMsg.Type, newMsg.Text)
        c.Hub.Broadcast <- broadcastMessage{Client: c, Message: newMsg}
    }
}

func (c *Client) writePump() {
    defer c.Conn.Close()
    for msg := range c.Send {
        if jsonBytes, err := json.Marshal(msg); err == nil {
            log.Printf("[WS DEBUG] JSON ENVOYÉ à [%s] : %s", c.ID, string(jsonBytes))
        }

        if err := c.Conn.WriteJSON(msg); err != nil {
            break
        }
    }
}