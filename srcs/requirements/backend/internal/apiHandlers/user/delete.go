package user

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/wneessen/go-mail"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (h *UserHandler) deleteUser(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var temp models.User
	if err := h.db.First(&temp, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not delete user",
		})
		log.Printf("[ERROR] delete user error: %v", err)
		return
	}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.First(&user, "id = ?", id).Error; err != nil {
			return err
		}

		var conversationIDs []uuid.UUID
		if err := tx.Model(&models.Conversation{}).
			Where("user1_id = ? OR user2_id = ?", id, id).
			Pluck("id", &conversationIDs).Error; err != nil {
			return err
		}

		if len(conversationIDs) > 0 {
			if err := tx.Unscoped().
				Where("conversation_id IN ?", conversationIDs).
				Delete(&models.Message{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().
				Where("id IN ?", conversationIDs).
				Delete(&models.Conversation{}).Error; err != nil {
				return err
			}
		}

		if err := tx.Unscoped().
			Select(clause.Associations).
			Delete(&user).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not delete user",
		})
		log.Printf("[ERROR] Could not delete user: %v", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User deleted",
	})

	from := os.Getenv("SUPPORT_MAIL")
	password := os.Getenv("SUPPORT_MAIL_PASWD")
	to := temp.Email

	message := mail.NewMsg()

	if err := message.From(from); err != nil {
		fmt.Println("Erreur From:", err)
		return
	}

	if err := message.To(to); err != nil {
		fmt.Println("Erreur To:", err)
		return
	}

	message.Subject("Data deletion")
	message.SetBodyString(mail.TypeTextPlain, "Your data has been deleted successfully")

	client, err := mail.NewClient(
		"smtp.gmail.com",
		mail.WithTLSPortPolicy(mail.TLSMandatory),
		mail.WithSMTPAuth(mail.SMTPAuthAutoDiscover),
		mail.WithUsername(from),
		mail.WithPassword(password),
	)

	if err != nil {
		fmt.Println("Erreur création client:", err)
		return
	}

	if err := client.DialAndSend(message); err != nil {
		fmt.Println("Erreur envoi:", err)
		return
	}
}

func DeleteUser(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{
		db: db,
	}
	router.DELETE("/deleteProfile", h.deleteUser)
}
