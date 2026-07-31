package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	User struct {
		ID               uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		Email            string         `gorm:"uniqueIndex;typevarchar(250)" json:"email"`
		Username         string         `gorm:"uniqueIndex;typevarchar(20)" json:"username"`
		PassHash         string         `gorm:"type:varchar(60);not null" json:"-"`
		RefreshTokenHash string         `json:"-"`
		CreatedAt        time.Time      `json:"-"`
		UpdatedAt        time.Time      `json:"-"`
		DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
		Description		 string 		` json:"description"`
		Title_1			 string
		Title_2			 string
	}

	RegisterRequest struct {
		Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8,max=60"`
	}

	UserProfileResponse struct {
		Username    string `json:"username"`
		Description string ` json:"description"`
		Title1      string `json:"title_1"`
		Title2      string `json:"title_2"`
	}
	
	LoginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	// Used for login and refresh
	TokenResponse struct {
		Token            string `json:"token"`
		ExpiresIn        int    `json:"expires_in"`
		RefreshToken     string `json:"refresh_token"`
		RefreshExpiresIn int    `json:"refresh_expires_in"`
	}

	RefreshRequest struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	TokenClaims struct {
		ID string `json:"id"`
		jwt.RegisteredClaims
	}
)
