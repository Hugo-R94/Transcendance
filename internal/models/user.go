package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	User struct {
		gorm.Model
		Id        uuid.UUID `gorm:"primary_key;type:uuid;default:gen_random_uuid()"`
		Email     string    `gorm:"uniqueIndex"`
		PassHash  string    `json:"-"`
		CreatedAt time.Time
		UpdatedAt time.Time
	}
)
