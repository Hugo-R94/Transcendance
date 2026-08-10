package user

import (
	"net/http"
	"strconv"
	"strings"
	"log"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AddGameToList(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.POST("/addToList", h.addToList)
}

func (h *UserHandler) addToList(c *gin.Context) {
	// 1. Récupération de l'ID utilisateur
	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
		return
	}

	var userID uuid.UUID
	switch v := idRaw.(type) {
	case uuid.UUID:
		userID = v
	case string:
		var err error
		userID, err = uuid.Parse(v)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Format d'ID utilisateur invalide"})
			return
		}
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format d'ID utilisateur inconnu"})
		return
	}

	// 2. Extraction des Query Params (?appID=...&list=...)
	appIDStr := c.Query("appID")
	targetList := strings.ToLower(c.Query("list"))	

	if appIDStr == "" || targetList == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Les paramètres 'appID' et 'list' sont requis"})
		return
	}

	appID, err := strconv.ParseUint(appIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "L'appID doit être un entier valide"})
		return
	}

	// 3. Vérification rapide de l'existence du jeu
	var count int64
	if err := h.db.Model(&models.Game{}).Where("app_id = ?", appID).Count(&count).Error; err != nil || count == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jeu introuvable"})
		return
	}

	// Détermination de la table cible selon le paramètre
	var targetTable string
	switch targetList {
	case "likes", "like":
		targetTable = "user_liked_games"
		targetList = "likes"
	case "dislikes", "dislike":
		targetTable = "user_disliked_games"
		targetList = "dislikes"
	case "wishlist":
		targetTable = "user_wishlisted_games"
		targetList = "wishlist"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Type de liste invalide. Valeurs acceptées: 'likes', 'dislikes', 'wishlist'"})
		return
	}

	// 4. Nettoyage rapide en SQL pur des AUTRES listes (évite les verrous GORM)
	allTables := map[string]string{
		"likes":    "user_liked_games",
		"dislikes": "user_disliked_games",
		"wishlist": "user_wishlisted_games",
	}

	for key, tableName := range allTables {
		if key != targetList {
			h.db.Exec("DELETE FROM "+tableName+" WHERE user_id = ? AND game_app_id = ?", userID, appID)
		}
	}

	// 5. Action Toggle sur la table cible
	var existingCount int64
	h.db.Table(targetTable).Where("user_id = ? AND game_app_id = ?", userID, appID).Count(&existingCount)

	actionTaken := ""
	if existingCount > 0 {
		// Le jeu y était déjà -> Suppression (Toggle OFF)
		h.db.Exec("DELETE FROM "+targetTable+" WHERE user_id = ? AND game_app_id = ?", userID, appID)
		actionTaken = "removed"
	} else {
		// Ajout
		h.db.Exec("INSERT INTO "+targetTable+" (user_id, game_app_id) VALUES (?, ?) ON CONFLICT DO NOTHING", userID, appID)
		actionTaken = "added"
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Opération effectuée avec succès",
		"app_id":  appID,
		"list":    targetList,
		"action":  actionTaken,
	})
}

func GetUserGameList(router *gin.RouterGroup, db *gorm.DB) {
	h := &UserHandler{db: db}
	router.GET("/GameList", h.getUserGameListHandler)
}
func (h *UserHandler) getUserGameListHandler(c *gin.Context) {
    var userID uuid.UUID

    // 1. Détermination du userID (Query Param `userid` vs Utilisateur connecté)
    targetUserIDQuery := c.Query("userid")

    if targetUserIDQuery != "" {
        // Option A: Un `userid` est fourni dans les query params (?userid=...)
        parsedID, err := uuid.Parse(targetUserIDQuery)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Format d'ID utilisateur en paramètre invalide"})
            return
        }
        userID = parsedID
    } else {
        // Option B: Pas de paramètre -> On récupère l'ID du user connecté via le token/contexte
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

    // 2. Extraction du paramètre obligatoire ?list=...
    targetList := strings.ToLower(c.Query("list"))
    if targetList == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Le paramètre 'list' est requis (likes, dislikes, wishlist)"})
        return
    }

    var joinTable string
    switch targetList {
    case "likes", "like":
        joinTable = "user_liked_games"
    case "dislikes", "dislike":
        joinTable = "user_disliked_games"
    case "wishlist":
        joinTable = "user_wishlisted_games"
    default:
        c.JSON(http.StatusBadRequest, gin.H{"error": "Type de liste invalide. Valeurs acceptées: 'likes', 'dislikes', 'wishlist'"})
        return
    }

    // 3. Pagination
    const pageSize = 15
    page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
    if err != nil || page < 1 {
        page = 1
    }

    // 4. Construction de la requête filtrée sur la table de jointure du user
    db := h.db.Model(&models.Game{}).
        Where("games.app_id IN (SELECT game_app_id FROM "+joinTable+" WHERE user_id = ?)", userID)

    // Filtre par Genre (optionnel)
    genre := c.Query("genre")
    if genre != "" {
        db = db.Where(
            "games.app_id IN (?)",
            h.db.
                Table("genre_games").
                Select("game_app_id").
                Joins("JOIN genres ON genres.id = genre_games.genre_id").
                Where("genres.name = ?", genre),
        )
    }

    // Tri par champ (optionnel, app_id par défaut)
    orderBy := c.DefaultQuery("orderBy", "app_id")
    switch orderBy {
    case "release_date_asc":
        db = db.Order("Date ASC")
    case "release_date_desc":
        db = db.Order("Date DESC")
    case "rating_asc":
        db = db.Order("steam_score ASC")
    case "rating_desc":
        db = db.Order("steam_score DESC")
    case "most_played":
        db = db.Order("TotalReviews DESC")
    case "less_played":
        db = db.Order("TotalReviews ASC")
    case "name_asc":
        db = db.Order("Name ASC")
    case "name_desc":
        db = db.Order("Name DESC")
    default:
        db = db.Order("app_id ASC")
    }

    // 5. Décompte du nombre total de jeux dans la liste demandée
    var total int64
    if err := db.Count(&total).Error; err != nil {
        log.Printf("[ERROR] Count user games error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors du décompte des jeux"})
        return
    }

    // 6. Récupération des jeux paginés
    var games []models.Game
    err = db.
        Limit(pageSize).
        Offset((page - 1) * pageSize).
        Find(&games).Error

    if err != nil {
        log.Printf("[ERROR] Get user games error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la récupération des jeux"})
        return
    }

    // 7. Construction du JSON de réponse
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