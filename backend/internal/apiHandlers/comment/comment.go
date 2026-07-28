package comment

import (
	"log"
	"net/http"
	"strconv"
	"github.com/google/uuid"
	"fmt"
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
	rawUserID, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	var currentUserID uuid.UUID

	// Conversion du type récupéré depuis le contexte
	switch v := rawUserID.(type) {
	case uuid.UUID:
		currentUserID = v
	case string:
		parsed, err := uuid.Parse(v)
		if err == nil {
			currentUserID = parsed
		}
	default:
		// Tente une conversion en string puis parse UUID
		parsed, err := uuid.Parse(fmt.Sprintf("%v", v))
		if err == nil {
			currentUserID = parsed
		}
	}

	if currentUserID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "UUID utilisateur invalide",
		})
		return
	}

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		log.Printf("[ERROR] Invalid comment body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format de requête invalide",
		})
		return
	}

	// Assignation de l'UUID extrait du token
	comment.UserID = currentUserID
	log.Printf("👉 Commentaire posté par UserID: %s sur GameID: %d", comment.UserID.String(), comment.GameID)

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
        Preload("User", func(db *gorm.DB) *gorm.DB {
            // Sélectionne uniquement ID et Username pour la sécurité et les perfs
            return db.Select("id, username") 
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