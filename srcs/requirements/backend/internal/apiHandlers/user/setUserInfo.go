package user

import (
	"errors"
	"net/http"
	"strings"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func updateInfo(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		rawUserID, exists := c.Get("id")

		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Non autorisé",
			})
			return
		}

		var params struct {
			Username    string  `json:"username"`
			Mail        string  `json:"mail"`
			OldPassword *string `json:"old_password"`
			Password    *string `json:"password"`
		}

		if err := c.ShouldBindJSON(&params); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Données invalides",
			})
			return
		}

		params.Username = strings.TrimSpace(params.Username)
		params.Mail = strings.TrimSpace(params.Mail)

		if params.Username == "" || params.Mail == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Le nom d'utilisateur et l'adresse e-mail sont obligatoires",
			})
			return
		}

		if len(params.Username) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Le nom d'utilisateur est trop long",
			})
			return
		}

		if len(params.Mail) > 100 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "L'adresse e-mail est trop longue",
			})
			return
		}

		hasOldPassword :=
			params.OldPassword != nil &&
			strings.TrimSpace(*params.OldPassword) != ""

		hasNewPassword :=
			params.Password != nil &&
			strings.TrimSpace(*params.Password) != ""

		if hasOldPassword != hasNewPassword {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "L'ancien et le nouveau mot de passe sont obligatoires pour modifier le mot de passe",
			})
			return
		}

		if hasNewPassword && len(*params.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Le nouveau mot de passe doit contenir au moins 8 caractères",
			})
			return
		}

		var user models.User

		err := db.
			Where("id = ? AND deleted_at IS NULL", rawUserID).
			First(&user).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Utilisateur introuvable",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erreur lors de la récupération de l'utilisateur",
			})
			return
		}

		var usernameExists int64

		db.Model(&models.User{}).
			Where(
				"username = ? AND id <> ? AND deleted_at IS NULL",
				params.Username,
				rawUserID,
			).
			Count(&usernameExists)

		if usernameExists > 0 {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Ce nom d'utilisateur est déjà utilisé",
			})
			return
		}

		var emailExists int64

		db.Model(&models.User{}).
			Where(
				"email = ? AND id <> ? AND deleted_at IS NULL",
				params.Mail,
				rawUserID,
			).
			Count(&emailExists)

		if emailExists > 0 {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Cette adresse e-mail est déjà utilisée",
			})
			return
		}

		if hasNewPassword {

			if err := bcrypt.CompareHashAndPassword(
				[]byte(user.PassHash),
				[]byte(*params.OldPassword),
			); err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Ancien mot de passe incorrect",
				})
				return
			}

			newHash, err := bcrypt.GenerateFromPassword(
				[]byte(*params.Password),
				bcrypt.DefaultCost,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Impossible de sécuriser le nouveau mot de passe",
				})
				return
			}

			user.PassHash = string(newHash)
		}

		user.Username = params.Username
		user.Email = params.Mail

		if err := db.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Impossible de modifier les informations",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Informations mises à jour",
		})
	}
}

func SetUserInfo(
	publicGroup *gin.RouterGroup,
	protectedGroup *gin.RouterGroup,
	db *gorm.DB,
) {
	protectedGroup.PUT(
		"/updateInformation",
		updateInfo(db),
	)
}
