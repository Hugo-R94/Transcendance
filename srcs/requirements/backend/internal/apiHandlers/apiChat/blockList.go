package apichat

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/chat"
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
	if err := h.db.
		Where("username = ?", req.Username).
		First(&user).Error; err != nil {
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

	// On garde les IDs originaux pour la notification
	targetID := user.ID
	senderID := id

	// IDs triés uniquement pour accéder à la conversation
	sortedID := id
	sortedUserID := user.ID

	if sortedID.String() > sortedUserID.String() {
		sortedID, sortedUserID = sortedUserID, sortedID
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		// Vérifie si l'utilisateur est déjà bloqué
		var count int64

		newBlock := models.UserBlock{
			UserID:        id,
			BlockedUserID: user.ID,
		}

		if err := tx.Model(&models.UserBlock{}).
			Where(
				"user_id = ? AND blocked_user_id = ?",
				newBlock.UserID,
				newBlock.BlockedUserID,
			).
			Count(&count).Error; err != nil {
			return err
		}

		if count > 0 {
			return errors.New("duplicate")
		}

		// Cherche la conversation existante
		if err := tx.Model(&models.Conversation{}).
			Where(
				"user1_id = ? AND user2_id = ?",
				sortedID,
				sortedUserID,
			).
			Count(&count).Error; err != nil {
			return err
		}

		// Si une conversation existe, on la supprime avec ses messages
		if count > 0 {
			var conv models.Conversation

			if err := tx.
				Where(
					"user1_id = ? AND user2_id = ?",
					sortedID,
					sortedUserID,
				).
				First(&conv).Error; err != nil {
				return err
			}

			if err := tx.
				Unscoped().
				Select("Messages").
				Delete(&conv).Error; err != nil {
				return err
			}
		}

		// Création du blocage
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

			log.Printf(
				"[ERROR] Failed to block a user: %v",
				err,
			)
		}

		return
	}

	// Notification envoyée à l'utilisateur bloqué
	h.hub.Notify <- chat.Notification{
		TargetID: targetID,
		Message: models.Message{
			SenderID: senderID,
			Text:     "friend_blocked",
			Time:     time.Now(),
			Type:     models.MessageTypeBlocked,
		},
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User blocked",
	})
}

func BlockUser(router *gin.RouterGroup, db *gorm.DB, hub *chat.Hub) {
	h := &ChatHandler{
		db:  db,
		hub: hub,
	}

	router.POST("/block", h.blockUser)
}