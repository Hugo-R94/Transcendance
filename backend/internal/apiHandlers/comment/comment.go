package comment

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CommentHandler struct {
	db *gorm.DB
}

func CommentRoutes(router *gin.RouterGroup, db *gorm.DB) {
	h := &CommentHandler{
		db: db,
	}

	router.POST("/post", h.commentPost)
	router.GET("/:gameID/comments", h.commentGet)
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

func atoi(value string) int {
	i, _ := strconv.Atoi(value)
	return i
}
// GET /game/comment?game_id=ID
func (h *CommentHandler) commentGet(c *gin.Context) {
	gameID := c.Param("gameID")

	var comments []models.Comment
	var total int64

	h.db.
		Model(&models.Comment{}).
		Where("game_id = ?", gameID).
		Count(&total)

	limit := atoi(c.DefaultQuery("limit", "5"))
	page := atoi(c.DefaultQuery("page", "1"))

	offset := (page - 1) * limit

	err := h.db.
		Where("game_id = ?", gameID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error

	if err != nil {
		c.JSON(500, gin.H{
			"error": "something went wrong",
		})
		return
	}

	c.JSON(200, gin.H{
		"comments": comments,
		"total": total,
	})
}