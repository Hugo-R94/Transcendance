package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type (
	Message struct {
		ID             uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		SenderID       string         `gorm:"type:varchar(36); index" json:"sender_id"`
		RecipientID    string         `gorm:"type:varchar(36); index" json:"recipient_id"`
		ConversationID string         `gorm:"type:varchar(36); index" json:"conversation_id"`
		Text           string         `gorm:"type:text" json:"text"`
		Time           time.Time      `json:"time"`
		Type           string         `gorm:"type:varchar(10)" json:"type"`
		CreatedAt      time.Time      `json:"-"`
		UpdatedAt      time.Time      `json:"-"`
		DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	}

	Conversation struct {
		ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		User1ID   string         `gorm:"type:varchar(36); index:idx_member,unique" json:"user1_id"`
		User2ID   string         `gorm:"type:varchar(36); index:idx_member,unique" json:"user2_id"`
		Messages  []Message      `gorm:"foreignKey:ConversationID"`
		CreatedAt time.Time      `json:"-"`
		UpdatedAt time.Time      `json:"-"`
		DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	}

	MessageRequest struct {
		RecipientID string `json:"recipient_id" binding:"required"`
		Text        string `json:"text" binding:"required"`
	}

	Client struct {
		hub  *Hub
		conn *websocket.Conn
		send chan Message
		id   string
	}

	Hub struct {
		clients    []Client
		broadcast  chan Message
		register   chan *Client
		unregister chan *Client
	}
)

const (
	MessageTypeChat       = "message"
	MessageTypeConnect    = "connect"
	MessageTypeDisconnect = "disconnect"
)
