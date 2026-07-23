package user

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *UserHandler) logout(c *gin.Context) {
	idRaw, exists := c.Get("id")
	if exists == false {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "User id missing",
		})
		return
	}
	id, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&models.User{}).
			Where("id = ?", id).
			Update("refresh_token_hash", "").Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to logout user",
		})
		log.Printf("[ERROR] DB error on logout: %v", err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

func LogoutUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method login
	h := &UserHandler{db: db}
	router.POST("/logout", utils.AuthMiddleware(), h.logout)
}
