package apichat

import (
	"gorm.io/gorm"
)

type (
	ChatHandler struct {
		db *gorm.DB
	}
)
