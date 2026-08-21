package apichat

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) unFriend(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var req models.UnFriendRequest
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
	if id.String() > userID.String() {
		id, userID = userID, id
	}
	var count int64
	if err := h.db.
		Where("user1_id = ? AND user2_id = ?", id, userID).
		Model(&models.Conversation{}).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		log.Printf("[ERROR] Could not count in DB: %v", err)
		return
	}
	if count < 1 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Not friend with this user",
		})
		return
	}
	if err = h.db.Transaction(func(tx *gorm.DB) error {
		var conv models.Conversation
		if err := tx.Where("user1_id = ? AND user2_id = ?", id, userID).
			First(&conv).Error; err != nil {
			return err
		}
		return tx.Unscoped().Delete(&conv).Error
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		log.Printf("[ERROR] Could not count in DB: %v", err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Friend deleted successfully",
	})
}

func UnFriendReq(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.DELETE("/unfriend", h.unFriend)
}
