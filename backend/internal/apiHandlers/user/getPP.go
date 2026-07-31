package user

import (
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func(h *UserHandler) sendPic(c *gin.Context) {
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
		return
	}
	
	var user models.User
	
	if err := h.db.Where("ID = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID DB",
		})
		return
	}
	

	c.File(user.ProfilePic)
	// c.JSON(http.StatusOK, gin.H{
	// 	"message": "success",
	// })
}


func GetPP(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.GET("/getPP", h.sendPic)
}
