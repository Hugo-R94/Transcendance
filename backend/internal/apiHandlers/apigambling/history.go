package apigambling

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// history récupère l'historique d'un utilisateur donné via son UUID.
//
// GET /api/v1/history/:userID
// GET /api/v1/history/:userID?page=2
func (h *GamblingHandler) history(c *gin.Context) {
	userIDRaw := c.Param("userID")

	userID, err := uuid.Parse(userIDRaw)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	const limit = 15
	offset := (page - 1) * limit

	var history []models.GameScore

	result := h.db.
		Where("user_id = ?", userID).
		Order("time DESC").
		Limit(limit).
		Offset(offset).
		Find(&history)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't find match history",
		})
		log.Printf("Couldn't find match history: %v", result.Error)
		return
	}

	c.JSON(http.StatusOK, history)
}


func (h *GamblingHandler) myHistory(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID not found",
		})
		return
	}

	userID, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	const limit = 15
	offset := (page - 1) * limit

	var history []models.GameScore

	result := h.db.
		Where("user_id = ?", userID).
		Order("time DESC").
		Limit(limit).
		Offset(offset).
		Find(&history)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't find match history",
		})
		log.Printf("Couldn't find match history: %v", result.Error)
		return
	}

	c.JSON(http.StatusOK, history)
}


func GetHistory(router *gin.RouterGroup, db *gorm.DB) {
	h := &GamblingHandler{
		db: db,
	}

	// Historique de l'utilisateur connecté
	router.GET("/history", h.myHistory)

	// Historique d'un utilisateur spécifique
	router.GET("/history/:userID", h.history)
}
