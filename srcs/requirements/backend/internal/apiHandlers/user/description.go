package user

import (
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DTO pour recevoir la nouvelle description
type UpdateDescriptionRequest struct {
	Description string `json:"description"`
}

// GET /profil/description
func (h *UserHandler) getDescription(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User id missing",
		})
		return
	}
	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var user models.User
	if err := h.db.Select("description").Where("id = ? AND deleted_at IS NULL", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"description": user.Description,
	})
}

// POST /profil/description
func (h *UserHandler) setDescription(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User id missing",
		})
		return
	}
	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	var req UpdateDescriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid JSON body",
		})
		return
	}

	// Mise à jour de la description en BDD
	if err := h.db.Model(&models.User{}).Where("id = ?", id).Update("description", req.Description).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update description",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Description updated successfully",
		"description": req.Description,
	})
}

// Enregistrement des routes Gin
func UserDescriptionRoutes(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.GET("/profil/description", h.getDescription)
	router.POST("/profil/description", h.setDescription)
}