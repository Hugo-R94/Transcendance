package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type (
	Comment struct {
		ID            uuid.UUID         `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		Comment       string            `gorm:"type:text" json:"comment"`
		CommentTitle  string            `gorm:"type:text" json:"comment_title"`
		Rating        float64           `gorm:"type:float" json:"rating"`
		Likes         int               `json:"likes"`
		Dislikes      int               `json:"dislikes"`
		AuthorID      uuid.UUID         `gorm:"type:uuid; uniqueIndex:idx_author_game;constraint:onDelete:CASCADE" json:"-"`
		GameID        uint64            `gorm:"type:bigint; uniqueIndex:idx_author_game" json:"game_id"`
		UserVotedUp   bool              `json:"user_voted_up"`
		UserVotedDown bool              `json:"user_voted_down"`
		VotesUp       []CommentVoteUp   `gorm:"foreignKey:CommentID; constraint:OnDelete:CASCADE" json:"-"`
		VotesDown     []CommentVoteDown `gorm:"foreignKey:CommentID; constraint:OnDelete:CASCADE" json:"-"`
		Author        User              `gorm:"foreignKey:AuthorID;references:ID; constraint:onDelete:CASCADE" json:"author"`
		Game          Game              `gorm:"foreignKey:GameID;references:AppID" json:"-"`
		CreatedAt     time.Time         `json:"-"`
		UpdatedAt     time.Time         `json:"-"`
		DeletedAt     gorm.DeletedAt    `gorm:"index" json:"-"`
	}

	CommentRequest struct {
		GameID       uint64  `json:"game_id" binding:"required"`
		Comment      string  `json:"comment" binding:"required"`
		CommentTitle string  `json:"comment_title" binding:"required"`
		Rating       float64 `json:"rating" binding:"required"`
	}

	CommentDeleteRequest struct {
		GameID uint64 `json:"game_id" binding:"required"`
	}
)
