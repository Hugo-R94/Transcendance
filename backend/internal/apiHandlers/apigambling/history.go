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
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	offset, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || offset < 1 {
		offset = 1
	}
	offset--
	var history []models.GameScore
	result := h.db.Where("user_id", id).
		Order("date ASC").
		Limit(15).
		Offset(offset).
		Find(&history)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusOK, gin.H{
			"message": "this user has no match history",
		})
		return
	}
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
	h := &GamblingHandler{db: db}
	router.GET("/history", h.history)
}
