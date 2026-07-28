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
	var input struct {
		GameID       uint   `json:"gameID"`
		CommentTitle string `json:"commentTitle"`
		Comment      string `json:"comment"`
		Rating       int    `json:"rating"`
		UserID       uint   `json:"userID"` // Optionnel si récupéré depuis le JWT
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[ERROR] Invalid comment body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format de requête invalide",
		})
		return
	}

	// 1. Récupération du UserID (Exemple si mis dans le context par un middleware Auth)
	// userIDCtx, _ := c.Get("userID")
	// userID := userIDCtx.(uint)

	userID := input.UserID

	// 2. VÉRIFICATION STRICTE : Un user_id vaut 0 si non fourni ou non authentifié
	if userID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Utilisateur non valide ou non authentifié",
		})
		return
	}

	comment := models.Comment{
		GameID:       input.GameID,
		UserID:       userID,
		CommentTitle: input.CommentTitle,
		Comment:      input.Comment,
		Rating:       input.Rating,
	}

	// On exécute l'opération avec GORM
	res := h.db.Where(models.Comment{
		GameID: comment.GameID,
		UserID: comment.UserID,
	}).Assign(models.Comment{
		Rating:       comment.Rating,
		CommentTitle: comment.CommentTitle,
		Comment:      comment.Comment,
	}).FirstOrCreate(&comment)

	if res.Error != nil {
		log.Printf("[ERROR] Save/Update comment error: %v", res.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "impossible d'enregistrer le commentaire",
		})
		return
	}

	var responseMessage string
	if res.RowsAffected > 0 {
		responseMessage = "Commentaire publié avec succès !"
	} else {
		responseMessage = "Commentaire mis à jour avec succès !"
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"comments": comments,
		"total":    total,
	})
}