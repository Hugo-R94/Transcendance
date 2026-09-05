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
		DescriptionFr         string         `gorm:"type:text" json:"descriptionFr"`
		DescriptionEs         string         `gorm:"type:text" json:"descriptionEs"`
		DescriptionAr         string         `gorm:"type:text" json:"descriptionAr"`
		Header_image_link     string         `gorm:"type:varchar(500)" json:"header_image_link"`
		Background_image_link string         `gorm:"type:varchar(500)" json:"background_image_link"`
		Owners_string         string         `gorm:"type:varchar(255)" json:"owners_string"`
		Developers            []Developer    `gorm:"many2many:developer_games;" json:"developers,omitempty"`
		Publishers            []Publisher    `gorm:"many2many:publisher_games;" json:"publishers,omitempty"`
		Genres                []Genre        `gorm:"many2many:genre_games;" json:"genres,omitempty"`
		ComingSoon            bool           `json:"coming_soon"`
		Date                  time.Time      `json:"date"`
		TotalReviews          uint64         `json:"total_reviews"`
		SteamScore            float64        `json:"steam_score"`
		Comments              []Comment      `gorm:"foreignKey:GameID" json:"comments,omitempty"`
		CreatedAt             time.Time      `json:"-"`
		UpdatedAt             time.Time      `json:"-"`
		DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
		
	}

	Developer struct {
		gorm.Model
		Name  string `gorm:"primary_key;uniqueIndex"`
		Games []Game `gorm:"many2many:developer_games"`
	}

	Publisher struct {
		gorm.Model
		Name  string `gorm:"primary_key;uniqueIndex"`
		Games []Game `gorm:"many2many:publisher_games"`
	}

	Genre struct {
		ID        string `gorm:"primary_key;uniqueIndex;type:varchar(255)" json:"id"`
		Name      string `gorm:"type:varchar(255);uniqueIndex" json:"description"`
		NameFr    string `gorm:"type:varchar(255)" json:"name_fr"`
		NameEs    string `gorm:"type:varchar(255)" json:"name_es"`
		NameAr    string `gorm:"type:varchar(255)" json:"name_ar"`
		Games     []Game `gorm:"many2many:genre_games"`
		CreatedAt time.Time      `json:"-"`
		UpdatedAt time.Time      `json:"-"`
		DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	}

	GetGameResponse struct {
		AppID                 uint64    `json:"appid"`
		Name                  string    `json:"name"`
		Description           string    `json:"description"`
		Header_image_link     string    `json:"header_image"`
		Background_image_link string    `json:"backg round_image"`
		ReleaseDate           time.Time	 `json:"release_date"`
		SteamScore            float64   `json:"steam_score"`
		Genres                []string  `json:"genres,omitempty"`
		Developers            []string  `json:"developers,omitempty"`
		Publishers            []string  `json:"publishers,omitempty"`
		TotalReviews          uint64    `json:"total_reviews"`
		ListState			  int  `json:"list_state"`
	}

	SteamAppdetails struct {
		Success bool     `json:"success"`
		Data    GameData `json:"data"`
	}

	SteamAppreview struct {
		Success int      `json:"success"`
		Query   QuerySum `json:"query_summary"`
	}

	QuerySum struct {
		Positive uint64 `json:"total_positive"`
		Negative uint64 `json:"total_negative"`
		Total    uint64 `json:"total_reviews"`
	}

	DateStruct struct {
		ComingSoon bool   `json:"coming_soon"`
		Date       string `json:"date"`
	}

	GameData struct {
		Name        string     `json:"name"`
		Description string     `json:"detailed_description"`
		Developers  []string   `json:"developers"`
		Publishers  []string   `json:"publishers"`
		Header      string     `json:"header_image"`
		Background  string     `json:"background_raw"`
		Genres      []Genre    `json:"genres"`
		ReleaseDate DateStruct `json:"release_date"`
	}

	SteamSpyGameResp struct {
		AppID  uint64 `json:"appid"`
		Owners string `json:"owners"`
	}
)
