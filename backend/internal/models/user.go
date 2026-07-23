package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type (
	User struct {
		Id               uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		Email            string         `gorm:"uniqueIndex;typevarchar(250)" json:"email"`
		Username         string         `gorm:"uniqueIndex;typevarchar(20)" json:"username"`
		PassHash         string         `gorm:"type:varchar(60);not null" json:"-"`
		RefreshTokenHash string         `json:"-"`
		CreatedAt        time.Time      `json:"-"`
		UpdatedAt        time.Time      `json:"-"`
		DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	}

	RegisterRequest struct {
		Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8,max=60"`
	}

	LoginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	LoginResponse struct {
		Token            string `json:"token"`
		ExpiresIn        int    `json:"expires_in"`
		RefreshToken     string `json:"refresh_token"`
		RefreshExpiresIn int    `json:"refresh_expires_in"`
	}
)
