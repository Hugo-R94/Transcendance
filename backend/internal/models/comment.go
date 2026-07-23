package models


import (
	"gorm.io/gorm"
)

type Comment struct {
	gorm.Model

	GameID       uint64 `json:"gameID"`
	UserID       uint64 `json:"userID"`

	Comment      string `json:"comment"`
	CommentTitle string `json:"commentTitle"`
	Rating       float64    `json:"rating"`

	Likes        int    `json:"likes"`
	Dislikes     int    `json:"dislikes"`
}