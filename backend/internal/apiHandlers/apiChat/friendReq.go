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

func (h *ChatHandler) friendRequest(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var req models.FriendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).
		First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User not found",
		})
		return
	}

	if id == user.ID {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Can't send friend request to yourself",
		})
		return
	}

	var count int64
	if err := h.db.
		Model(&models.UserBlock{}).
		Where("user_id = ? AND blocked_user_id = ?", user.ID, id).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send friend request",
		})
		log.Printf("[ERROR] Failed to send friend request: %v", err.Error())
		return
	}
	if count > 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Blocked",
		})
		return
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		user1id := id
		user2id := user.ID
		if err := tx.Model(models.UserBlock{}).
			Where("user_id = ? AND blocked_user_id = ?", user1id, user2id).
			Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			var block models.UserBlock
			if err := tx.Where("user_id = ? AND blocked_user_id = ?", user1id, user2id).
				First(&block).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Delete(&block).Error; err != nil {
				return err
			}
		}
		var a1 bool
		var a2 bool
		if user1id.String() > user2id.String() {
			user1id, user2id = user2id, user1id
			a1 = false
			a2 = true
		} else {
			a1 = true
			a2 = false
		}
		newConv := models.Conversation{
			User1ID:   user1id,
			User2ID:   user2id,
			Accepted1: a1,
			Accepted2: a2,
		}
		var count int64
		if err := tx.Model(&models.Conversation{}).
			Where("user1_id = ? AND user2_id = ?", user1id, user2id).
			Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return errors.New("duplicate")
		}
		return tx.Create(&newConv).Error
	})
	if err != nil {
		if err.Error() == "duplicate" {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Already sent a friend request",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to send friend request",
			})
			log.Printf("[ERROR] Failed to send friend request: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Friend request sent",
	})
}

func FriendReq(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.POST("/friend_request", h.friendRequest)
}
