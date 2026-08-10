package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	Message struct {
		ID             uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		SenderID       uuid.UUID      `gorm:"type:uuid; index" json:"sender_id"`
		ConversationID uuid.UUID      `gorm:"type:uuid; index" json:"conversation_id"`
		Text           string         `gorm:"type:text" json:"text"`
		Time           time.Time      `json:"time"`
		Type           string         `gorm:"type:varchar(10)" json:"type"`
		CreatedAt      time.Time      `json:"-"`
		UpdatedAt      time.Time      `json:"-"`
		DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	}

	MessageSend struct {
		ConversationID string `json:"conversation_id" binding:"required"`
		Text           string `json:"text"`
	}

	Conversation struct {
		ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		Users     []User         `gorm:"many2many:user_convs;" json:"users"`
		Messages  []Message      `gorm:"foreignKey:ConversationID;references:ID" json:"messages"`
		CreatedAt time.Time      `json:"-"`
		UpdatedAt time.Time      `json:"-"`
		DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	}
)

const (
	MessageTypeChat       = "message"
	MessageTypeConnect    = "connect"
	MessageTypeDisconnect = "disconnect"
	MessageTypeFriendReq  = "friend_req"
)
