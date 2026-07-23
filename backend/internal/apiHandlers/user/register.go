package user

import (
	"log"
	"net/http"
	"strings"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *UserHandler) register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		log.Printf("[ERROR] Password hashing failed: %v", err.Error())
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		newUser := models.User{
			Email:    req.Email,
			Username: req.Username,
			PassHash: hashedPassword,
		}
		return tx.Create(&newUser).Error
	})
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Email or username already registered",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create user",
			})
			log.Printf("[ERROR] Failed to create user: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
	})
}

func RegisterUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method register
	h := &UserHandler{db: db}
	router.POST("/register", h.register)
}
