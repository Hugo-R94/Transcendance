package user

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func genNewTokens(c *gin.Context, user models.User, h *UserHandler) {
	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
		log.Printf("[ERROR] Login Failed (tokenGen): %v", err.Error())
		return
	}
	refreshToken, err := utils.GenerateRefreshToken(user.ID.String())
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

	resp := models.TokenResponse{
		Token:            token,
		ExpiresIn:        3600,
		RefreshToken:     refreshToken,
		RefreshExpiresIn: 604800,
		UserID:			  user.ID.String(),
	}
	c.JSON(http.StatusOK, resp)
}
