package game

import (
	"fmt"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"html"
	"log"
	"net/http"
	"errors"
	"regexp"	
	"gorm.io/gorm/clause"
	"strconv"
	"strings"
	"time"
)

type (
	GameHandler struct {
		db *gorm.DB
	}
)

var (
	aboutHeadingRegex = regexp.MustCompile(`(?is)<h1[^>]*>\s*about the game\s*</h1>`)
	videoBlockRegex   = regexp.MustCompile(`(?is)<video.*?</video>`)
	imgTagRegex       = regexp.MustCompile(`(?is)<img[^>]*>`)
	brTagRegex        = regexp.MustCompile(`(?i)<br\s*/?>`)
	h2BlockRegex      = regexp.MustCompile(`(?is)<h2[^>]*>(.*?)</h2>`)
	tagRegex          = regexp.MustCompile(`(?s)<[^>]+>`)
	multiSpaceRegex   = regexp.MustCompile(`[ \t]+`)
	multiNewlineRegex = regexp.MustCompile(`\n{3,}`)
)

// parseDescription nettoie le HTML brut renvoyé par l'API Steam, en pur
// stdlib (regexp/strings/html), sans dépendance à un parseur HTML externe :
//   - ignore tout ce qui précède le titre "About the Game" (Digital Deluxe
//     Edition, bonus de précommande, etc.)
//   - supprime les balises purement visuelles (<img>, <video>)
//   - convertit <br> et <h2> en retours à la ligne pour garder une mise en
//     page lisible
//   - retourne du texte brut, entités HTML décodées (&amp;, &#39;, ...)
func parseDescription(rawHTML string) string {
	if strings.TrimSpace(rawHTML) == "" {
		return ""
	}

	content := rawHTML

	// On ne garde que ce qui suit le titre "About the Game"
	if loc := aboutHeadingRegex.FindStringIndex(content); loc != nil {
		content = content[loc[1]:]
	}

	// Supprime les blocs vidéo et les images (purement visuel)
	content = videoBlockRegex.ReplaceAllString(content, "")
	content = imgTagRegex.ReplaceAllString(content, "")

	// <br> -> retour à la ligne simple
	content = brTagRegex.ReplaceAllString(content, "\n")

	// <h2>titre</h2> -> \n\ntitre\n (sous-titre isolé sur sa propre ligne)
	content = h2BlockRegex.ReplaceAllStringFunc(content, func(match string) string {
		sub := h2BlockRegex.FindStringSubmatch(match)
		title := strings.TrimSpace(tagRegex.ReplaceAllString(sub[1], ""))
		return "\n\n" + title + "\n"
	})

	// Supprime toutes les balises restantes (p, span, ul, li, br déjà traité, etc.)
	content = tagRegex.ReplaceAllString(content, "")

	// Décode les entités HTML (&amp;, &#39;, &nbsp;, ...)
	content = html.UnescapeString(content)

	// Nettoie les espaces et retours à la ligne en trop
	content = multiSpaceRegex.ReplaceAllString(content, " ")
	content = multiNewlineRegex.ReplaceAllString(content, "\n\n")

	return strings.TrimSpace(content)
}

func FormatGameDate(t time.Time) string {
	// Si la date est vide (0001-01-01)
	if t.IsZero() || t.Year() <= 1 {
		return "Date inconnue"
	}

	months := map[time.Month]string{
		time.January: "janvier", time.February: "février", time.March: "mars",
		time.April: "avril", time.May: "mai", time.June: "juin",
		time.July: "juillet", time.August: "août", time.September: "septembre",
		time.October: "octobre", time.November: "novembre", time.December: "décembre",
	}

	return fmt.Sprintf("%d %s %d", t.Day(), months[t.Month()], t.Year())
}

