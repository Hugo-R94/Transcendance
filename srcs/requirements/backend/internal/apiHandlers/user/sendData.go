package user 

import (
 	"fmt"
	"bytes"
    "os"
	"encoding/json"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/http"
	
	"github.com/wneessen/go-mail"
)

func sendDataToUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		rawUserID, exists := c.Get("id")
		id := rawUserID.(uuid.UUID)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Non autorisé",
			})
			return
		}

		var user models.User
		if err := db.Preload(clause.Associations).First(&user, "id = ?", id).Error; err != nil {
			// handle error
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "not send data",
			})
			return
		}

		var conversations []models.Conversation
		if err := db.
			Preload("Messages").
			Where("user1_id = ? OR user2_id = ?", id, id).
			Find(&conversations).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Messages notfound",
			})
			return
			// handle error
		}
		
		user.Conversations = conversations 


		jsonData, err := json.MarshalIndent(user, "", "  ")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Impossible de générer l'export JSON",
			})
			return
		}

		from := os.Getenv("SUPPORT_MAIL")
		password := os.Getenv("SUPPORT_MAIL_PASWD")

		if from == "" || password == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Configuration SMTP manquante",
			})
			return
		}

		to := user.Email

		message := mail.NewMsg()

		if err := message.From(from); err != nil {
			fmt.Println("Erreur From:", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erreur configuration email",
			})
			return
		}

		if err := message.To(to); err != nil {
			fmt.Println("Erreur To:", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Adresse email invalide",
			})
			return
		}

		message.Subject("Export de vos données personnelles")

		body := `Bonjour,

Conformément à notre politique de protection des données personnelles et à vos droits prévus par le RGPD, nous vous transmettons les données personnelles associées à votre compte.

Vous trouverez dans ce message une pièce jointe contenant un export de vos données au format JSON.

Ce fichier contient les données que nous avons associées à votre compte et que nous sommes en mesure de vous fournir dans le cadre de votre demande d'accès à vos données personnelles.

Nous vous invitons à conserver ce fichier de manière sécurisée, car il peut contenir des informations personnelles.

Cordialement,
L'équipe support`

		message.SetBodyString(mail.TypeTextPlain, body)

		if err := message.AttachReader(
			"mes_donnees_personnelles.json",
			bytes.NewReader(jsonData),
		); err != nil {

			fmt.Println("Erreur pièce jointe:", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Impossible de créer la pièce jointe",
			})
			return
		}

		client, err := mail.NewClient(
			"smtp.gmail.com",
			mail.WithTLSPortPolicy(mail.TLSMandatory),
			mail.WithSMTPAuth(mail.SMTPAuthAutoDiscover),
			mail.WithUsername(from),
			mail.WithPassword(password),
		)

		if err != nil {
			fmt.Println("Erreur création client SMTP:", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Impossible de configurer le serveur email",
			})
			return
		}

		if err := client.DialAndSend(message); err != nil {
			fmt.Println("Erreur envoi email:", err)

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Impossible d'envoyer l'email",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Vos données vous ont été envoyées par email",
		})
	}
}


