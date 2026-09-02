package support

import (
	"fmt"
	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
    "os"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
    "net/http"	
	"github.com/wneessen/go-mail"
)

type SupportHandler struct {
	db *gorm.DB
}

func (h *SupportHandler) mailSupport(c *gin.Context) {
	fmt.Printf("mail support\n")
	rawUserID, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Non autorisé"})
		return
	}
	var user models.User
	err := h.db.Model(&models.User{}).
		Select("username", "email", "id").
		Where("id = ? AND deleted_at IS NULL", rawUserID).
		First(&user).Error


	var body struct {
		Message string `json:"message"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "invalid body"})
		return
	}

	body.Message = "UserId : " + user.ID.String() +  "\n" +
		"Email : "+ user.Email + "\n" +
		"Username : " + user.Username + "\n\n" + "\"" + body.Message + "\""

	from := os.Getenv("SUPPORT_MAIL")
	password := os.Getenv("SUPPORT_MAIL_PASWD")
	to := "supportclick42@gmail.com"

	message := mail.NewMsg()

	if err := message.From(from); err != nil {
	    fmt.Println("Erreur From:", err)
	    return
	}

	if err := message.To(to); err != nil {
	    fmt.Println("Erreur To:", err)
	    return
	}

	message.Subject("Ticket Support [" + user.ID.String() + "]")
	message.SetBodyString(mail.TypeTextPlain, body.Message)

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


func PostSupport(router *gin.RouterGroup, db *gorm.DB) {
	h := &SupportHandler{
		db: db,
	}

	fmt.Printf("post support\n")
	router.POST("", h.mailSupport)
}