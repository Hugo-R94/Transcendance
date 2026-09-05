package apichat

import (
	"errors"
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) unBlock(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var req models.UnBlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	userID, err := uuid.Parse(req.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	if id == userID {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Cannot unblock yourself",
		})
		return
	}

	var block models.UserBlock

	err = h.db.
		Where(
			"user_id = ? AND blocked_user_id = ?",
			id,
			userID,
		).
		First(&block).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusConflict, gin.H{
			"error": "User not blocked",
		})
		return
	}

	if err != nil {
		log.Printf("[ERROR] Could not find block: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not check block",
		})
		return
	}

	if err := h.db.
		Unscoped().
		Delete(&block).Error; err != nil {

		log.Printf("[ERROR] Could not delete block: %v", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not unblock",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User unblocked",
	})
}

func UnBlockUser(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.DELETE("/unblock", h.unBlock)
}