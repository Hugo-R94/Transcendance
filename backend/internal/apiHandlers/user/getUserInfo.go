package user

import (
	"errors"
	"net/http"
	"log"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DTO de réponse
type UserProfileResponse struct {
	Username    string `json:"username"`
	Description string `json:"description"`
	Title1      string `json:"title_1"`
	Title2      string `json:"title_2"`
}

// Liste officielle des titres autorisés côté Backend
var TitleMap = map[string]string{
	"1":  "Gamer",
	"2":  "Puant",
	"3":  "Hardstuck",
	"4":  "High",
	"5":  "Lucky",
	"6":  "Endetté",
	"7":  "Master",
	"8":  "Inter",
	"9":  "New",
	"10": "Player",
}

// Helper pour récupérer le profil
func GetUserProfileByID(db *gorm.DB, userID uuid.UUID) (*UserProfileResponse, error) {
	var user models.User

	err := db.Model(&models.User{}).
		Select("username", "description", "title_1", "title_2", "ProfilePic").
		Where("id = ? AND deleted_at IS NULL", userID).
		First(&user).Error

	if err != nil {
		return nil, err
	}

	t1 := user.Title1
	if t1 == "" {
		t1 = "9"
	}

	t2 := user.Title2
	if t2 == "" {
		t2 = "10"
	}
	log.Printf("profil pic = %v\n", user.ProfilePic)
	return &UserProfileResponse{
		Username:    user.Username,
		Description: user.Description,
		Title1:      t1,
		Title2:      t2,
	}, nil
}

// Handler POST /profil/title avec VALIDATION STRICTE
func UpdateUserTitleHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rawUserID, exists := c.Get("id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Non autorisé"})
			return
		}

		userID, ok := rawUserID.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Format d'ID utilisateur invalide"})
			return
		}

		title1 := c.Query("title1")
		title2 := c.Query("title2")

		if title1 == "" && title2 == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Aucun titre fourni"})
			return
		}

		updates := make(map[string]interface{})

		// --- SÉCURITÉ : Validation de Title 1 ---
		if title1 != "" {
			if _, isValid := TitleMap[title1]; !isValid {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Titre 1 invalide ou non autorisé"})
				return
			}
			updates["title_1"] = title1
		}

		// --- SÉCURITÉ : Validation de Title 2 ---
		if title2 != "" {
			if _, isValid := TitleMap[title2]; !isValid {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Titre 2 invalide ou non autorisé"})
				return
			}
			updates["title_2"] = title2
		}

		// Mise à jour sécurisée
		err := db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la mise à jour des titres"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Titre(s) mis à jour avec succès",
			"updated": updates,
		})
	}
}

// Handlers d'affichage...
func GetUserProfileByIDHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		idParam := c.Param("id")
		userID, err := uuid.Parse(idParam)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "UUID invalide"})
			return
		}

		profile, err := GetUserProfileByID(db, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Utilisateur introuvable"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur serveur"})
			return
		}

		c.JSON(http.StatusOK, profile)
	}
}

func GetMyProfileHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rawUserID, exists := c.Get("id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Non autorisé"})
			return
		}

		userID, ok := rawUserID.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Format d'ID utilisateur invalide"})
			return
		}

		profile, err := GetUserProfileByID(db, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Utilisateur introuvable"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur serveur"})
			return
		}

		c.JSON(http.StatusOK, profile)
	}
}

func GetUserInfo(publicGroup *gin.RouterGroup, protectedGroup *gin.RouterGroup, db *gorm.DB) {
	publicGroup.GET("/profil/:id", GetUserProfileByIDHandler(db))
	protectedGroup.GET("/profil", GetMyProfileHandler(db))
	protectedGroup.POST("/profil/title", UpdateUserTitleHandler(db))
}