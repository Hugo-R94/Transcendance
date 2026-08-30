package apigambling

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *GamblingHandler) leaderboard(c *gin.Context) {
	var leaderboard []models.GameScore

	result := h.db.
		Preload("User").
		Order("final_score DESC").
		Limit(15).
		Find(&leaderboard)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't find leaderboard",
		})
		log.Printf("Couldn't find leaderboard: %v", result.Error)
		return
	}

	response := make([]models.LeaderboardResponse, 0, len(leaderboard))

	for _, score := range leaderboard {
		response = append(response, models.LeaderboardResponse{
			UserID:     score.UserID,
			Username:   score.User.Username,
			ProfilePic: score.User.ProfilePic,
			FinalScore: score.FinalScore,
		})
	}

	c.JSON(http.StatusOK, response)
}
