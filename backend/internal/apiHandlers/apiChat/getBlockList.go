package apichat

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) fetchBlockList(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var count int64
	if err := h.db.Model(&models.UserBlock{}).
		Where("user_id = ?", id).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not find blocked users",
		})
		return
	}
	if count < 1 {
		c.JSON(http.StatusOK, gin.H{
			"message": "this user has no blocked user",
		})
		return
	}

	var blockedUsers []models.UserBlock
	if err := h.db.Model(&models.UserBlock{}).
		Where("user_id = ?", id).
		Preload("BlockedUserID", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "profile_pic")
		}).
		Find(&blockedUsers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not find blocked users",
		})
		log.Printf("[ERROR] Could not find blocked users: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"block_list": blockedUsers,
	})
}

func GetBlockList(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.GET("/blocklist", h.fetchBlockList)
}
