package apichat

import (
	"errors"
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) friendAccept(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if exists == false {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User id missing",
		})
		return
	}
	user1id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var req models.FriendAccept
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	user2id, err := uuid.Parse(req.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		if user1id.String() > user2id.String() {
			user1id, user2id = user2id, user1id
		}
		var count int64
		if err := tx.Where("user1_id = ? AND user2_id = ?", user1id, user2id).Model(&models.Conversation{}).Count(&count).Error; err != nil {
			return err
		}
		if count < 1 {
			return errors.New("not found")
		}
		var conv models.Conversation
		if err := tx.Where("user1_id = ? AND user2_id = ?", user1id, user2id).Model(&models.Conversation{}).First(&conv).Error; err != nil {
			return err
		}
		if req.Accept {
			conv.Accepted = true
			return tx.Save(&conv).Error
		}
		return tx.Delete(&conv).Error
	})
	if err != nil {
		if err.Error() == "not found" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Friend request not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to accept/reject friend request",
			})
			log.Printf("[ERROR] Failed to accept/reject friend request: %v", err.Error())
		}
		return
	}
	if req.Accept {
		c.JSON(http.StatusCreated, gin.H{
			"message": "Friend request successfully accepted",
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Friend reqest successfully rejected",
	})
}

func FriendAccept(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.PUT("/friend_accept", utils.AuthMiddleware(), h.friendAccept)
}
