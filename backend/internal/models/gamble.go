package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	GameScore struct {
		ID           uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		UserID       uuid.UUID      `gorm:"type:uuid;index" json:"user_id"`
		User         User           `gorm:"foreignKey:UserID;references:ID" json:"user"`
		HighestScore int            `gorm:"type:int" json:"highest_score"`
		FinalScore   int            `gorm:"type:int" json:"final_score"`
		Rank         uint32         `gorm:"type:uint" json:"rank"`
		Time         time.Time      `gorm:"index" json:"time"`
		CreatedAt    time.Time      `json:"-"`
		UpdatedAt    time.Time      `json:"-"`
		DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	}
)
