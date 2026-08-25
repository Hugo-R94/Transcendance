package comment

import (
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"log"
	"net/http"
	"strconv"
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
	idRaw, _ := c.Get("id")
	id := idRaw.(uuid.UUID)

	var comment models.CommentRequest
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err,
		})
		return
	}

	var responseMessage string
	err := h.db.Transaction(func(tx *gorm.DB) error {
		var existing models.Comment

		res := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("author_id = ? AND game_id = ?", id, comment.GameID).
			First(&existing)

		if res.Error == gorm.ErrRecordNotFound {
			if err := tx.Create(&models.Comment{
				AuthorID:     id,
				GameID:       comment.GameID,
				Comment:      comment.Comment,
				CommentTitle: comment.CommentTitle,
				Rating:       comment.Rating,
			}).Error; err != nil {
				return err
			}
			responseMessage = "Comment published"
		} else if res.Error == nil {
			if err := tx.Model(&existing).Updates(map[string]any{
				"comment":       comment.Comment,
				"comment_title": comment.CommentTitle,
				"rating":        comment.Rating,
			}).Error; err != nil {
				return err
			}
			responseMessage = "Comment updated"
		} else {
			return res.Error
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Couldn't save comment",
		})
		log.Printf("[ERROR] Couldn't save comment: %v", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": responseMessage,
		"comment": comment,
	})
}

func atoi(value string) int {
	i, _ := strconv.Atoi(value)
	return i
}

// GET /game/comment?game_id=ID (ou avec paramètre de route)
func (h *CommentHandler) commentGet(c *gin.Context) {
	// ⚠️ Si l'URL utilise un query param ?game_id=1, utilise c.Query("game_id")
	// Si la route est /game/comment/:gameID, c.Param("gameID") est correct.
	gameID := c.Query("game_id")
	if gameID == "" {
		gameID = c.Param("gameID")
	}

	var comments []models.Comment
	var total int64

	// 1. Compte total des commentaires pour ce jeu
	h.db.
		Model(&models.Comment{}).
		Where("game_id = ?", gameID).
		Count(&total)

	limit := atoi(c.DefaultQuery("limit", "5"))
	page := atoi(c.DefaultQuery("page", "1"))
	offset := (page - 1) * limit

	// 2. Récupération des commentaires avec Preload du User
	err := h.db.
		Preload("Author", func(db *gorm.DB) *gorm.DB {
			// Sélectionne uniquement ID et Username pour la sécurité et les perfs
			return db.Select("id, username, profile_pic, title1, title2")
		}).
		Where("game_id = ?", gameID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error

	if err != nil {
		log.Printf("[ERROR] Erreur récupération commentaires: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "impossible de récupérer les commentaires",
		})
		return
	}

	// 3. Renvoi de la réponse
	c.JSON(http.StatusOK, gin.H{
		"comments": comments,
		"total":    total,
	})
}
