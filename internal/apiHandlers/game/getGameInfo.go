package game

import (
	"log"
	"net/http"
    "strconv"
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

func (h *GameHandler) listGamesHandler(c *gin.Context) {
	var games []models.Game
	err := h.db.Order("id ASC").Find(&games).Error // ordre = ordre d'insertion dans la db
	if err != nil {
		log.Printf("[ERROR] ListGames error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		return
	}

	response := make([]models.GetGameResponse, 0, len(games))
	for _, g := range games {
		response = append(response, models.GetGameResponse{
			AppID:                 g.AppID,
			Name:                  g.Name,
			Description:           g.Description,
			Header_image_link:     g.Header_image_link,
			Background_image_link: g.Background_image_link,
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *GameHandler) listGamesPageHandler(c *gin.Context) {
	const pageSize = 15
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	offset := (page - 1) * pageSize

	var total int64
	if err := h.db.Model(&models.Game{}).Count(&total).Error; err != nil {
		log.Printf("[ERROR] ListGames count error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	var games []models.Game
	err = h.db.
		Order("id ASC").
		Limit(pageSize).
		Offset(offset).
		Find(&games).Error
	if err != nil {
		log.Printf("[ERROR] ListGames error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	}

	response := make([]models.GetGameResponse, 0, len(games))
	for _, g := range games {
		response = append(response, models.GetGameResponse{
			AppID:             g.AppID,
			Name:              g.Name,
			Header_image_link: g.Header_image_link,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"games":       response,
		"total":       total,
		"page":        page,
		"total_pages": (total + pageSize - 1) / pageSize,
	})
}

func GetGameInfo(router *gin.RouterGroup, db *gorm.DB) {
	h := &GameHandler{db: db}
	router.GET("", h.listGamesHandler)       // "" au lieu de "/"
	router.GET("/games", h.listGamesPageHandler)       // "" au lieu de "/"
	router.GET("/:appid", h.gameInfoHandler)
}
// func GetGameInfo(router *gin.RouterGroup, db *gorm.DB) {
// 	h := &GameHandler{db: db}
// 	router.GET("/:appid", h.gameInfoHandler)
// }	
