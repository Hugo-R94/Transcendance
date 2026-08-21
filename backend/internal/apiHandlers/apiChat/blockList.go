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

func (h *ChatHandler) blockUser(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var req models.BlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User not found",
		})
		return
	}

	if id == user.ID {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Can't block yourself",
		})
		return
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		newBlock := models.UserBlock{
			UserID:        id,
			BlockedUserID: user.ID,
		}
		var count int64
		if err := tx.Model(&models.UserBlock{}).
			Where("user1_id = ? AND user2_id = ?", newBlock.UserID, newBlock.BlockedUserID).
			Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return errors.New("duplicate")
		}
		return tx.Create(&newBlock).Error
	})
	if err != nil {
		if err.Error() == "duplicate" {
			c.JSON(http.StatusConflict, gin.H{
				"error": "This user is already blocked",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to block this user",
			})
			log.Printf("[ERROR] Failed to block a user: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "User blocked",
	})
}

func BlockUser(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.POST("/block", h.blockUser)
}
