package user

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type (
	UserHandler struct {
		db *gorm.DB
	}

	RegisterRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	RegisterResponse struct {
		Id    uuid.UUID `json:"id"`
		Email string    `json:"email"`
	}
)

func (h *UserHandler) register(c *gin.Context) {
	var request RegisterRequest
	//Check if the request is correctly formated
	err_format := c.ShouldBindJSON(&request)
	if err_format != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err_format,
		})
		return
	}
	var existingUser models.User
	//Check if the email is already registered
	err_exist := h.db.Where("email = ?", request.Email).First(&existingUser).Error
	if err_exist == nil {
		//User already exist
		c.JSON(http.StatusConflict, gin.H{
			"error": "email already used on another account",
		})
		return
	} else if err_exist != gorm.ErrRecordNotFound {
		//Database error
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "database error",
		})
		log.Printf("[ERROR] Database error: %v", err_exist)
		return
	}
	//Hash user password
	hashedPass, err_pass := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err_pass != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "password hashing failed",
		})
		log.Printf("[ERROR] Password hashing failed: %v", err_pass)
		return
	}
	//Creating new user
	user := models.User{
		Email:    request.Email,
		PassHash: string(hashedPass),
	}
	//Adding the new user in the database
	err_create := h.db.Create(&user).Error
	if err_create != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create a new user",
		})
		log.Printf("[ERROR] Create on User error: %v", err_create)
		return
	}
	//Creating valid response to request
	response := RegisterResponse{
		Id:    user.Id,
		Email: user.Email,
	}
	c.JSON(http.StatusCreated, response)
}

func RegisterUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method register
	h := &UserHandler{db: db}
	router.POST("/register", h.register)
}
