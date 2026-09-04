package models

import (
	"time"

	"github.com/google/uuid"
)

type CommentVote struct {
	ID        uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex:idx_user_comment" json:"user_id"`
	CommentID uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex:idx_user_comment" json:"comment_id"`
	Comment   Comment        `gorm:"foreignKey:CommentID;references:ID" json:"-"`
	User      User            `gorm:"foreignKey:UserID;references:ID" json:"-"`
	Vote      int            `gorm:"type:int;not null" json:"vote"`
	CreatedAt time.Time      `json:"-"`
	UpdatedAt time.Time      `json:"-"`
	}
