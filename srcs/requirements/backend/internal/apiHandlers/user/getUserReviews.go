package user

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GetUserComments enregistre la route GET /reviews
func GetUserComments(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.GET("/reviews", h.getUserCommentsHandler)
}

func (h *UserHandler) getUserCommentsHandler(c *gin.Context) {
	var userID uuid.UUID

	// 1. Détermination du userID (Query Param `user` vs Utilisateur connecté)
	targetUserQuery := c.Query("user")

	if targetUserQuery != "" {
		// Option A: Un `user` est fourni dans les query params (?user=...)
		parsedID, err := uuid.Parse(targetUserQuery)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format d'ID utilisateur en paramètre invalide"})
			return
		}
		userID = parsedID
	} else {
		// Option B: Pas de paramètre -> On récupère l'ID du user connecté via le contexte
		idRaw, exists := c.Get("id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
			return
		}

		switch v := idRaw.(type) {
		case uuid.UUID:
			userID = v
		case string:
			var err error
			userID, err = uuid.Parse(v)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Format d'ID utilisateur invalide dans le jeton"})
				return
			}
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Format d'ID utilisateur inconnu"})
			return
		}
	}

	// 2. Pagination
	const pageSize = 10 // Vous pouvez ajuster la taille de page souhaitée
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	// 3. Construction de la requête pour les commentaires de l'utilisateur
	dbQuery := h.db.Model(&models.Comment{}).Where("author_id = ?", userID)

	// 4. Décompte du nombre total de commentaires pour cet utilisateur
	var total int64
	if err := dbQuery.Count(&total).Error; err != nil {
		log.Printf("[ERROR] Count user comments error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors du décompte des commentaires"})
		return
	}

	// 5. Récupération des commentaires paginés
	// Optionnel : Vous pouvez précharger le jeu associé si vous avez besoin des infos du jeu (ex: `.Preload("Game")`)
	var comments []models.Comment
	err = dbQuery.
		Preload("Author", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, username, profile_pic, title1, title2")
		}).
		Order("created_at DESC"). // Plus récents en premier par défaut
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Find(&comments).Error

	if err != nil {
		log.Printf("[ERROR] Get user comments error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la récupération des commentaires"})
		return
	}

	// 6. Réponse JSON structurée
	c.JSON(http.StatusOK, gin.H{
		"comments":    comments,
		"total":       total,
		"page":        page,
		"total_pages": (total + int64(pageSize) - 1) / int64(pageSize),
	})
}
