package comment

import (
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"log"
	"net/http"
)

func (h *CommentHandler) deleteCom(c *gin.Context) {
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var req models.CommentDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err,
		})
		return
	}

	var toDelete models.Comment
	if err := h.db.Where("author_id = ? AND game_id = ?", id, req.GameID).
		Preload("VotesUp").
		Preload("VotesDown").
		First(&toDelete).
		Unscoped().
		Delete(&toDelete).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Comment not found",
			})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Could not delete comment",
			})
			log.Printf("[ERROR] Could not delete comment: %v", err)
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Comment deleted",
	})
}

func DeleteComment(router *gin.RouterGroup, db *gorm.DB) {
	h := &CommentHandler{
		db: db,
	}
	router.DELETE("/delete", h.deleteCom)
}
