package commentVote

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *CommentHandler) voteComment(c *gin.Context) {

	commentID := c.Param("id")

	var vote models.CommentVote

	if err := c.ShouldBindJSON(&vote); err != nil {
		c.JSON(400, gin.H{"error":"invalid body"})
		return
	}


	var existing models.CommentVote

	result := h.db.
		Where(
		  "user_id = ? AND comment_id = ?",
		  vote.UserID,
		  commentID,
		).
		First(&existing)


	// L'utilisateur a déjà voté
	if result.Error == nil {

		// même vote => on retire
		if existing.Vote == vote.Vote {

			h.db.Delete(&existing)

			if vote.Vote == 1 {
				h.db.Model(&models.Comment{}).
					Where("id = ?", commentID).
					UpdateColumn("likes", gorm.Expr("likes - ?", 1))
			} else {
				h.db.Model(&models.Comment{}).
					Where("id = ?", commentID).
					UpdateColumn("dislikes", gorm.Expr("dislikes - ?", 1))
			}

			c.JSON(200, gin.H{"message":"vote removed"})
			return
		}


		// changement like -> dislike
		h.db.Model(&models.Comment{}).
			Where("id = ?", commentID).
			Updates(map[string]interface{}{
				"likes": gorm.Expr("likes - ?", 1),
				"dislikes": gorm.Expr("dislikes + ?", 1),
			})


		existing.Vote = vote.Vote
		h.db.Save(&existing)

		c.JSON(200, gin.H{"message":"vote changed"})
		return
	}


	// nouveau vote
	vote.CommentID, _ = strconv.ParseUint(commentID,10,64)

	h.db.Create(&vote)


	if vote.Vote == 1 {
		h.db.Model(&models.Comment{}).
			Where("id = ?", commentID).
			UpdateColumn(
				"likes",
				gorm.Expr("likes + ?",1),
			)
	} else {
		h.db.Model(&models.Comment{}).
			Where("id = ?", commentID).
			UpdateColumn(
				"dislikes",
				gorm.Expr("dislikes + ?",1),
			)
	}


	c.JSON(200, gin.H{"message":"vote added"})
}