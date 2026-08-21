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
	if !exists {
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

	var convs []models.Conversation

	if err := h.db.
		Where(
			"user1_id = ? OR user2_id = ?",
			userid,
			userid,
		).
		Preload("User1", func(db *gorm.DB) *gorm.DB {
			return db.Select(
				"id",
				"username",
				"profile_pic",
			)
		}).
		Preload("User2", func(db *gorm.DB) *gorm.DB {
			return db.Select(
				"id",
				"username",
				"profile_pic",
			)
		}).
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.
				Order("created_at DESC").
				Limit(500)
		}).
		Find(&convs).Error; err != nil {

		log.Printf(
			"[ERROR] Could not find conversations: %v",
			err,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not find conversations",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"conversations": convs,
	})
}

func (h *ChatHandler) readConv(c *gin.Context) {

	convID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid conversation ID",
		})
		return
	}

	var conv models.Conversation

	if err := h.db.
		First(&conv, "id = ?", convID).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Conversation not found",
			})
			return
		}

		log.Printf(
			"[ERROR] Could not find conversation: %v",
			err,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not find conversation",
		})

		return
	}
}

func GetConvs(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{
		db: db,
	}

	router.GET(
		"/convs",
		utils.AuthMiddleware(),
		h.fetchConvs,
	)

	// router.PUT(
	// 	"/convs/:id/read",
	// 	utils.AuthMiddleware(),
	// 	h.readConv,
	// )
}