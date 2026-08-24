package gambling

import (
	"errors"
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *GamblingHandler) history(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var count int64
	if err := h.db.
		Model(&models.GameScore{}).
		Where("user_id = ?", id).
		Count(&count).Error; err != nil {

	}
}

func GetHistoty(router *gin.RouterGroup, db *gorm.DB) {
	h := &GamblingHandler{db: db}
	router.GET("/history", h.history)
}
