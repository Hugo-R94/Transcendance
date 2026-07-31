package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Comment struct {
	gorm.Model

	Comment      string    `gorm:"type:text" json:"comment"`
	CommentTitle string    `json:"comment_title"`
	Rating       float64   `json:"rating"`
	Likes        int       `gorm:"default:0" json:"likes"`
	Dislikes     int       `gorm:"default:0" json:"dislikes"`
	UserID       uuid.UUID `json:"user_id"`
	GameID       uint64    `json:"game_id"`
	User         User      `gorm:"foreignKey:UserID;references:ID"`
	Game         Game      `gorm:"foreignKey:GameID;references:AppID"`
}
