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

	Conversation struct {
		ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		User1ID   uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_conv_users"`
		User2ID   uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_conv_users"`
		User1     User           `gorm:"foreignKey:User1ID;references:ID"`
		User2     User           `gorm:"foreignKey:User2ID;references:ID"`
		Accepted  bool           `gorm:"default:false" json:"-"`
		Messages  []Message      `gorm:"foreignKey:ConversationID;references:ID" json:"messages"`
		CreatedAt time.Time      `json:"-"`
		UpdatedAt time.Time      `json:"-"`
		DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	}

	MessageSend struct {
		ConversationID string `json:"conversation_id" binding:"required"`
		Text           string `json:"text"`
		Type           string `json:"type"`
	}

	FriendRequest struct {
		Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
	}

	FriendAccept struct {
		ID string `json:"id" binding:"required"`
	}
)

const (
	MessageTypeChat       = "message"
	MessageTypeConnect    = "connect"
	MessageTypeDisconnect = "disconnect"
	MessageTypeFriendReq  = "friend_req"
)
