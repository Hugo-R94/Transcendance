package user

import (
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *UserHandler) sendPic(c *gin.Context) {
	var targetID uuid.UUID
	var err error

	// 1. On regarde si un userId est fourni dans l'URL (/getPP?userId=xxx)
	paramID := c.Query("userId")

	if paramID != "" {
		targetID, err = uuid.Parse(paramID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid userId query parameter",
			})
			return
		}
	} else {
		// 2. Sinon, fallback sur l'utilisateur connecté (via le token JWT)
		idRaw, exists := c.Get("id")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "User id missing",
			})
			return
		}

		var ok bool
		targetID, ok = idRaw.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid token user ID",
			})
			return
		}
	}

	// 3. Récupération de l'utilisateur ciblé en BDD
	var user models.User
	if err := h.db.Where("id = ?", targetID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// 4. Renvoie le fichier image de l'utilisateur ciblé
	if user.ProfilePic == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "No profile picture found"})
		return
	}

	c.File(user.ProfilePic)
}

func GetPP(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.GET("/getPP", h.sendPic)
}