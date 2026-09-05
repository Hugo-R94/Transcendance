package apichat

import (
	"gorm.io/gorm"
	"github.com/Hugo-R94/Transcendance/backend/internal/chat"
)

type ChatHandler struct {
	db  *gorm.DB
	hub *chat.Hub
}
