package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Comment struct {
    gorm.Model

    GameID       uint64    `gorm:"not null;uniqueIndex:idx_user_game" json:"gameID"`
    UserID       uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_user_game" json:"userID"`
    
    // 👈 Relation vers User (foreignKey pointe vers UserID de Comment)
    User         User      `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`

    Comment      string    `gorm:"type:text" json:"comment"`
    CommentTitle string    `json:"commentTitle"`
    Rating       float64   `gorm:"not null" json:"rating"`

    Likes    int `gorm:"default:0" json:"likes"`
    Dislikes int `gorm:"default:0" json:"dislikes"`
}