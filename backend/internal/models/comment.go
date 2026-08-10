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
	Author       string	   `json:"author"`
	User         User      `gorm:"foreignKey:UserID;references:ID"`
	Title1		 string	   `json:"title_1"`
	Title2		 string	   `json:"title_2"`
	Game         Game      `gorm:"foreignKey:GameID;references:AppID"`
	ProfilePic   string         `gorm:"typevarchar(100)" json:"profile_picture"`
	
}
