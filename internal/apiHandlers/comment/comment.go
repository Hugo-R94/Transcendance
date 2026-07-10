package comment

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Hugo-R94/Transcendance/internal/models"
	"gorm.io/gorm"
)

type CommentHandler struct {
	db *gorm.DB
}

func CommentRoutes(router *gin.RouterGroup, db *gorm.DB) {
	h := &CommentHandler{
		db: db,
	}

	router.POST("/comment/post", h.commentPost)
	router.GET("/game/comment", h.commentGet)
}

// POST /comment/post
func (h *CommentHandler) commentPost(c *gin.Context) {
	var comment models.Comment

	if err := c.ShouldBindJSON(&comment); err != nil {
		log.Printf("[ERROR] Invalid comment body: %v", err)

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.db.Create(&comment).Error; err != nil {
		log.Printf("[ERROR] Create comment error: %v", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "comment created",
		"comment": comment,
	})
}

// GET /game/comment?game_id=ID
func (h *CommentHandler) commentGet(c *gin.Context) {
	gameID := c.Query("game_id")

	if gameID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing game_id",
		})
		return
	}

	var comments []models.Comment

	err := h.db.
		Where("game_id = ?", gameID).
		Order("created_at DESC").
		Find(&comments).Error

	if err != nil {
		log.Printf("[ERROR] Get comments error: %v", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"comments": comments,
	})
}