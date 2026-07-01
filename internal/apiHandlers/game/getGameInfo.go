package game

import (
	"log"
	"net/http"

	"github.com/Hugo-R94/Transcendance/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type (
	GameHandler struct {
		db *gorm.DB
	}
)

func (h *GameHandler) gameInfoHandler(c *gin.Context) {
	appid := c.Param("appid")
	var existingGame models.Game
	err := h.db.Where("app_id = ?", appid).First(&existingGame).Error
	if err == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "game not found",
		})
		return
	}
	if err != nil {
		log.Printf("[ERROR] GetGameInfo error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		return
	}
	response := models.GetGameResponse{
		AppID:                 existingGame.AppID,
		Name:                  existingGame.Name,
		Description:           existingGame.Description,
		Header_image_link:     existingGame.Header_image_link,
		Background_image_link: existingGame.Background_image_link,
	}
	c.JSON(http.StatusOK, response)
}

func GetGameInfo(router *gin.RouterGroup, db *gorm.DB) {
	h := &GameHandler{db: db}
	router.GET("/:appid", h.gameInfoHandler)
}
