package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentVoteUp struct {
	ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_user_vote" json:"user_id"`
	CommentID uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_user_vote" json:"comment_id"`
	Comment   Comment        `gorm:"foreignKey:CommentID; constraint:OnDelete:CASCADE; references:ID" json:"-"`
	User      User           `gorm:"foreignKey:UserID; constraint:OnDelete:CASCADE; references:ID" json:"-"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type CommentVoteDown struct {
	ID        uuid.UUID      `gorm:"primary_key;type:uuid; default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_user_vote" json:"user_id"`
	CommentID uuid.UUID      `gorm:"type:uuid; uniqueIndex:idx_user_vote" json:"comment_id"`
	Comment   Comment        `gorm:"foreignKey:CommentID; constraint:OnDelete:CASCADE; references:ID" json:"-"`
	User      User           `gorm:"foreignKey:UserID; constraint:OnDelete:CASCADE; references:ID" json:"-"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type CommentVoteRequest struct {
	Vote int `json:"vote" binding:"required"`
}
