package user

import (
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func invalidTokenResponse(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "Invalid token",
	})
}

func (h *UserHandler) refresh(c *gin.Context) {
	req := &models.RefreshRequest{}
	if err := c.ShouldBindJSON(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	claims := &models.TokenClaims{}
	token, err := jwt.ParseWithClaims(req.RefreshToken, claims, func(token *jwt.Token) (any, error) {
		return utils.RefreshSecret, nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil || token == nil {
		invalidTokenResponse(c)
		return
	}

	if claims.ID == "" {
		invalidTokenResponse(c)
		return
	}

	userID, err := uuid.Parse(claims.ID)
	if err != nil {
		invalidTokenResponse(c)
		return
	}

	var user models.User
	if err := h.db.Where("id = ?", userID).First(&user).Error; err != nil {
		invalidTokenResponse(c)
		return
	}
	if !utils.CheckTokenHash(req.RefreshToken, user.RefreshTokenHash) {
		invalidTokenResponse(c)
		return
	}
	genNewTokens(c, user, h)
}

func RefreshUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method login
	h := &UserHandler{db: db}
	router.POST("/refresh", h.refresh)
}
