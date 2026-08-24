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
		ConversationID uuid.UUID      `gorm:"type:uuid; index; constraint:onDelete:CASCADE;" json:"conversation_id"`
		Text           string         `gorm:"type:text" json:"text"`
		Time           time.Time      `gorm:"index" json:"time"`
		Type           string         `gorm:"type:varchar(15)" json:"type"`
		CreatedAt      time.Time      `json:"-"`
		UpdatedAt      time.Time      `json:"-"`
		DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	}

	Conversation struct {
		ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		User1ID   uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_conv_users" json:"user1_id"`
		User2ID   uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_conv_users" json:"user2_id"`
		User1     User           `gorm:"foreignKey:User1ID;references:ID" json:"user1"`
		User2     User           `gorm:"foreignKey:User2ID;references:ID" json:"user2"`
		Accepted1 bool           `gorm:"default:false" json:"accepted_1"`
		Accepted2 bool           `gorm:"default:false" json:"accepted_2"`
		Messages  []Message      `gorm:"foreignKey:ConversationID;references:ID" json:"messages"`
		CreatedAt time.Time      `json:"-"`
		UpdatedAt time.Time      `json:"-"`
		DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	}

	UserBlock struct {
		ID            uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		UserID        uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_block_list" json:"-"`
		BlockedUserID uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_block_list" json:"-"`
		User          User           `gorm:"foreignKey:UserID;references:ID" json:"-"`
		BlockedUser   User           `gorm:"foreignKey:BlockedUserID;references:ID" json:"blocked_user"`
		CreatedAt     time.Time      `json:"-"`
		UpdatedAt     time.Time      `json:"-"`
		DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	}

	WSToken struct {
		ID          uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()"`
		TokenString string         `gorm:"text; uniqueIndex"`
		CreatedAt   time.Time      `json:"-"`
		UpdatedAt   time.Time      `json:"-"`
		DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	}

	WSTokenResponse struct {
		Token string `json:"token"`
	}

	MessageSend struct {
		ConversationID string `json:"conversation_id" binding:"required"`
		Text           string `json:"text"`
		Type           string `json:"type"`
	}

	FriendRequest struct {
		Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
	}

	UnFriendRequest struct {
		ID string `json:"id" binding:"required"`
	}

	UnBlockRequest struct {
		ID string `json:"id" binding:"required"`
	}

	BlockRequest struct {
		Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
	}

	FriendAccept struct {
		ID     string `json:"id" binding:"required"`
		Accept bool   `json:"accept"`
	}
)

const (
	MessageTypeChat          = "message"
	MessageTypeConnect       = "connect"
	MessageTypeDisconnect    = "disconnect"
	MessageTypeFriendReq     = "friend_req"
	MessageTypeFriendAccept  = "friend_accept"
	MessageTypeFriendRemove  = "friend_remove"
	MessageTypeBlocked       = "blocked"
)