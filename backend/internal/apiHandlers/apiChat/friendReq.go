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

func (h *ChatHandler) friendRequest(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if exists == false {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User id missing",
		})
		return
	}
	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
	}

	var req models.FriendRequest
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
			"error": "Can't send friend request to yourself",
		})
		return
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		user1id := id
		user2id := user.ID
		if user1id.String() > user2id.String() {
			user1id, user2id = user2id, user1id
		}
		newConv := models.Conversation{
			User1ID: user1id,
			User2ID: user2id,
		}
		var count int64
		if err := tx.Where("user1_id = ? AND user2_id = ?", user1id, user2id).Model(&models.Conversation{}).Count(&count).Error; err != nil {
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
		"message": "Friend request sent successfully",
	})
}

func FriendReq(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.POST("/friend_request", utils.AuthMiddleware(), h.friendRequest)
}
