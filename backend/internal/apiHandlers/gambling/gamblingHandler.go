package gambling

import (
	"gorm.io/gorm"
)

type (
	GamblingHandler struct {
		db *gorm.DB
	}
)
