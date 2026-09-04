package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)


type (
	User struct {
		ID               uuid.UUID      `gorm:"primary_key;type:uuid;default:gen_random_uuid()" json:"id"`
		ProfilePic       string         `gorm:"type:text" json:"profile_picture"`
		Email            string         `gorm:"uniqueIndex;type:varchar(250)" json:"email"`
		Username         string         `gorm:"uniqueIndex;type:varchar(20)" json:"username"`
		PassHash         string         `gorm:"type:varchar(60);not null" json:"-"`
		RefreshTokenHash string         `gorm:"type:varchar(60)" json:"-"`
		Description      string         `gorm:"type:text" json:"description"`
		Title1           string         `gorm:"type:varchar(50)" json:"title_1"`
		Title2           string         `gorm:"type:varchar(50)" json:"title_2"`
		Comments         []Comment      `gorm:"foreignKey:AuthorID" json:"comments,omitempty"`
		LikedGames       []Game         `gorm:"many2many:user_liked_games;" json:"liked_games,omitempty"`
		DislikedGames    []Game         `gorm:"many2many:user_disliked_games;" json:"disliked_games,omitempty"`
		WishlistedGames  []Game         `gorm:"many2many:user_wishlisted_games;" json:"wishlisted_games,omitempty"`
		CreatedAt        time.Time      `json:"-"`
		UpdatedAt        time.Time      `json:"-"`
		DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
		Level			 int			`gorm:"type:int" json:"level"`
		Quest							`gorm:"embedded" json:"quest"`
	}

	RegisterRequest struct {
		Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8,max=60"`
	}

	UserProfileResponse struct {
		Username    string `json:"username"`
		Description string ` json:"description"`
		Title1      string `json:"title_1"`
		Title2      string `json:"title_2"`
		Level		int	   `json:"level"`
	}

	LoginRequest struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	// Used for login and refresh
	TokenResponse struct {
		Token            string `json:"token"`
		ExpiresIn        int    `json:"expires_in"`
		RefreshToken     string `json:"refresh_token"`
		RefreshExpiresIn int    `json:"refresh_expires_in"`
		UserID           string `json:"user_ID"`
	}

	RefreshRequest struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	TokenClaims struct {
		ID string `json:"id"`
		jwt.RegisteredClaims
	}

	Quest struct{
		ExpireAt 			time.Time	`json:"expire_at"`
		QuestType 			int			`json:"quest_type"`
		QuestRequirement 	int			`json:"quest_requirement"`
		QuestCount 			int			`json:"quest_count"`
		IsFinished 			bool		`json:"is_finished"`
		IsCollected 		bool		`json:"is_collected"`
	}

	LeaderboardLevelResponse struct{
		UserID				uuid.UUID 	`json:"user_id"`
		Username			string		`json:"username"`
		ProfilePic			string		`json:"profile_picture"`
		Level				int			`json:"level"`
	}
)