func (h *GameHandler) gameInfoHandler(c *gin.Context) {
	appid := c.Param("appid")

	var existingGame models.Game
	err := h.db.Where("app_id = ?", appid).Preload("Genres").Preload("Developers").Preload("Publishers").First(&existingGame).Error
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

	// --- Calcul du ListState (0 par défaut) ---
	listState := 0

	if idRaw, exists := c.Get("id"); exists {
		var userID uuid.UUID
		var validUser bool

		switch v := idRaw.(type) {
		case uuid.UUID:
			userID = v
			validUser = true
		case string:
			if parsed, err := uuid.Parse(v); err == nil {
				userID = parsed
				validUser = true
			}
		}

		if validUser {
			var count int64

			// 1. Check dans la table des Likes
			h.db.Table("user_liked_games").
				Where("user_id = ? AND game_app_id = ?", userID, existingGame.AppID).
				Count(&count)

			if count > 0 {
				listState = 1
			} else {
				// 2. Check dans la table des Dislikes
				h.db.Table("user_disliked_games").
					Where("user_id = ? AND game_app_id = ?", userID, existingGame.AppID).
					Count(&count)

				if count > 0 {
					listState = -1
				} else {
					// 3. Check dans la table des Wishlists
					h.db.Table("user_wishlisted_games").
						Where("user_id = ? AND game_app_id = ?", userID, existingGame.AppID).
						Count(&count)

					if count > 0 {
						listState = 2
					}
				}
			}
		}
	}

	response := models.GetGameResponse{
		AppID:                 existingGame.AppID,
		Name:                  existingGame.Name,
		Description:           parseDescription(existingGame.Description),
		Header_image_link:     existingGame.Header_image_link,
		Background_image_link: existingGame.Background_image_link,
		ReleaseDate:           FormatGameDate(existingGame.Date),
		SteamScore:            existingGame.SteamScore / 10,
		TotalReviews:          existingGame.TotalReviews,
		ListState:             listState,
	}
	for _, genre := range existingGame.Genres {
		response.Genres = append(response.Genres, genre.Name)
	}
	for _, dev := range existingGame.Developers {
		response.Developers = append(response.Developers, dev.Name)
	}
	for _, pub := range existingGame.Publishers {
		response.Publishers = append(response.Publishers, pub.Name)
	}

	c.JSON(http.StatusOK, response)
}

func (h *GameHandler) listGamesPageHandler(c *gin.Context) {
	const pageSize = 15

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	var total int64

	db := h.db.Model(&models.Game{})

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

	orderBy := c.DefaultQuery("orderBy", "app_id")

	switch orderBy {
	case "release_date_asc":
		db = db.Where("date > ?", time.Time{})
		db = db.Order("date ASC")
	case "release_date_desc":
		db = db.Where("date > ?", time.Time{})
		db = db.Order("date DESC")
	case "rating_asc":
		db = db.Order("steam_score ASC")
	case "rating_desc":
		db = db.Order("steam_score DESC")
	case "most_played":
		db = db.Order("total_reviews DESC")
	case "less_played":
		db = db.Order("total_reviews ASC")
	case "name_asc":
		db = db.Where("name != ?", "%")
		db = db.Order("name ASC")
	case "name_desc":
		db = db.Where("name != ?", "%")
		db = db.Order("name DESC")
	default:
		db = db.Order("app_id ASC")
	}

	log.Printf("\ngenre = %v\n", genre)

	// Compte le nombre total de jeux
	if err := db.Count(&total).Error; err != nil {
		log.Printf("[ERROR] Count games error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
		return
	}

	var games []models.Game

	err = db.
		Order("app_id ASC").
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Find(&games).Error

	if err != nil {
		log.Printf("[ERROR] List games error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
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

func (h *GameHandler) searchHandler(c *gin.Context) {
	query := c.Query("q")

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing search query",
		})
		return
	}

	var games []models.Game

	err := h.db.
		Model(&models.Game{}).
		Where("name ILIKE ?", "%"+query+"%").
		Limit(15).
		Order("app_id ASC").
		Find(&games).Error

	if err != nil {
		log.Printf("[ERROR] Search games error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "something went wrong",
		})
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
		"games": response,
	})
}

