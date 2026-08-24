package apichat

import (
	"log"
	"net/http"
	"time"
	"github.com/Hugo-R94/Transcendance/backend/internal/chat"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}	

	userID, err := uuid.Parse(req.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	targetID := userID // on garde l'ID original avant le swap pour la notif

	sortedID, sortedUserID := id, userID
	if sortedID.String() > sortedUserID.String() {
		sortedID, sortedUserID = sortedUserID, sortedID
	}

	var count int64
	if err := h.db.
		Model(&models.Conversation{}).
		Where("user1_id = ? AND user2_id = ?", sortedID, sortedUserID).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not unfriend user"})
		log.Printf("[ERROR] Could not count in DB: %v", err)
		return
	}
	if count < 1 {
		c.JSON(http.StatusConflict, gin.H{"error": "Not friend with this user"})
		return
	}

	if err = h.db.Transaction(func(tx *gorm.DB) error {
		var conv models.Conversation
		if err := tx.Where("user1_id = ? AND user2_id = ?", sortedID, sortedUserID).
			First(&conv).Error; err != nil {

			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("not friend")
			}

			return err
		}
		return tx.Unscoped().Select("Messages").Delete(&conv).Error
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not unfriend user"})
		log.Printf("[ERROR] Could not delete friend user: %v", err)
		return
	}

	// notif au client ciblé pour qu'il refresh sa liste d'amis
	h.hub.Notify <- chat.Notification{
		TargetID: targetID,
		Message: models.Message{
			SenderID: id,
			Text:     "friend_remove",
			Time:     time.Now(),
			Type:     models.MessageTypeUnfriend,
		},
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Friend deleted successfully"})
}

func UnFriendReq(router *gin.RouterGroup, db *gorm.DB, hub *chat.Hub) {
	h := &ChatHandler{db: db, hub: hub}
	router.DELETE("/unfriend", h.unFriend)
}
