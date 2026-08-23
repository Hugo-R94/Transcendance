package utils

import (
	"net/http"
	"strings"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func invalidTokenResponse(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "Invalid Token",
	})
	c.Abort()
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		// Dev uniquement : accepter aussi ?token=...
		if authHeader == "" {
			queryToken := c.Query("token")
			if queryToken != "" {
				authHeader = "Bearer " + queryToken
			}
		}

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Missing token",
			})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		claims := &models.TokenClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (any, error) {
			return JwtSecret, nil
		}, jwt.WithValidMethods([]string{"HS256"}))
		if err != nil || token == nil || !token.Valid {
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
		c.Set("id", userID)
		c.Next()
	}
}
