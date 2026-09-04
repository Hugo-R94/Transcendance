package user

import (
	"errors"
	"net/http"
	"log"
	"fmt"
	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
	"math/rand"
)

const (
    CommentQuest = iota
    GambleQuest
)

var QuestTypes = [...]string{
    "commentQuest",
    "gambleQuest",
}

func GetMyQuest(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        rawUserID, exists := c.Get("id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Non autorisé",
            })
            return
        }

        userID, ok := rawUserID.(uuid.UUID)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Format d'ID utilisateur invalide",
            })
            return
        }

        var user models.User

        err := db.
            Where("id = ? AND deleted_at IS NULL", userID).
            First(&user).Error

        if err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                c.JSON(http.StatusNotFound, gin.H{
                    "error": "Utilisateur introuvable",
                })
                return
            }

            log.Printf("Erreur récupération utilisateur: %v", err)

            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Erreur serveur",
            })
            return
        }

        err = updateQuest(db, &user)
        if err != nil {
            log.Printf("Erreur mise à jour quête: %v", err)

            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Impossible de mettre à jour la quête",
            })
            return
        }

        c.JSON(http.StatusOK, user.Quest)
    }
}

func updateQuest(db *gorm.DB, user *models.User) error {
    now := time.Now()

    if !user.Quest.ExpireAt.IsZero() && !user.Quest.ExpireAt.Before(now) {
        return nil
    }

    user.Quest = models.Quest{
        ExpireAt:         now.Add(24 * time.Hour),
        QuestType:        rand.Intn(2),
        QuestRequirement: rand.Intn(3) + 1,
        QuestCount:       0,
        IsFinished:       false,
        IsCollected:      false,
    }

    return db.Save(user).Error
}

func ExecQuest(db *gorm.DB, user *models.User, tryquest string) error {
	log.Printf(
		"[QUEST] user=%s type=%d quest=%s count=%d/%d finished=%v",
		user.ID,
		user.QuestType,
		tryquest,
		user.QuestCount,
		user.QuestRequirement,
		user.IsFinished,
	)

	if user.QuestType < 0 || user.QuestType >= len(QuestTypes) {
		return fmt.Errorf("invalid quest type: %d", user.QuestType)
	}

	if tryquest != QuestTypes[user.QuestType] {
		log.Printf(
			"[QUEST] mauvais type: attendu=%s reçu=%s",
			QuestTypes[user.QuestType],
			tryquest,
		)
		return nil
	}

	user.QuestCount++

	if user.QuestCount >= user.QuestRequirement {
		user.Level++
		user.IsFinished = true
		log.Printf("[QUEST] user %s completed quest", user.ID)
	}

	if err := db.Save(user).Error; err != nil {
		return fmt.Errorf("failed to save quest progress: %w", err)
	}

	log.Printf(
		"[QUEST] sauvegardée: count=%d/%d level=%d finished=%v",
		user.QuestCount,
		user.QuestRequirement,
		user.Level,
		user.IsFinished,
	)

	return nil
}


func GetLevelLeaderboard(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var leaderboard []models.User

		result := db.
			Order("level DESC").
			Limit(15).
			Find(&leaderboard)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Couldn't find leaderboard",
			})
			log.Printf("Couldn't find leaderboard: %v", result.Error)
			return
		}

		response := make([]models.LeaderboardLevelResponse, 0, len(leaderboard))

		for _, user := range leaderboard {
			response = append(response, models.LeaderboardLevelResponse{
				UserID:     user.ID,
				Username:   user.Username,
				ProfilePic: user.ProfilePic,
				Level:      user.Level,
			})
		}

		c.JSON(http.StatusOK, response)
	}
}