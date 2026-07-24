package models


import (
	"gorm.io/gorm"
	"github.com/google/uuid"
)

type Comment struct {
	gorm.Model

	GameID       uint64 `json:"gameID"`
	UserID       uuid.UUID `json:"userID"`
	Username	string `json:"username"`
	
	Comment      string `json:"comment"`
	CommentTitle string `json:"commentTitle"`
	Rating       float64    `json:"rating"`

	Likes        int    `json:"likes"`
	Dislikes     int    `json:"dislikes"`
}