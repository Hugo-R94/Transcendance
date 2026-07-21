package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type (
	User struct {
		Id           uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		Email        string         `gorm:"uniqueIndex" json:"email"`
		Username     string         `gorm:"uniqueIndex" json:"username"`
		PassHash     string         `gorm:"not null" json:"-"`
		RefreshToken string         `json:"refresh_token,omitempty"`
		CreatedAt    time.Time      `json:"-"`
		UpdatedAt    time.Time      `json:"-"`
		DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	}
)
