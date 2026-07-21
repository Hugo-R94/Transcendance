package models

import (
	"time"

	"gorm.io/gorm"
)

type (
	Game struct {
		AppID                 uint64         `gorm:"primary_key;uniqueIndex" json:"app_id"`
		Name                  string         `gorm:"index" json:"name"`
		Description           string         `gorm:"type:text" json:"description"`
		Header_image_link     string         `gorm:"type:varchar(500)" json:"header_image_link"`
		Background_image_link string         `gorm:"type:varchar(500)" json:"background_image_link"`
		Owners_string         string         `gorm:"type:varchar(255)" json:"owners_string"`
		Developers            []*Developer   `gorm:"many2many:developer_games;" json:"developpers,omitempty"`
		Publishers            []*Publisher   `gorm:"many2many:publisher_games;" json:"publishers,omitempty"`
		Comments              []Comment      `gorm:"foreignKey:GameID" json:"comments,omitempty"`
		CreatedAt             time.Time      `json:"-"`
		UpdatedAt             time.Time      `json:"-"`
		DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
	}

	// Gameshort struct{
	// 	gorm.Model
	// 	AppID                 uint64       `gorm:"primary_key;uniqueIndex"`
	// 	Name                  string       `gorm:"index"`
	// 	Header_image_link     string       `gorm:"type:varchar(500)"`
	// }

	Developer struct {
		gorm.Model
		Name  string  `gorm:"primary_key;unqueIndex"`
		Games []*Game `gorm:"many2many:developer_games"`
	}

	Publisher struct {
		gorm.Model
		Name  string  `gorm:"primary_key;unqueIndex"`
		Games []*Game `gorm:"many2many:publisher_games"`
	}

	GetGameResponse struct {
		AppID                 uint64 `json:"appid"`
		Name                  string `json:"name"`
		Description           string `json:"description"`
		Header_image_link     string `json:"header_image"`
		Background_image_link string `json:"background_image"`
	}

	SteamAppdetails struct {
		Success bool     `json:"success"`
		Data    GameData `json:"data"`
	}

	GameData struct {
		Name        string   `json:"name"`
		Description string   `json:"detailed_description"`
		Developers  []string `json:"developers"`
		Publishers  []string `json:"publishers"`
		Header      string   `json:"header_image"`
		Background  string   `json:"background_raw"`
	}

	SteamSpyGameResp struct {
		AppID  uint64 `json:"appid"`
		Owners string `json:"owners"`
	}
)
