package apigambling

import (
	"gorm.io/gorm"
)

type (
	GamblingHandler struct {
		db *gorm.DB
	}
)
