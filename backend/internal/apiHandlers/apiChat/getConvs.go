package apichat

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) fetchConvs(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if exists == false {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User id missing",
		})
		return
	}
	userid, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var count int64
	if err := h.db.Model(&models.Conversation{}).
		Where("user1_id = ? OR user2_id = ?", userid, userid).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not find conversations",
		})
		log.Printf("[ERROR] Could not find conversations: %v", err)
		return
	}
	if count < 1 {
		c.JSON(http.StatusOK, gin.H{
			"message": "this user has no convs",
		})
		return
	}

	var convs []models.Conversation
	if err := h.db.Model(&models.Conversation{}).
		Where("user1_id = ? OR user2_id = ?", userid, userid).
		Preload("User1", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "profile_pic")
		}).
		Preload("User2", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "username", "profile_pic")
		}).
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC").Limit(500)
		}).
		Find(&convs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not find conversations",
		})
		log.Printf("[ERROR] Could not find conversations: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"conversations": convs,
	})
}

func GetConvs(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.GET("/convs", utils.AuthMiddleware(), h.fetchConvs)
}