type GameStats struct {
	AverageRating float64 `json:"average_rating"`
	TotalReviews  int64   `json:"total_reviews"`
}

// Transformé en méthode de GameHandler pour Gin
func (h *GameHandler) GetGameRatingStats(c *gin.Context) {
	appIDParam := c.Param("appid")
	appID, err := strconv.ParseUint(appIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "AppID invalide"})
		return
	}

	var stats GameStats

	err = h.db.Model(&models.Comment{}).
		Select("COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_reviews").
		Where("game_id = ?", appID).
		Scan(&stats).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur serveur"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *GameHandler) GetCommentsPage(c *gin.Context) {
	gameID := c.Param("id")

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	var comments []models.Comment

	err = h.db.
		Where("game_id = ?", gameID).
		Preload("Author", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, username, profile_pic, title1, title2")
		}).
		Offset(offset).
		Limit(limit).
		Find(&comments).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func CreateComment(db *gorm.DB, comment *models.Comment) error {
	return db.Create(comment).Error
}

func (h *GameHandler) optHandler(c *gin.Context) {
	log.Println("optHANDLER")
	c.JSON(http.StatusOK, gin.H{"message": "ca marche"})
}

func (h *GameHandler) VoteComment(c *gin.Context) {
	commentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment id"})
		return
	}

	idRaw, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
		return
	}

	userID, ok := idRaw.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Identifiant utilisateur invalide"})
		return
	}

	var input struct {
		Vote int `json:"vote"`
	}

	if err := c.ShouldBindJSON(&input); err != nil || input.Vote < -1 || input.Vote > 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid vote"})
		return
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		var comment models.Comment

		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&comment, "id = ?", commentID).Error; err != nil {
			return err
		}

		var existing models.CommentVote
		result := tx.Where(
			"user_id = ? AND comment_id = ?",
			userID, commentID,
		).FirstOrCreate(&existing)

		oldVote := 0
		if result.Error == nil {
			oldVote = existing.Vote
		} else if result.Error != gorm.ErrRecordNotFound {
			return result.Error
		}

		// Toggle : même vote => suppression
		newVote := input.Vote
		if oldVote == input.Vote {
			newVote = 0
		}

		// Supprime ou crée/modifie le vote
		switch {
		case oldVote != 0 && newVote == 0:
			if err := tx.Delete(&existing).Error; err != nil {
				return err
			}

		case oldVote == 0 && newVote != 0:
			if err := tx.Create(&models.CommentVote{
				UserID:    userID,
				CommentID: commentID,
				Vote:      newVote,
			}).Error; err != nil {
				return err
			}

		case oldVote != 0 && newVote != 0:
			if err := tx.Model(&existing).Update("vote", newVote).Error; err != nil {
				return err
			}
		}

		// Mise à jour des compteurs
		if oldVote != newVote {
			updates := map[string]interface{}{
				"likes":    gorm.Expr("likes + ?", likeDelta(newVote)-likeDelta(oldVote)),
				"dislikes": gorm.Expr("dislikes + ?", likeDelta(-newVote)-likeDelta(-oldVote)),
			}

			if err := tx.Model(&comment).Updates(updates).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("[ERROR] VoteComment: %v", err)

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to process vote",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote updated"})
}

func likeDelta(vote int) int {
	if vote == 1 {
		return 1
	}
	return 0
}



func GetGameInfo(router *gin.RouterGroup, db *gorm.DB) {
	h := &GameHandler{db: db}
	log.Println("gamerouter")

	router.GET("/search", h.searchHandler)
	router.GET("/games", h.listGamesPageHandler)
	router.GET("/games/:appid/comments", h.GetCommentsPage)
	router.GET("/:appid/rating", h.GetGameRatingStats) // Déclaré AVANT /:appid

	router.GET("/:appid", h.gameInfoHandler)
	router.OPTIONS("/:appid", h.optHandler)

	router.POST("comment/:id/vote", h.VoteComment)
}
