package apichat

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) unBlock(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

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

	var count int64
	if err := h.db.
		Model(&models.Conversation{}).
		Where("user_id = ? AND blocked_user_id = ?", id, userID).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not unblock",
		})
		log.Printf("[ERROR] Could not count in DB: %v", err)
		return
	}
	if count < 1 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "User not Blocked",
		})
		return
	}
	if err = h.db.Transaction(func(tx *gorm.DB) error {
		var block models.UserBlock
		if err := tx.Where("user1_id = ? AND user2_id = ?", id, userID).
			First(&block).Error; err != nil {
			return err
		}
		return tx.Unscoped().Delete(&block).Error
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not unblock",
		})
		log.Printf("[ERROR] Could not delete blocked user: %v", err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "User unblocked",
	})
}

func UnBlockUser(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.DELETE("/unblock", h.unBlock)
}
