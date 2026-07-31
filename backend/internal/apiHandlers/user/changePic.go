package user

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *UserHandler) uploadPic(c *gin.Context) {
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

	file, err := c.FormFile("profile_picture")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing file",
		})
		return
	}

	const maxSize = 100 * 1024 * 1024
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File too large",
		})
		return
	}

	if !isValidImageType(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid file type",
		})
		return
	}

	fileDir := fmt.Sprintf("/uploads/users/%s", id.String())
	if err := os.MkdirAll(fileDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not save file",
		})
		log.Printf("[ERROR] Couldn't create dir: %v", err.Error())
		return
	}

	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	filePath := fmt.Sprintf("%s/%s", fileDir, fileName)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not save file",
		})
		log.Printf("[ERROR] Couldn't save uploaded file: %v", err.Error())
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&models.User{}).
			Where("id = ?", id).
			Update("profile_picture", filePath).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not save file",
		})
		log.Printf("[ERROR] DB error on changePP: %v", err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Profile picture saved successfully",
	})
}

func isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := map[string]bool{".jpg": true, ".png": true, ".jpeg": true, ".gif": true}
	return validExts[ext]
}

func ChangePP(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.POST("/changePP", h.login)
}
