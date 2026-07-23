package models


import (
	"gorm.io/gorm"
)

type CommentVote struct {
	gorm.Model

	UserID    uint64 `json:"userID"`
	CommentID uint64 `json:"commentID"`

	Vote int `json:"vote"`
}