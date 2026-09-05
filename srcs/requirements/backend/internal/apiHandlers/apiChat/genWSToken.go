package apichat

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *ChatHandler) genWSToken(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)
	token, err := utils.GenerateWSToken(id.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		log.Printf("[ERROR] Failed to generate token: %v", err)
		return
	}

	var wsToken models.WSToken
	wsToken.TokenString = token
	if err := h.db.Save(&wsToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save token",
		})
		log.Printf("[ERROR] Failed to save token: %v", err)
		return
	}

	resp := models.WSTokenResponse{
		Token: token,
	}
	c.JSON(http.StatusOK, resp)
}

func GenWSToken(router *gin.RouterGroup, db *gorm.DB) {
	h := &ChatHandler{db: db}
	router.GET("/wstoken", h.genWSToken)
}
