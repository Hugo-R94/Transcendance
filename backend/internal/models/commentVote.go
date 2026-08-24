package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentVote struct {
	ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid; constraint:onDelete:CASCADE" json:"user_id"`
	CommentID uuid.UUID      `gorm:"type:uuid; uniqueIndex; constraint:onDelete:CASCADE" json:"comment_id"`
	Comment   Comment        `gorm:"foreignKey:CommentID; references:ID" json:"-"`
	User      User           `gorm:"foreignKey:UserID; references:ID" json:"-"`
	Vote      int            `gorm:"type:int" json:"vote"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
