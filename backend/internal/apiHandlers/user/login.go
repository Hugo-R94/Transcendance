package user

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *UserHandler) login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credential",
		})
		return
	}
	if !utils.CheckPasswordHash(req.Password, user.PassHash) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credential",
		})
		return
	}

	token, err := utils.GenerateJWT(user.Id.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
		log.Printf("[ERROR] Login Failed (tokenGen): %v", err.Error())
		return
	}
	refreshToken, err := utils.GenerateRefreshToken(user.Id.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
		log.Printf("[ERROR] Login Failed (refreshTokenGen): %v", err.Error())
		return
	}
	refreshTokenHash, err := utils.HashReToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
		log.Printf("[ERROR] Login Failed (refreshTokenHash): %v", err.Error())
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		user.RefreshTokenHash = refreshTokenHash
		return tx.Save(&user).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
		log.Printf("[ERROR] Login Failed (db save error refreshTokenHash): %v", err.Error())
		return
	}

	resp := models.LoginResponse{
		Token:            token,
		ExpiresIn:        3600,
		RefreshToken:     refreshToken,
		RefreshExpiresIn: 604800,
	}
	c.JSON(http.StatusOK, resp)
}

func LoginUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method login
	h := &UserHandler{db: db}
	router.POST("/login", h.login)
}
