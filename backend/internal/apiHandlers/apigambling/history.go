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

	var total int64
	if err := h.db.
		Model(&models.GameScore{}).
		Where("user_id = ?", userID).
		Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't count match history",
		})
		log.Printf("Couldn't count match history: %v", err)
		return
	}

	var response []models.GameScoreResponse
	for _, score := range history {
		response = append(response, models.GameScoreResponse{
			FinalScore: score.FinalScore,
			Rank:       score.Rank,
			Time:       score.Time,
			Total:      total,
		})
	}

	c.JSON(http.StatusOK, response)
}



func GetHistory(router *gin.RouterGroup, db *gorm.DB) {
	h := &GamblingHandler{
		db: db,
	}

	router.GET("/leaderboard", h.leaderboard)
	router.GET("/history/:userID", h.history)
}
