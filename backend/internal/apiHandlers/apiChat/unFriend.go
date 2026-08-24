package apichat

import (
	"log"
	"net/http"
	"errors"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) unFriend(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User ID missing",
		})
		return
	}

	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

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

	user1ID := id
	user2ID := userID

	if user1ID.String() > user2ID.String() {
		user1ID, user2ID = user2ID, user1ID
	}

	var conversationID uuid.UUID

	err = h.db.Transaction(func(tx *gorm.DB) error {
		var conv models.Conversation

		if err := tx.
			Where(
				"user1_id = ? AND user2_id = ?",
				user1ID,
				user2ID,
			).
			First(&conv).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("not friend")
			}

			return err
		}

		conversationID = conv.ID

		// IMPORTANT :
		// Les messages ont une FK vers conversations.
		// Il faut donc les supprimer AVANT la conversation.
		if err := tx.
			Unscoped().
			Where(
				"conversation_id = ?",
				conv.ID,
			).
			Delete(&models.Message{}).Error; err != nil {
			return err
		}

		// Ensuite seulement supprimer la conversation.
		if err := tx.
			Unscoped().
			Delete(&conv).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		if err.Error() == "not friend" {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Not friend with this user",
			})
			return
		}

		log.Printf(
			"[ERROR] Could not unfriend user: %v",
			err,
		)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not unfriend user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Friend deleted successfully",
		"conversation_id": conversationID,
	})
}

func UnFriendReq(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.DELETE("/unfriend", h.unFriend)
}
	