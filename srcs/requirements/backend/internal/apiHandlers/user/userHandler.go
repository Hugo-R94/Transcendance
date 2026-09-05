package user

import (
	"gorm.io/gorm"
)

type (
	UserHandler struct {
		db *gorm.DB
	}
)
