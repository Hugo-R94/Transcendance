package user

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Hugo-R94/Transcendance/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type (
	LoginRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	LoginResponse struct {
		Token     string    `json:"token"`
		ExpiresAt time.Time `json:"expires_at"`
		Id        string    `json:"id"`
		Email     string    `json:"email"`
	}

	CustomClaims struct {
		Id    uuid.UUID `json:"id"`
		Email string    `json:"email"`
		jwt.RegisteredClaims
	}
)

func (h *UserHandler) login(c *gin.Context) {
	var request LoginRequest
	//Check if the request is correctly formated
	err_format := c.ShouldBindJSON(&request)
	if err_format != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	var existingUser models.User
	//Check if this email is registered
	err_exist := h.db.Where("email = ?", request.Email).First(&existingUser).Error
	if err_exist == gorm.ErrRecordNotFound {
		//User does not exist
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	} else if err_exist != nil {
		//Database error
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "database error",
		})
		log.Printf("[ERROR] Database error: %v", err_exist)
		return
	}

	//Check if the password is valid
	err_pass := bcrypt.CompareHashAndPassword([]byte(existingUser.PassHash), []byte(request.Password))
	if err_pass != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	//Creating JWT
	secret := os.Getenv("JWT_SECRET")
	expiresAt := time.Now().Add(24 * time.Hour)
	customClaims := CustomClaims{
		Id:    existingUser.Id,
		Email: existingUser.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, customClaims)
	signedString, err_sign := token.SignedString([]byte(secret))
	if err_sign != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "token generation failed",
		})
		log.Printf("[ERROR] Token generation failed: %v", err_sign)
	}
	//Creating valid response to request
	response := LoginResponse{
		Token:     signedString,
		ExpiresAt: expiresAt,
		Id:        existingUser.Id.String(),
		Email:     existingUser.Email,
	}
	c.JSON(http.StatusOK, response)
}

func LoginUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method login
	h := &UserHandler{db: db}
	router.POST("/login", h.login)
}
