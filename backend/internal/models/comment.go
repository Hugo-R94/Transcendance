package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Comment struct {
	ID           uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
	Comment      string         `gorm:"type:text" json:"comment"`
	CommentTitle string         `gorm:"type:text" json:"comment_title"`
	Rating       float64        `gorm:"type:float" json:"rating"`
	Likes        int            `gorm:"type:int; default:0" json:"likes"`
	Dislikes     int            `gorm:"type:int; default:0" json:"dislikes"`
	UserID       uuid.UUID      `gorm:"type:uuid; constraint:onDelete:CASCADE" json:"user_id"`
	GameID       uint64         `gorm:"type:bigint" json:"game_id"`
	User         User           `gorm:"foreignKey:UserID;references:ID" json:"author"`
	Game         Game           `gorm:"foreignKey:GameID;references:AppID" json:"game"`
	CreatedAt    time.Time      `json:"-"`
	UpdatedAt    time.Time      `json:"-"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
